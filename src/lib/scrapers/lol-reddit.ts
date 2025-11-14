import type { WipeData } from '@/schemas/wipe-data';

/**
 * Scrape League of Legends season information from Reddit and community sources
 *
 * LoL has yearly seasons divided into 3 splits.
 * Each split lasts ~4 months. Major patches every 2 weeks.
 */
export async function scrapeLoLSeasons(): Promise<WipeData> {
  try {
    console.log('📍 Fetching LoL season info...');

    // Try Reddit first
    const redditData = await scrapeReddit();
    if (redditData) {
      return redditData;
    }

    // Try Fandom Wiki
    const fandomData = await scrapeFandom();
    if (fandomData) {
      return fandomData;
    }

    // Fallback to known schedule
    return getFallbackSchedule();

  } catch (error) {
    console.error('❌ Error scraping LoL:', error);
    throw new Error(`Failed to scrape LoL: ${error}`);
  }
}

async function scrapeReddit(): Promise<WipeData | null> {
  try {
    const { scrapeRedditPosts, searchPosts, extractDatesFromPost } = await import('@/lib/reddit-scraper');

    const posts = await scrapeRedditPosts('leagueoflegends', {
      limit: 50,
      sort: 'new'
    });

    if (posts.length === 0) {
      console.log('⚠️  No posts found in r/leagueoflegends');
      return null;
    }

    const seasonPosts = searchPosts(
      posts,
      ['season 2025', 'season 2026', 'split 1', 'split 2', 'split 3', 'new season', 'ranked season'],
      ['discussion', 'question', 'help', 'esports', 'lcs', 'lec', 'lck', 'tournament']
    );

    console.log(`🔍 Found ${seasonPosts.length} season-related posts`);

    for (const post of seasonPosts) {
      const dates = extractDatesFromPost(post);

      if (dates.length > 0) {
        const futureDate = dates.find(d => d > new Date());

        if (futureDate) {
          const now = new Date();
          const daysUntil = (futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntil >= 7 && daysUntil <= 150) {
            const lastSplit = new Date(futureDate);
            lastSplit.setMonth(lastSplit.getMonth() - 4);

            console.log(`✅ Found season date in post: "${post.title}"`);

            return {
              nextWipe: futureDate.toISOString(),
              lastWipe: lastSplit.toISOString(),
              frequency: 'Every ~4 months (3 splits per year)',
              source: 'r/leagueoflegends',
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
    console.log('🔍 Checking LoL Fandom Wiki...');

    const response = await fetch('https://leagueoflegends.fandom.com/wiki/Season', {
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

    // Look for season and split dates
    const seasonPatterns = [
      /Season\s+(\d{4})/gi,
      /Split\s+(\d+)/gi,
    ];

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
        // LoL splits typically start at 12 PM PT (19:00 UTC)
        const date = new Date(Date.UTC(year, monthNum, day, 19, 0, 0));
        if (date > new Date()) {
          dates.push(date);
        }
      }
    }

    // Sort and get next date
    dates.sort((a, b) => a.getTime() - b.getTime());

    if (dates.length > 0) {
      const nextDate = dates[0];
      const lastSplit = new Date(nextDate);
      lastSplit.setMonth(lastSplit.getMonth() - 4);

      return {
        nextWipe: nextDate.toISOString(),
        lastWipe: lastSplit.toISOString(),
        frequency: 'Every ~4 months (3 splits per year)',
        source: 'leagueoflegends.fandom.com',
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
  console.log('⚠️  Using fallback schedule for LoL');

  // Known: Season 2025 started January 2025
  // Splits are ~4 months each: Jan-Apr, May-Aug, Sep-Dec
  const now = new Date();
  const year = now.getFullYear();

  // Define split start dates (approximate)
  const splits = [
    new Date(Date.UTC(year, 0, 10, 19, 0, 0)),  // Split 1: ~Jan 10
    new Date(Date.UTC(year, 4, 15, 19, 0, 0)),  // Split 2: ~May 15
    new Date(Date.UTC(year, 8, 20, 19, 0, 0)),  // Split 3: ~Sep 20
  ];

  // Find next split
  let nextSplit = splits.find(split => split > now);

  // If no split found this year, use next year's Split 1
  if (!nextSplit) {
    nextSplit = new Date(Date.UTC(year + 1, 0, 10, 19, 0, 0));
  }

  const lastSplit = new Date(nextSplit);
  lastSplit.setMonth(lastSplit.getMonth() - 4);

  return {
    nextWipe: nextSplit.toISOString(),
    lastWipe: lastSplit.toISOString(),
    frequency: 'Every ~4 months (3 splits per year)',
    source: 'Based on typical LoL split schedule',
    scrapedAt: new Date().toISOString(),
    confirmed: false,
    announcement: 'Estimated based on typical split schedule',
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
      // LoL splits typically launch at 12 PM PT (19:00 UTC)
      const date = new Date(Date.UTC(year, monthNum, day, 19, 0, 0));

      if (date > new Date()) {
        seasonDate = date;
        console.log(`📅 Found season date: ${date.toISOString()}`);
        break;
      }
    }
  }

  return { seasonDate };
}
