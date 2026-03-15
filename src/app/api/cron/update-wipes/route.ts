import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // --- Secret validation ---
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // Fail closed: if the secret is not configured, refuse all requests
    console.error("[cron] CRON_SECRET env var is not set — refusing request");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Base URL validation (prevent SSRF) ---
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    console.error("[cron] NEXT_PUBLIC_BASE_URL env var is not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    const parsed = new URL(baseUrl);
    if (parsed.protocol !== "https:") {
      throw new Error("Only HTTPS base URLs are permitted");
    }
  } catch {
    console.error("[cron] Invalid NEXT_PUBLIC_BASE_URL:", baseUrl);
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  // --- Run wipe refresh ---
  try {
    const games = [
      "rust",
      "tarkov",
      "tarkov-arena",
      "poe",
      "poe2",
      "fortnite",
      "diablo4",
      "diablo3",
      "diablo2",
      "diabloimmortal",
      "pubg",
    ];

    const results = await Promise.allSettled(
      games.map(async (game) => {
        const response = await fetch(
          `${baseUrl}/api/wipes/${game}?refresh=true`,
        );
        const data = await response.json();
        return { game, success: response.ok, data };
      }),
    );

    const summary = results.map((result, index) => ({
      game: games[index],
      status: result.status,
      ...(result.status === "fulfilled"
        ? { data: result.value }
        : { error: "Fetch failed" }), // Don't leak internal error details
    }));

    return NextResponse.json({
      success: true,
      message: "Wipe data update triggered",
      timestamp: new Date().toISOString(),
      results: summary,
    });
  } catch (error) {
    // Log full error server-side, return generic message to client
    console.error("[cron] Job failed:", error);
    return NextResponse.json(
      { error: "Failed to update wipe data" },
      { status: 500 },
    );
  }
}
