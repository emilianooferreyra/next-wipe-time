import type { WipeData } from '@/schemas/wipe-data';

/**
 * Scrape Dead by Daylight chapter information
 *
 * DBD releases chapters every 3 months in regular intervals.
 * Each chapter brings new killers, survivors, and gameplay changes.
 */
export async function scrapeDBDChapters(): Promise<WipeData> {
  try {
    console.log('📍 Fetching Dead by Daylight chapter info...');

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

    // Fallback to calculated schedule
    return getFallbackSchedule();

  } catch (error) {
    console.error('❌ Error scraping DBD:', error);
    throw new Error(`Failed to scrape DBD: ${error}`);
  }
}

async function scrapeReddit(): Promise<WipeData | null> {
  try {
    const { scrapeRedditPosts, searchPosts, extractDatesFromPost } = await import('@/lib/reddit-scraper');

    const posts = await scrapeRedditPosts('deadbydaylight', {
      limit: 50,
      sort: 'new'
    });

    if (posts.length === 0) {
      console.log('⚠️  No posts found in r/deadbydaylight');
      return null;
    }

    const chapterPosts = searchPosts(
      posts,
      ['chapter', 'new chapter', 'chapter announcement', 'ptb', 'public test build'],
      ['discussion', 'question', 'help', 'build', 'perk']
    );

    console.log(`🔍 Found ${chapterPosts.length} chapter-related posts`);

    for (const post of chapterPosts) {
      const dates = extractDatesFromPost(post);

      if (dates.length > 0) {
        const futureDate = dates.find(d => d > new Date());

        if (futureDate) {
          const now = new Date();
          const daysUntil = (futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntil >= 3 && daysUntil <= 120) {
            const lastChapter = new Date(futureDate);
            lastChapter.setMonth(lastChapter.getMonth() - 3);

            console.log(`✅ Found chapter date in post: "${post.title}"`);

            return {
              nextWipe: futureDate.toISOString(),
              lastWipe: lastChapter.toISOString(),
              frequency: 'Every 3 months',
              source: 'r/deadbydaylight',
              scrapedAt: new Date().toISOString(),
              confirmed: true,
              announcement: post.title,
            };
          }
        }
      }
    }

    console.log('⚠️  No chapter announcement found on Reddit');
    return null;

  } catch (error) {
    console.error('❌ Error with Reddit:', error);
    return null;
  }
}

async function scrapeFandom(): Promise<WipeData | null> {
  try {
    console.log('🔍 Checking DBD Fandom...');

    const response = await fetch('https://deadbydaylight.fandom.com/wiki/Chapters', {
      headers: {
        'User-Agent': 'NextWipeTime/1.0 (Chapter Tracker)',
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
        // DBD chapters typically release at 11 AM ET (16:00 UTC)
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
      const lastChapter = new Date(nextDate);
      lastChapter.setMonth(lastChapter.getMonth() - 3);

      return {
        nextWipe: nextDate.toISOString(),
        lastWipe: lastChapter.toISOString(),
        frequency: 'Every 3 months',
        source: 'deadbydaylight.fandom.com',
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
  console.log('⚠️  Using fallback schedule for DBD');

  // DBD chapters release every 3 months
  // Typically in: March, June, September, December
  const now = new Date();
  const year = now.getFullYear();

  const chapterReleases = [
    new Date(Date.UTC(year, 2, 15, 16, 0, 0)),   // March 15
    new Date(Date.UTC(year, 5, 15, 16, 0, 0)),   // June 15
    new Date(Date.UTC(year, 8, 15, 16, 0, 0)),   // September 15
    new Date(Date.UTC(year, 11, 15, 16, 0, 0)),  // December 15
  ];

  // Find next chapter
  let nextChapter = chapterReleases.find(date => date > now);

  // If no chapter found this year, use next year's March
  if (!nextChapter) {
    nextChapter = new Date(Date.UTC(year + 1, 2, 15, 16, 0, 0));
  }

  const lastChapter = new Date(nextChapter);
  lastChapter.setMonth(lastChapter.getMonth() - 3);

  return {
    nextWipe: nextChapter.toISOString(),
    lastWipe: lastChapter.toISOString(),
    frequency: 'Every 3 months',
    source: 'Based on typical chapter schedule',
    scrapedAt: new Date().toISOString(),
    confirmed: false,
    announcement: 'Estimated based on 3-month cycle',
  };
}

function extractDatesFromText(text: string): {
  chapterDate: Date | null;
} {
  let chapterDate: Date | null = null;

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
        chapterDate = date;
        console.log(`📅 Found chapter date: ${date.toISOString()}`);
        break;
      }
    }
  }

  return { chapterDate };
}
