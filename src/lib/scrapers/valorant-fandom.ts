import type { WipeData } from '@/schemas/wipe-data';

/**
 * Scrape Valorant act information from Fandom Wiki
 *
 * Valorant has 6 acts per season, each lasting ~2 months.
 * Each act brings new Battle Pass, ranked changes, and sometimes new agents/maps.
 */
export async function scrapeValorantActs(): Promise<WipeData> {
  try {
    console.log('📍 Fetching Valorant act info...');

    // Try Fandom Wiki first
    const fandomData = await scrapeFandomWiki();
    if (fandomData) {
      return fandomData;
    }

    // Try Reddit as backup
    const redditData = await scrapeReddit();
    if (redditData) {
      return redditData;
    }

    // Fallback to known schedule
    return getFallbackSchedule();

  } catch (error) {
    console.error('❌ Error scraping Valorant:', error);
    throw new Error(`Failed to scrape Valorant: ${error}`);
  }
}

async function scrapeFandomWiki(): Promise<WipeData | null> {
  try {
    console.log('🔍 Checking Valorant Fandom Wiki...');

    const response = await fetch('https://valorant.fandom.com/wiki/Act', {
      headers: {
        'User-Agent': 'NextWipeTime/1.0 (Game Season Tracker)',
      },
    });

    if (!response.ok) {
      console.log(`⚠️  Fandom returned ${response.status}`);
      return null;
    }

    const html = await response.text();
    console.log(`✅ Fetched Fandom Wiki (${html.length} bytes)`);

    // Look for current season and act patterns
    // Pattern: "Season 2025: Act 1" or "Season 2025 Act I"
    const actPatterns = [
      /Season\s+(\d{4}):\s*Act\s+(\d+|I{1,3}|IV|V|VI)/gi,
      /Season\s+(\d{4})\s+Act\s+(\d+|I{1,3}|IV|V|VI)/gi,
    ];

    const datePatterns = [
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/gi,
      /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:,?\s*(\d{4}))?/gi,
    ];

    const monthMap: Record<string, number> = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    };

    // Extract all dates from page
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
          // Valorant acts typically launch at 2 PM PT (21:00 UTC)
          const date = new Date(Date.UTC(year, monthNum, day, 21, 0, 0));
          if (date > new Date()) {
            dates.push(date);
          }
        }
      }
    }

    // Sort dates to find the next upcoming one
    dates.sort((a, b) => a.getTime() - b.getTime());

    if (dates.length > 0) {
      const nextActDate = dates[0];
      const now = new Date();
      const daysUntil = (nextActDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      // Validate: Acts need at least 3 days notice and max 90 days
      if (daysUntil >= 3 && daysUntil <= 90) {
        const lastActDate = new Date(nextActDate);
        lastActDate.setDate(lastActDate.getDate() - 60); // ~2 months before

        return {
          nextWipe: nextActDate.toISOString(),
          lastWipe: lastActDate.toISOString(),
          frequency: 'Every ~2 months (6 acts per year)',
          source: 'valorant.fandom.com',
          scrapedAt: new Date().toISOString(),
          confirmed: true,
          announcement: `Valorant Season 2025 Act`,
        };
      }
    }

    console.log('⚠️  No valid act date found in Fandom Wiki');
    return null;

  } catch (error) {
    console.error('❌ Error with Fandom Wiki:', error);
    return null;
  }
}

async function scrapeReddit(): Promise<WipeData | null> {
  try {
    const { scrapeRedditPosts, searchPosts, extractDatesFromPost } = await import('@/lib/reddit-scraper');

    const posts = await scrapeRedditPosts('VALORANT', {
      limit: 50,
      sort: 'new'
    });

    if (posts.length === 0) {
      console.log('⚠️  No posts found in r/VALORANT');
      return null;
    }

    const actPosts = searchPosts(
      posts,
      ['episode', 'act', 'new act', 'act announcement', 'season 2025'],
      ['discussion', 'question', 'help', 'bug', 'tier list']
    );

    console.log(`🔍 Found ${actPosts.length} act-related posts`);

    for (const post of actPosts) {
      const dates = extractDatesFromPost(post);

      if (dates.length > 0) {
        const futureDate = dates.find(d => d > new Date());

        if (futureDate) {
          const now = new Date();
          const daysUntil = (futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntil >= 3 && daysUntil <= 90) {
            const lastAct = new Date(futureDate);
            lastAct.setDate(lastAct.getDate() - 60);

            console.log(`✅ Found act date in post: "${post.title}"`);

            return {
              nextWipe: futureDate.toISOString(),
              lastWipe: lastAct.toISOString(),
              frequency: 'Every ~2 months (6 acts per year)',
              source: 'r/VALORANT',
              scrapedAt: new Date().toISOString(),
              confirmed: true,
              announcement: post.title,
            };
          }
        }
      }
    }

    console.log('⚠️  No act announcement found on Reddit');
    return null;

  } catch (error) {
    console.error('❌ Error with Reddit:', error);
    return null;
  }
}

function getFallbackSchedule(): WipeData {
  console.log('⚠️  Using fallback schedule for Valorant');

  // Known: Season 2025 started January 8, 2025
  // Acts are ~60 days each, 6 acts per year
  const season2025Start = new Date('2025-01-08T21:00:00Z');
  const now = new Date();

  let actNumber = 1;
  let nextActDate = new Date(season2025Start);

  // Calculate which act we're in
  while (nextActDate < now) {
    actNumber++;
    nextActDate = new Date(season2025Start);
    nextActDate.setDate(nextActDate.getDate() + (actNumber - 1) * 60);
  }

  const lastActDate = new Date(nextActDate);
  lastActDate.setDate(lastActDate.getDate() - 60);

  return {
    nextWipe: nextActDate.toISOString(),
    lastWipe: lastActDate.toISOString(),
    frequency: 'Every ~2 months (6 acts per year)',
    source: 'Based on Season 2025 schedule (Jan 8, 2025)',
    scrapedAt: new Date().toISOString(),
    confirmed: false,
    announcement: `Valorant Season 2025 Act ${actNumber} (estimated)`,
  };
}

function extractDatesFromText(text: string): {
  actDate: Date | null;
} {
  let actDate: Date | null = null;

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
      // Valorant acts typically launch at 2 PM PT (21:00 UTC)
      const date = new Date(Date.UTC(year, monthNum, day, 21, 0, 0));

      if (date > new Date()) {
        actDate = date;
        console.log(`📅 Found act date: ${date.toISOString()}`);
        break;
      }
    }
  }

  return { actDate };
}
