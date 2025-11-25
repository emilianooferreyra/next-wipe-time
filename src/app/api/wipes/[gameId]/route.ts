import { NextResponse } from "next/server";
import { cacheLife } from "next/cache";
import { getCachedWipeData } from "@/lib/cache-manager";
import {
  getScraperForGame,
  hasScraperForGame,
} from "@/lib/game-scraper-map";
import { getCacheControlHeader, CachePresets } from "@/lib/cache-headers";

interface Params {
  gameId: string;
}

async function getWipeData(gameId: string, forceRefresh: boolean) {
  "use cache";
  cacheLife("hours");

  // Check if we have a scraper for this game
  if (!hasScraperForGame(gameId)) {
    throw new Error(`No scraper available for game: ${gameId}`);
  }

  const scraper = getScraperForGame(gameId)!;
  const data = await getCachedWipeData(gameId, scraper, forceRefresh);

  return data;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const { gameId } = await params;
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "true";

  try {
    const data = await getWipeData(gameId, forceRefresh);

    // Determine cache strategy based on data type
    const cacheConfig = data.confirmed
      ? CachePresets.CONFIRMED_DATA
      : CachePresets.WIPE_DATA;

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": getCacheControlHeader(cacheConfig),
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch wipe data";

    console.error(`API Error for ${gameId}:`, error);

    return NextResponse.json(
      { error: errorMessage },
      {
        status: 500,
        headers: {
          "Cache-Control": getCacheControlHeader(CachePresets.NO_CACHE),
        },
      },
    );
  }
}
