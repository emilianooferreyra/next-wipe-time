import { NextResponse } from 'next/server';
import { cacheLife } from 'next/cache';
import { scrapePoe2League } from '@/lib/scrapers/poe2';
import { validateCachedData, getSmartCacheDuration } from '@/lib/cache-validator';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { WipeData } from '@/schemas/wipe-data';
import { getCacheControlHeader, CachePresets } from '@/lib/cache-headers';

const CACHE_FILE = join(process.cwd(), 'cache', 'poe2-league.json');

function ensureCacheDir() {
  const cacheDir = join(process.cwd(), 'cache');
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
}

function readCache(): WipeData | null {
  try {
    ensureCacheDir();
    if (!existsSync(CACHE_FILE)) return null;
    const data = readFileSync(CACHE_FILE, 'utf-8');
    return JSON.parse(data) as WipeData;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

function writeCache(data: WipeData) {
  try {
    ensureCacheDir();
    writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

async function getCachedLeagueData(forceRefresh: boolean) {
  'use cache';
  cacheLife('hours');

  try {
    if (!forceRefresh) {
      const cached = readCache();

      if (cached) {
        // Smart validation: check if data is actually still valid
        const cacheDuration = getSmartCacheDuration(cached.eventType, cached.confirmed);
        const validation = validateCachedData(cached, cacheDuration);

        if (validation.isValid) {
          const cacheAge = cached.scrapedAt
            ? Date.now() - new Date(cached.scrapedAt).getTime()
            : 0;

          console.log(`✅ Using valid cache (${validation.reason || 'fresh data'})`);

          return {
            ...cached,
            fromCache: true,
            cacheAge: Math.round(cacheAge / 1000 / 60),
          };
        } else {
          console.log(`🔄 Cache invalid: ${validation.reason}`);
          // Cache is invalid, continue to refresh
        }
      }
    }

    console.log('Scraping fresh Path of Exile 2 data...');
    const data = await scrapePoe2League();
    writeCache(data);
    return { ...data, fromCache: false };
  } catch (error) {
    console.error('API Error:', error);
    const cached = readCache();
    if (cached) {
      console.log('⚠️ Scraping failed, serving stale cache');
      return { ...cached, fromCache: true, stale: true, error: 'Failed to fetch fresh data' };
    }
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';

  try {
    const data = await getCachedLeagueData(forceRefresh);

    // Determine cache strategy based on data type
    const cacheConfig = data.confirmed
      ? CachePresets.CONFIRMED_DATA
      : CachePresets.WIPE_DATA;

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': getCacheControlHeader(cacheConfig),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch league data' },
      {
        status: 500,
        headers: {
          'Cache-Control': getCacheControlHeader(CachePresets.NO_CACHE),
        },
      }
    );
  }
}
