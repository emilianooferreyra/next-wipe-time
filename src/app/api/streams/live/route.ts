import { NextResponse } from "next/server";
import { scrapeTwitchLiveStreams } from "@/lib/scrapers/twitch-scraper";
import { scrapeKickLiveStreams } from "@/lib/scrapers/kick-scraper";
import { getStreamersForGame } from "@/lib/streamers";

export interface LiveStreamsResponse {
  twitch: any[];
  kick: any[];
  total: number;
  gameId?: string;
  timestamp: string;
  debug?: {
    twitchError?: string;
    kickError?: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("game");

  try {
    console.log(`📡 Fetching live streams${gameId ? ` for ${gameId}` : ""}...`);

    let twitchStreams: any[] = [];
    let kickStreams: any[] = [];
    let twitchError: string | undefined;
    let kickError: string | undefined;

    if (gameId) {
      // Scrape both platforms independently with error handling
      try {
        console.log(`🎮 Scraping Twitch for ${gameId}...`);
        twitchStreams = await scrapeTwitchLiveStreams([]);
        console.log(`✅ Twitch: Found ${twitchStreams.length} streams`);
      } catch (err) {
        twitchError = err instanceof Error ? err.message : "Unknown error";
        console.error(`❌ Twitch error:`, err);
      }

      try {
        console.log(`🎮 Scraping Kick for ${gameId}...`);
        kickStreams = await scrapeKickLiveStreams([]);
        console.log(`✅ Kick: Found ${kickStreams.length} streams`);
      } catch (err) {
        kickError = err instanceof Error ? err.message : "Unknown error";
        console.error(`❌ Kick error:`, err);
      }
    }

    const response: LiveStreamsResponse = {
      twitch: twitchStreams,
      kick: kickStreams,
      total: twitchStreams.length + kickStreams.length,
      gameId: gameId || undefined,
      timestamp: new Date().toISOString(),
      debug:
        twitchError || kickError
          ? { twitchError, kickError }
          : undefined,
    };

    console.log(`📊 Response: ${twitchStreams.length} Twitch + ${kickStreams.length} Kick = ${response.total} total`);

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=60", // Cache for 1 minute since streams change frequently
      },
    });
  } catch (error) {
    console.error("❌ Error fetching live streams:", error);

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
