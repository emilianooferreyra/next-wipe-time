import { NextResponse } from "next/server";
import { gameScraperMap } from "@/lib/scrapers/configs";
import { scrapeKickLiveStreams } from "@/lib/scrapers/kick-scraper";
import { scrapeTwitchLiveStreams } from "@/lib/scrapers/twitch-scraper";
import {
  scrapeTarkovOfficialVideos,
  scrapeYouTubeVideos,
} from "@/lib/scrapers/youtube-scraper";
import { getStreamersForGame } from "@/lib/streamers";
import type { WipeData } from "@/schemas/wipe-data";

export interface GameDetailsResponse {
  wipeData: WipeData | null;
  liveStreams: {
    twitch: any[];
    kick: any[];
    total: number;
  };
  videos: any[];
  timestamp: string;
}

export async function GET() {
  try {
    console.log("🎮 Fetching Tarkov detailed information...");

    // Get wipe information from gameScraperMap
    const wipeData = await gameScraperMap.scrape("tarkov");

    // Get streamers for Tarkov
    const streamers = getStreamersForGame("tarkov");
    const streamerUsernames = streamers.map((s) => s.username);

    // Get live streams in parallel
    const [twitchStreams, kickStreams] = await Promise.all([
      streamerUsernames.length > 0
        ? scrapeTwitchLiveStreams(streamerUsernames)
        : Promise.resolve([]),
      streamerUsernames.length > 0
        ? scrapeKickLiveStreams(streamerUsernames)
        : Promise.resolve([]),
    ]);

    // Get videos (both official and general Tarkov videos)
    const [officialVideos, generalVideos] = await Promise.all([
      scrapeTarkovOfficialVideos(),
      scrapeYouTubeVideos("Tarkov wipe patch 2024 2025", 5),
    ]);

    const allVideos = [...officialVideos, ...generalVideos].slice(0, 10);

    const response: GameDetailsResponse = {
      wipeData,
      liveStreams: {
        twitch: twitchStreams,
        kick: kickStreams,
        total: twitchStreams.length + kickStreams.length,
      },
      videos: allVideos,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=120", // Cache for 2 minutes
      },
    });
  } catch (error) {
    console.error("❌ Error fetching game details:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch game details",
        wipeData: null,
        liveStreams: { twitch: [], kick: [], total: 0 },
        videos: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
