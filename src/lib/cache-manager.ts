/**
 * Unified cache manager for game wipe data
 * Handles reading/writing cache for any game version
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import type { WipeData } from "@/schemas/wipe-data";
import {
  validateCachedData,
  getSmartCacheDuration,
} from "./cache-validator";

/**
 * Get cache file path for a game
 */
export function getCacheFilePath(gameId: string): string {
  return join(process.cwd(), "cache", `${gameId}-wipe.json`);
}

/**
 * Ensure cache directory exists
 */
function ensureCacheDir() {
  const cacheDir = join(process.cwd(), "cache");
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
}

/**
 * Read cache for a specific game
 */
export function readGameCache(gameId: string): WipeData | null {
  try {
    ensureCacheDir();
    const cacheFile = getCacheFilePath(gameId);

    if (!existsSync(cacheFile)) {
      return null;
    }

    const data = readFileSync(cacheFile, "utf-8");
    return JSON.parse(data) as WipeData;
  } catch (error) {
    console.error(`Error reading cache for ${gameId}:`, error);
    return null;
  }
}

/**
 * Write cache for a specific game
 */
export function writeGameCache(gameId: string, data: WipeData) {
  try {
    ensureCacheDir();
    const cacheFile = getCacheFilePath(gameId);
    writeFileSync(cacheFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing cache for ${gameId}:`, error);
  }
}

/**
 * Get cached wipe data with validation
 * Returns cache if valid, otherwise scrapes fresh data
 */
export async function getCachedWipeData(
  gameId: string,
  scraperFn: () => Promise<WipeData>,
  forceRefresh = false,
): Promise<WipeData & { fromCache?: boolean; cacheAge?: number }> {
  try {
    if (!forceRefresh) {
      const cached = readGameCache(gameId);

      if (cached) {
        // Smart validation: check if data is actually still valid
        const cacheDuration = getSmartCacheDuration(
          cached.eventType,
          cached.confirmed,
        );
        const validation = validateCachedData(cached, cacheDuration);

        if (validation.isValid) {
          const cacheAge = cached.scrapedAt
            ? Date.now() - new Date(cached.scrapedAt).getTime()
            : 0;

          console.log(
            `✅ Using valid cache for ${gameId} (${validation.reason || "fresh data"})`,
          );

          return {
            ...cached,
            fromCache: true,
            cacheAge: Math.round(cacheAge / 1000 / 60),
          };
        } else {
          console.log(`🔄 Cache invalid for ${gameId}: ${validation.reason}`);
        }
      }
    }

    console.log(`Scraping fresh data for ${gameId}...`);
    const data = await scraperFn();
    writeGameCache(gameId, data);

    return {
      ...data,
      fromCache: false,
    };
  } catch (error) {
    console.error(`Scraping error for ${gameId}:`, error);

    // Fall back to stale cache
    const cached = readGameCache(gameId);
    if (cached) {
      console.log(`⚠️ Scraping failed for ${gameId}, serving stale cache`);
      return {
        ...cached,
        fromCache: true,
        cacheAge: cached.scrapedAt
          ? Date.now() - new Date(cached.scrapedAt).getTime()
          : 0,
      };
    }

    throw error;
  }
}
