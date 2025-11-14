/**
 * Smart cache validation system
 * Detects if cached data is stale based on event dates, not just cache age
 */

import type { WipeData } from '@/schemas/wipe-data';

export type CachedEventData = {
  nextWipe?: string | null;
  lastWipe?: string | null;
  scrapedAt?: string;
  confirmed?: boolean;
  eventType?: string;
  [key: string]: any;
} | WipeData;

export type ValidationResult = {
  isValid: boolean;
  reason?: string;
  shouldRefresh: boolean;
};

/**
 * Validates if cached event data is still relevant
 *
 * Smart detection for:
 * - Wipes that already happened
 * - Seasons that ended
 * - Patches that are old
 * - Events that finished
 * - Unconfirmed dates that might have been announced
 */
export function validateCachedData(
  cachedData: CachedEventData,
  maxCacheAge: number = 6 * 60 * 60 * 1000 // 6 hours default
): ValidationResult {
  if (!cachedData) {
    return {
      isValid: false,
      reason: 'No cached data',
      shouldRefresh: true,
    };
  }

  const now = Date.now();

  // Check 1: Cache age (traditional check)
  if (cachedData.scrapedAt) {
    const cacheAge = now - new Date(cachedData.scrapedAt).getTime();
    if (cacheAge > maxCacheAge) {
      return {
        isValid: false,
        reason: `Cache too old: ${Math.round(cacheAge / 1000 / 60)} minutes`,
        shouldRefresh: true,
      };
    }
  }

  // Check 2: Event date validity (SMART CHECK)
  if (cachedData.nextWipe) {
    const nextEventDate = new Date(cachedData.nextWipe);
    if (!isNaN(nextEventDate.getTime())) {
      const timeDiff = nextEventDate.getTime() - now;
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // If event was more than 24 hours ago, data is stale
      if (hoursDiff < -24) {
        return {
          isValid: false,
          reason: `Event date is ${Math.abs(Math.round(hoursDiff))}h in the past`,
          shouldRefresh: true,
        };
      }

      // If event happened recently (within 24h), check if we should refresh
      // to get the NEXT event info
      if (hoursDiff < 0 && hoursDiff > -24) {
        // Event is LIVE or just happened
        // Refresh more aggressively (every 2 hours) to catch new announcements
        if (cachedData.scrapedAt) {
          const cacheAge = now - new Date(cachedData.scrapedAt).getTime();
          const twoHours = 2 * 60 * 60 * 1000;

          if (cacheAge > twoHours) {
            return {
              isValid: false,
              reason: 'Event recently happened, checking for next event announcement',
              shouldRefresh: true,
            };
          }
        }
      }
    }
  }

  // Check 3: Unconfirmed dates should refresh more frequently
  if (cachedData.confirmed === false) {
    // Unconfirmed/estimated dates should refresh every 3 hours
    // to catch official announcements faster
    if (cachedData.scrapedAt) {
      const cacheAge = now - new Date(cachedData.scrapedAt).getTime();
      const threeHours = 3 * 60 * 60 * 1000;

      if (cacheAge > threeHours) {
        return {
          isValid: false,
          reason: 'Unconfirmed date - checking for official announcement',
          shouldRefresh: true,
        };
      }
    }
  }

  // Check 4: Event-type specific validation
  if (cachedData.eventType) {
    const eventType = cachedData.eventType.toLowerCase();

    // Patches and hotfixes should refresh more frequently (2 hours)
    if (eventType === 'patch' || eventType === 'hotfix') {
      if (cachedData.scrapedAt) {
        const cacheAge = now - new Date(cachedData.scrapedAt).getTime();
        const twoHours = 2 * 60 * 60 * 1000;

        if (cacheAge > twoHours) {
          return {
            isValid: false,
            reason: 'Patch data refreshes every 2 hours',
            shouldRefresh: true,
          };
        }
      }
    }

    // Special events should refresh every 4 hours during event season
    if (eventType === 'event') {
      if (cachedData.scrapedAt) {
        const cacheAge = now - new Date(cachedData.scrapedAt).getTime();
        const fourHours = 4 * 60 * 60 * 1000;

        if (cacheAge > fourHours) {
          return {
            isValid: false,
            reason: 'Special event data refreshes every 4 hours',
            shouldRefresh: true,
          };
        }
      }
    }
  }

  // All checks passed - cache is valid
  return {
    isValid: true,
    shouldRefresh: false,
  };
}

/**
 * Helper to determine cache duration based on event type
 */
export function getSmartCacheDuration(eventType?: string, confirmed?: boolean): number {
  // Unconfirmed dates: 3 hours
  if (confirmed === false) {
    return 3 * 60 * 60 * 1000;
  }

  if (!eventType) {
    return 6 * 60 * 60 * 1000; // Default 6 hours
  }

  const type = eventType.toLowerCase();

  // Patches/Hotfixes: 2 hours (frequent updates)
  if (type === 'patch' || type === 'hotfix') {
    return 2 * 60 * 60 * 1000;
  }

  // Special events: 4 hours (moderate updates)
  if (type === 'event') {
    return 4 * 60 * 60 * 1000;
  }

  // Leagues/Seasons: 6 hours (less frequent updates)
  if (type === 'league' || type === 'season') {
    return 6 * 60 * 60 * 1000;
  }

  // Default: 6 hours
  return 6 * 60 * 60 * 1000;
}
