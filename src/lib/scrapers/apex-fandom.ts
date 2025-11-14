import type { WipeData } from '@/schemas/wipe-data';

/**
 * Scrape Apex Legends season information from Fandom Wiki
 *
 * Apex has seasons that last ~90 days (3 months).
 * Each season brings new legend, battle pass, and map changes.
 */
export async function scrapeApexSeasons(): Promise<WipeData> {
  try {
    console.log('📍 Fetching Apex Legends season info...');

    // Try EA Official News first (most reliable)
    const eaData = await scrapeEANews();
    if (eaData) {
      return eaData;
    }

    // Try Reddit as backup
    const redditData = await scrapeReddit();
    if (redditData) {
      return redditData;
    }

    // Fallback to known schedule (based on Season 27)
    return getFallbackSchedule();

  } catch (error) {
    console.error('❌ Error scraping Apex:', error);
    throw new Error(`Failed to scrape Apex: ${error}`);
  }
}

async function scrapeEANews(): Promise<WipeData | null> {
  try {
    console.log('🔍 Checking EA Official News...');

    const response = await fetch('https://www.ea.com/games/apex-legends/news', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.log(`⚠️  EA News returned ${response.status}`);
      return null;
    }

    const html = await response.text();
    console.log(`✅ Fetched EA News (${html.length} bytes)`);

    // Look for Season 27, 28, or 29 mentions with dates
    const seasonPatterns = [
      /Season\s+(27|28|29)/gi,
      /Season\s+(27|28|29)[:\s]+([^<\n]{0,100})/gi,
    ];

    let foundSeason = false;
    for (const pattern of seasonPatterns) {
      const match = html.match(pattern);
      if (match) {
        console.log('🎯 Found season mention:', match[0]);
        foundSeason = true;
        break;
      }
    }

    if (!foundSeason) {
      console.log('⚠️  No recent season found in EA News');
      return null;
    }

    const datePatterns = [
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/gi,
      /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:,?\s*(\d{4}))?/gi,
    ];

    const monthMap: Record<string, number> = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    };

    // Extract all future dates
    const dates: Date[] = [];

    for (const pattern of datePatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        let month: string, day: number, year: number;

        if (match[1].toLowerCase() in monthMap) {
          // "January 8" format
          month = match[1].toLowerCase();
          day = parseInt(match[2]);
          year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
        } else {
          // "8 January" format
          day = parseInt(match[1]);
          month = match[2].toLowerCase();
          year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
        }

        const monthNum = monthMap[month];
        if (monthNum !== undefined && day >= 1 && day <= 31) {
          // Apex seasons typically start at 10 AM PT (17:00 UTC)
          const date = new Date(Date.UTC(year, monthNum, day, 17, 0, 0));
          if (date > new Date()) {
            dates.push(date);
          }
        }
      }
    }

    // Sort and get next date
    dates.sort((a, b) => a.getTime() - b.getTime());

    if (dates.length > 0) {
      const nextDate = dates[0];
      const now = new Date();
      const daysUntil = (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      // Validate: Seasons need reasonable notice
      if (daysUntil >= 3 && daysUntil <= 120) {
        const lastSeason = new Date(nextDate);
        lastSeason.setDate(lastSeason.getDate() - 90); // ~90 days per season

        return {
          nextWipe: nextDate.toISOString(),
          lastWipe: lastSeason.toISOString(),
          frequency: 'Every ~3 months (90 days)',
          source: 'apexlegends.fandom.com',
          scrapedAt: new Date().toISOString(),
          confirmed: true,
        };
      }
    }

    console.log('⚠️  No valid dates found in Fandom');
    return null;

  } catch (error) {
    console.error('❌ Error with Fandom:', error);
    return null;
  }
}

async function scrapeReddit(): Promise<WipeData | null> {
  try {
    const { scrapeRedditPosts, searchPosts, extractDatesFromPost } = await import('@/lib/reddit-scraper');

    // Fetch posts from r/apexlegends
    const posts = await scrapeRedditPosts('apexlegends', {
      limit: 50,
      sort: 'new'
    });

    if (posts.length === 0) {
      console.log('⚠️  No posts found in r/apexlegends');
      return null;
    }

    // Search for season-related posts
    const seasonPosts = searchPosts(
      posts,
      ['season 27', 'season 28', 'season 29', 'new season', 'season announcement'],
      ['tier list', 'looking for', 'lfg', 'best legend', 'tips', 'how to']
    );

    console.log(`🔍 Found ${seasonPosts.length} season-related posts`);

    // Try to find dates in relevant posts
    for (const post of seasonPosts) {
      const dates = extractDatesFromPost(post);

      if (dates.length > 0) {
        // Get the nearest future date
        const futureDate = dates.find(d => d > new Date());

        if (futureDate) {
          const now = new Date();
          const daysUntil = (futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          // Validate: reasonable timeframe for season announcement
          if (daysUntil >= 3 && daysUntil <= 120) {
            const lastSeason = new Date(futureDate);
            lastSeason.setDate(lastSeason.getDate() - 90);

            console.log(`✅ Found season date in post: "${post.title}"`);

            return {
              nextWipe: futureDate.toISOString(),
              lastWipe: lastSeason.toISOString(),
              frequency: 'Every ~3 months (90 days)',
              source: 'r/apexlegends',
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

function getFallbackSchedule(): WipeData {
  console.log('⚠️  Using fallback schedule for Apex');

  // Known: Season 27 started November 4, 2025
  // Apex seasons typically last ~90 days
  const season27Start = new Date('2025-11-04T17:00:00Z'); // 10 AM PT
  const now = new Date();

  let nextSeasonStart = new Date(season27Start);
  nextSeasonStart.setDate(nextSeasonStart.getDate() + 90); // ~Feb 2, 2026

  // If that date has passed, add another 90 days
  if (nextSeasonStart < now) {
    nextSeasonStart.setDate(nextSeasonStart.getDate() + 90);
  }

  const lastSeasonStart = new Date(nextSeasonStart);
  lastSeasonStart.setDate(lastSeasonStart.getDate() - 90);

  return {
    nextWipe: nextSeasonStart.toISOString(),
    lastWipe: lastSeasonStart.toISOString(),
    frequency: 'Every ~3 months (90 days)',
    source: 'Based on Season 27 (Nov 4, 2025)',
    scrapedAt: new Date().toISOString(),
    confirmed: false,
    announcement: 'Season 28 estimated ~Feb 2, 2026',
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
      // Apex seasons typically launch at 10 AM PT (17:00 UTC)
      const date = new Date(Date.UTC(year, monthNum, day, 17, 0, 0));

      if (date > new Date()) {
        seasonDate = date;
        console.log(`📅 Found season date: ${date.toISOString()}`);
        break;
      }
    }
  }

  return { seasonDate };
}
