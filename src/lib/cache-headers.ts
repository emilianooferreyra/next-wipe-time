/**
 * Cache Control Headers Utility
 *
 * Generates optimized Cache-Control headers for API responses
 */

export interface CacheConfig {
  /**
   * Time in seconds that the response is fresh (browser cache)
   * Default: 300 (5 minutes)
   */
  maxAge?: number;

  /**
   * Time in seconds for CDN/proxy cache
   * Default: 300 (5 minutes)
   */
  sMaxAge?: number;

  /**
   * Time in seconds to serve stale content while revalidating
   * Default: 600 (10 minutes)
   */
  staleWhileRevalidate?: number;

  /**
   * Whether the response can be cached publicly (CDN, proxies)
   * Default: true
   */
  isPublic?: boolean;
}

/**
 * Generate Cache-Control header value
 */
export function getCacheControlHeader(config: CacheConfig = {}): string {
  const {
    maxAge = 300, // 5 minutes
    sMaxAge = 300, // 5 minutes
    staleWhileRevalidate = 600, // 10 minutes
    isPublic = true,
  } = config;

  const parts = [
    isPublic ? 'public' : 'private',
    `max-age=${maxAge}`,
    `s-maxage=${sMaxAge}`,
    `stale-while-revalidate=${staleWhileRevalidate}`,
  ];

  return parts.join(', ');
}

/**
 * Predefined cache configurations for different scenarios
 */
export const CachePresets = {
  /**
   * Standard cache for game wipe data (5 min fresh, 10 min stale)
   */
  WIPE_DATA: {
    maxAge: 300, // 5 minutes
    sMaxAge: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes
  },

  /**
   * Longer cache for confirmed data (15 min fresh, 1 hour stale)
   */
  CONFIRMED_DATA: {
    maxAge: 900, // 15 minutes
    sMaxAge: 900, // 15 minutes
    staleWhileRevalidate: 3600, // 1 hour
  },

  /**
   * Short cache for frequently changing data (1 min fresh, 5 min stale)
   */
  DYNAMIC_DATA: {
    maxAge: 60, // 1 minute
    sMaxAge: 60, // 1 minute
    staleWhileRevalidate: 300, // 5 minutes
  },

  /**
   * No cache for errors or private data
   */
  NO_CACHE: {
    maxAge: 0,
    sMaxAge: 0,
    staleWhileRevalidate: 0,
    isPublic: false,
  },
} as const;
