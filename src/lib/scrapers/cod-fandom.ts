import type { WipeData } from '@/schemas/wipe-data';

/**
 * Scrape Call of Duty season information from Fandom and Reddit
 *
 * COD has seasons that last ~60-70 days (2-2.5 months).
 * Applies to Warzone, Modern Warfare, and Black Ops.
 */
export async function scrapeCODSeasons(): Promise<WipeData> {
  try {
    console.log('📍 Fetching COD season info...');

    // Try Reddit first (most reliable for announcements)
    const redditData = await scrapeReddit();
    if (redditData) {
      return redditData;
    }

    // Try Fandom Wiki
    const fandomData = await scrapeFandom();
    if (fandomData) {
      return fandomData;
    }

    // Fallback to estimated schedule
    return getFallbackSchedule();

  } catch (error) {
    console.error('❌ Error scraping COD:', error);
    throw new Error(`Failed to scrape COD: ${error}`);
  }
}

async function scrapeReddit(): Promise<WipeData | null> {
  try {
    const { scrapeRedditPosts, searchPosts, extractDatesFromPost } = await import('@/lib/reddit-scraper');

    const posts = await scrapeRedditPosts('CODWarzone', {
      limit: 50,
      sort: 'new'
    });

    if (posts.length === 0) {
      console.log('⚠️  No posts found in r/CODWarzone');
      return null;
    }

    const seasonPosts = searchPosts(
      posts,
      ['season', 'new season', 'season announcement', 'season reloaded'],
      ['discussion', 'question', 'help', 'loadout', 'meta']
    );

    console.log(`🔍 Found ${seasonPosts.length} season-related posts`);

    for (const post of seasonPosts) {
      const dates = extractDatesFromPost(post);

      if (dates.length > 0) {
        const futureDate = dates.find(d => d > new Date());

        if (futureDate) {
          const now = new Date();
          const daysUntil = (futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntil >= 3 && daysUntil <= 90) {
            const lastSeason = new Date(futureDate);
            lastSeason.setDate(lastSeason.getDate() - 65);

            console.log(`✅ Found season date in post: "${post.title}"`);

            return {
              nextWipe: futureDate.toISOString(),
              lastWipe: lastSeason.toISOString(),
              frequency: 'Every ~2 months (60-70 days)',
              source: 'r/CODWarzone',
              scrapedAt: new Date().toISOString(),
              confirmed: true,
              announcement: post.title,
            };
          }
        }
      }
    }

    console.log('⚠️  No season announcement found on Reddit');
    return null;

  } catch (error) {
    console.error('❌ Error with Reddit:', error);
    return null;
  }
}

async function scrapeFandom(): Promise<WipeData | null> {
  try {
    console.log('🔍 Checking COD Fandom...');

    const response = await fetch('https://callofduty.fandom.com/wiki/Season', {
      headers: {
        'User-Agent': 'NextWipeTime/1.0 (Season Tracker)',
      },
    });

    if (!response.ok) {
      console.log(`⚠️  Fandom returned ${response.status}`);
      return null;
    }

    const html = await response.text();
    console.log(`✅ Fetched Fandom Wiki (${html.length} bytes)`);

    const datePatterns = [
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/gi,
    ];

    const monthMap: Record<string, number> = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    };

    // Extract all future dates
    const dates: Date[] = [];
    const matches = html.matchAll(datePatterns[0]);

    for (const match of matches) {
      const month = match[1].toLowerCase();
      const day = parseInt(match[2]);
      const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();

      const monthNum = monthMap[month];
      if (monthNum !== undefined && day >= 1 && day <= 31) {
        // COD seasons typically start at 9 AM PT (16:00 UTC)
        const date = new Date(Date.UTC(year, monthNum, day, 16, 0, 0));
        if (date > new Date()) {
          dates.push(date);
        }
      }
    }

    // Sort and get next date
    dates.sort((a, b) => a.getTime() - b.getTime());

    if (dates.length > 0) {
      const nextDate = dates[0];
      const lastSeason = new Date(nextDate);
      lastSeason.setDate(lastSeason.getDate() - 65);

      return {
        nextWipe: nextDate.toISOString(),
        lastWipe: lastSeason.toISOString(),
        frequency: 'Every ~2 months (60-70 days)',
        source: 'callofduty.fandom.com',
        scrapedAt: new Date().toISOString(),
        confirmed: true,
      };
    }

    console.log('⚠️  No valid dates found in Fandom');
    return null;

  } catch (error) {
    console.error('❌ Error with Fandom:', error);
    return null;
  }
}

function getFallbackSchedule(): WipeData {
  console.log('⚠️  Using fallback schedule for COD');

  const now = new Date();
  const nextSeason = new Date(now);
  nextSeason.setDate(nextSeason.getDate() + 35); // Estimate

  const lastSeason = new Date(nextSeason);
  lastSeason.setDate(lastSeason.getDate() - 65);

  return {
    nextWipe: nextSeason.toISOString(),
    lastWipe: lastSeason.toISOString(),
    frequency: 'Every ~2 months (60-70 days)',
    source: 'Estimated based on typical season length',
    scrapedAt: new Date().toISOString(),
    confirmed: false,
    announcement: 'Estimated - check official sources',
  };
}

function extractDatesFromText(text: string): {
  seasonDate: Date | null;
} {
  let seasonDate: Date | null = null;

  const monthDayPattern = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/gi;

  const monthMap: Record<string, number> = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
    april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
    august: 7, aug: 7, september: 8, sep: 8, october: 9, oct: 9,
    november: 10, nov: 10, december: 11, dec: 11,
  };

  const matches = text.matchAll(monthDayPattern);
  for (const match of matches) {
    const month = match[1].toLowerCase();
    const day = parseInt(match[2]);
    const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();

    const monthNum = monthMap[month];
    if (monthNum !== undefined) {
      const date = new Date(Date.UTC(year, monthNum, day, 16, 0, 0));

      if (date > new Date()) {
        seasonDate = date;
        console.log(`📅 Found season date: ${date.toISOString()}`);
        break;
      }
    }
  }

  return { seasonDate };
}
