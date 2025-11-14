import type { WipeData } from '@/schemas/wipe-data';

/**
 * Scrape PUBG season information from Steam News API
 *
 * PUBG has ranked seasons that typically last ~2-3 months.
 * Steam News API provides official announcements.
 */
export async function scrapePUBGSeasons(): Promise<WipeData> {
  try {
    console.log('📍 Fetching PUBG season info...');

    // Try Steam News API first (official source)
    const steamData = await scrapeSteamNews();
    if (steamData) {
      return steamData;
    }

    // Try Reddit as backup
    const redditData = await scrapeReddit();
    if (redditData) {
      return redditData;
    }

    // Fallback to estimated schedule
    return getFallbackSchedule();

  } catch (error) {
    console.error('❌ Error scraping PUBG:', error);
    throw new Error(`Failed to scrape PUBG: ${error}`);
  }
}

async function scrapeSteamNews(): Promise<WipeData | null> {
  try {
    console.log('🔍 Checking Steam News API...');

    // PUBG App ID: 578080
    const response = await fetch(
      'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=578080&count=10&maxlength=5000',
      {
        headers: {
          'User-Agent': 'NextWipeTime/1.0 (Season Tracker)',
        },
      }
    );

    if (!response.ok) {
      console.log(`⚠️  Steam API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    const newsItems = data.appnews?.newsitems || [];
    console.log(`✅ Found ${newsItems.length} news items`);

    const seasonKeywords = [
      'season',
      'ranked season',
      'new season',
      'season announcement'
    ];

    const excludeKeywords = [
      'patch notes',
      'hotfix',
      'maintenance',
      'update notes'
    ];

    for (const item of newsItems) {
      const { title, contents } = item;
      const text = `${title} ${contents}`.toLowerCase();

      // Skip excluded items
      const isExcluded = excludeKeywords.some(k => text.includes(k));
      if (isExcluded) continue;

      // Check for season keywords
      const hasSeason = seasonKeywords.some(k => text.includes(k));

      if (hasSeason) {
        console.log('🎯 Found potential season news:', title);

        // Try to extract dates
        const dates = extractDatesFromText(`${title} ${contents}`);

        if (dates.seasonDate) {
          const now = new Date();
          const daysUntil = (dates.seasonDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntil >= 3 && daysUntil <= 120) {
            const lastSeason = new Date(dates.seasonDate);
            lastSeason.setMonth(lastSeason.getMonth() - 2); // ~2 months per season

            return {
              nextWipe: dates.seasonDate.toISOString(),
              lastWipe: lastSeason.toISOString(),
              frequency: 'Every ~2-3 months',
              source: 'Steam News (Official)',
              scrapedAt: new Date().toISOString(),
              confirmed: true,
              announcement: title,
            };
          }
        }
      }
    }

    console.log('⚠️  No season announcement found in Steam News');
    return null;

  } catch (error) {
    console.error('❌ Error with Steam News:', error);
    return null;
  }
}

async function scrapeReddit(): Promise<WipeData | null> {
  try {
    const { scrapeRedditPosts, searchPosts, extractDatesFromPost } = await import('@/lib/reddit-scraper');

    const posts = await scrapeRedditPosts('PUBATTLEGROUNDS', {
      limit: 50,
      sort: 'new'
    });

    if (posts.length === 0) {
      console.log('⚠️  No posts found in r/PUBATTLEGROUNDS');
      return null;
    }

    const seasonPosts = searchPosts(
      posts,
      ['season', 'ranked season', 'new season'],
      ['discussion', 'question', 'help']
    );

    console.log(`🔍 Found ${seasonPosts.length} season-related posts`);

    for (const post of seasonPosts) {
      const dates = extractDatesFromPost(post);

      if (dates.length > 0) {
        const futureDate = dates.find(d => d > new Date());

        if (futureDate) {
          const now = new Date();
          const daysUntil = (futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntil >= 3 && daysUntil <= 120) {
            const lastSeason = new Date(futureDate);
            lastSeason.setMonth(lastSeason.getMonth() - 2);

            console.log(`✅ Found season date in post: "${post.title}"`);

            return {
              nextWipe: futureDate.toISOString(),
              lastWipe: lastSeason.toISOString(),
              frequency: 'Every ~2-3 months',
              source: 'r/PUBATTLEGROUNDS',
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
  console.log('⚠️  Using fallback schedule for PUBG');

  const now = new Date();
  const nextSeason = new Date(now);
  nextSeason.setMonth(nextSeason.getMonth() + 1);
  nextSeason.setDate(15); // Mid-month

  const lastSeason = new Date(nextSeason);
  lastSeason.setMonth(lastSeason.getMonth() - 2);

  return {
    nextWipe: nextSeason.toISOString(),
    lastWipe: lastSeason.toISOString(),
    frequency: 'Every ~2-3 months',
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
      const date = new Date(Date.UTC(year, monthNum, day, 14, 0, 0));

      if (date > new Date()) {
        seasonDate = date;
        console.log(`📅 Found season date: ${date.toISOString()}`);
        break;
      }
    }
  }

  return { seasonDate };
}
