import { NextResponse } from "next/server";
import { scrapeTwitchByGameDirect } from "@/lib/scrapers/twitch-scraper";
import { scrapeKickByCategory } from "@/lib/scrapers/kick-scraper";
import { GAME_STREAM_QUERIES } from "@/lib/scrapers/stream-helpers";

const isDev = process.env.NODE_ENV === "development";

// Only alphanumeric + hyphens, max 32 chars — matches all real game IDs
const VALID_GAME_ID = /^[a-z0-9-]{1,32}$/i;

function getGameCategory(gameId: string): string | undefined {
  const category = GAME_STREAM_QUERIES[gameId];
  if (category) return category;
  if (gameId.startsWith("diablo")) return GAME_STREAM_QUERIES["diablo4"];
  if (gameId.startsWith("poe"))
    return GAME_STREAM_QUERIES["poe"] ?? GAME_STREAM_QUERIES["poe2"];
  if (gameId.startsWith("cod"))
    return GAME_STREAM_QUERIES["cod-bo6"] ?? GAME_STREAM_QUERIES["cod"];
  return undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawGameId = searchParams.get("game");

  // Validate gameId format before using it
  if (rawGameId !== null && !VALID_GAME_ID.test(rawGameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  const gameId = rawGameId;

  try {
    if (isDev) {
      console.log(`📡 Fetching live streams${gameId ? ` for ${gameId}` : ""}...`);
    }

    let twitchStreams: any[] = [];
    let kickStreams: any[] = [];
    let hasErrors = false;

    const gameCategory = gameId ? getGameCategory(gameId) : undefined;

    if (gameId && gameCategory) {
      const [twitchResult, kickResult] = await Promise.allSettled([
        scrapeTwitchByGameDirect(gameCategory),
        scrapeKickByCategory(gameCategory),
      ]);

      if (twitchResult.status === "fulfilled") {
        twitchStreams = twitchResult.value;
        if (isDev) console.log(`✅ Twitch: ${twitchStreams.length} streams`);
      } else {
        hasErrors = true;
        console.error(`Twitch scrape error for ${gameId}:`, twitchResult.reason);
      }

      if (kickResult.status === "fulfilled") {
        kickStreams = kickResult.value;
        if (isDev) console.log(`✅ Kick: ${kickStreams.length} streams`);
      } else {
        hasErrors = true;
        console.error(`Kick scrape error for ${gameId}:`, kickResult.reason);
      }
    }

    return NextResponse.json(
      {
        twitch: twitchStreams,
        kick: kickStreams,
        total: twitchStreams.length + kickStreams.length,
        gameId: gameId ?? undefined,
        timestamp: new Date().toISOString(),
        // Expose partial-failure flag without leaking internal error details
        ...(hasErrors && { partial: true }),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
        },
      }
    );
  } catch (error) {
    // Log full error server-side only
    console.error("Error fetching live streams:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch live streams",
        twitch: [],
        kick: [],
        total: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
