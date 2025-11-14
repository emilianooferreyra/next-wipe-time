import type { WipeData } from '@/schemas/wipe-data';

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    created_utc: number;
    stickied: boolean;
    url: string;
    author: string;
  };
}

interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

/**
 * Scrape r/EscapefromTarkov for official wipe announcements
 * Looks for stickied posts from BSG or moderators containing wipe dates
 */
export async function scrapeTarkovWipeFromReddit(): Promise<WipeData> {
  try {
    console.log('📍 Fetching r/EscapefromTarkov hot posts...');

    const response = await fetch('https://www.reddit.com/r/EscapefromTarkov/hot.json?limit=25', {
      headers: {
        'User-Agent': 'NextWipeTime/1.0 (Tarkov Wipe Tracker)',
      },
    });

    if (!response.ok) {
      throw new Error(`Reddit API returned ${response.status}`);
    }

    const data: RedditResponse = await response.json();
    console.log(`✅ Found ${data.data.children.length} posts`);

    // Look for stickied posts or posts with wipe/release-related keywords
    const wipeKeywords = ['wipe', 'reset', 'patch notes', 'update', 'release', 'launch', '1.0', 'version 1.0'];
    const officialAuthors = ['trainfender', 'bstategames', 'autoModerator']; // Nikita and official accounts

    let wipeAnnouncement: RedditPost | null = null;
    let nextWipeDate: Date | null = null;
    let lastWipeDate: Date | null = null;
    let isRelease = false;

    for (const post of data.data.children) {
      const { title, selftext, stickied, author } = post.data;
      const content = `${title} ${selftext}`.toLowerCase();

      // Check if this is a wipe-related post
      const hasWipeKeyword = wipeKeywords.some(keyword => content.includes(keyword));
      const isOfficial = officialAuthors.some(auth => author.toLowerCase() === auth.toLowerCase());

      // Accept if: (stickied AND has keyword) OR (official author AND has keyword)
      if ((stickied && hasWipeKeyword) || (isOfficial && hasWipeKeyword)) {
        console.log('🎯 Found potential wipe/release announcement:', title);
        wipeAnnouncement = post;

        // Check if this is about the 1.0 release
        const releaseKeywords = ['release', 'launch', '1.0', 'version 1.0'];
        isRelease = releaseKeywords.some(keyword => content.includes(keyword));

        // Try to extract dates from the post
        const dates = extractDatesFromText(`${title} ${selftext}`);

        if (dates.wipeDate) {
          console.log(`✅ Extracted ${isRelease ? 'release' : 'wipe'} date:`, dates.wipeDate.toISOString());
          nextWipeDate = dates.wipeDate;

          // If we found a future wipe date, try to find the last wipe
          if (dates.lastWipeDate) {
            lastWipeDate = dates.lastWipeDate;
          } else {
            // Estimate last wipe as ~6 months before next wipe
            lastWipeDate = new Date(nextWipeDate);
            lastWipeDate.setMonth(lastWipeDate.getMonth() - 6);
          }
          break;
        }
      }
    }

    // If we found a confirmed announcement with dates
    if (wipeAnnouncement && nextWipeDate) {
      return {
        nextWipe: nextWipeDate.toISOString(),
        lastWipe: lastWipeDate!.toISOString(),
        frequency: isRelease ? 'Official 1.0 Release' : 'Every 6 months (approx)',
        source: 'r/EscapefromTarkov (Official Announcement)',
        scrapedAt: new Date().toISOString(),
        confirmed: true,
        announcement: wipeAnnouncement.data.title,
        isRelease,
      };
    }

    // If no announcement found, calculate based on known last wipe
    console.log('⚠️  No official wipe announcement found, using estimation');

    // Known last wipe: July 10, 2024
    const knownLastWipe = new Date('2024-07-10T12:00:00Z');
    const estimatedNextWipe = new Date(knownLastWipe);
    estimatedNextWipe.setMonth(estimatedNextWipe.getMonth() + 6);

    return {
      nextWipe: estimatedNextWipe.toISOString(),
      lastWipe: knownLastWipe.toISOString(),
      frequency: 'Every 6 months (approx)',
      source: 'r/EscapefromTarkov (Estimated)',
      scrapedAt: new Date().toISOString(),
      confirmed: false,
      announcement: 'No official announcement found. This is an estimate.',
    };
  } catch (error) {
    console.error('❌ Error scraping Reddit:', error);
    throw new Error(`Failed to scrape Tarkov wipe from Reddit: ${error}`);
  }
}

/**
 * Extract dates from text using various patterns
 */
function extractDatesFromText(text: string): {
  wipeDate: Date | null;
  lastWipeDate: Date | null;
} {
  let wipeDate: Date | null = null;
  let lastWipeDate: Date | null = null;

  // Pattern 1: "November 15" or "November 15, 2025" or "Nov 15"
  const monthDayPattern = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/gi;

  // Pattern 2: "15/11/2025" or "11/15/2025" or "2025-11-15"
  const numericDatePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})|(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g;

  // Pattern 3: "in X days" or "X days from now"
  const relativeDaysPattern = /(?:in\s+)?(\d+)\s+days?(?:\s+(?:from\s+now|until\s+wipe))?/gi;

  const matches = text.matchAll(monthDayPattern);
  for (const match of matches) {
    const month = match[1].toLowerCase();
    const day = parseInt(match[2]);
    const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();

    const monthMap: Record<string, number> = {
      january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
      april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
      august: 7, aug: 7, september: 8, sep: 8, october: 9, oct: 9,
      november: 10, nov: 10, december: 11, dec: 11,
    };

    const monthNum = monthMap[month];
    if (monthNum !== undefined) {
      const date = new Date(year, monthNum, day, 12, 0, 0);

      // If this date is in the future, it's likely the next wipe
      if (date > new Date()) {
        wipeDate = date;
        console.log(`📅 Found wipe date: ${date.toISOString()}`);
        break;
      }
    }
  }

  // Try relative days pattern
  if (!wipeDate) {
    const relativeMatches = text.matchAll(relativeDaysPattern);
    for (const match of relativeMatches) {
      const days = parseInt(match[1]);
      if (days > 0 && days < 365) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        wipeDate = date;
        console.log(`📅 Found relative wipe date (in ${days} days): ${date.toISOString()}`);
        break;
      }
    }
  }

  return { wipeDate, lastWipeDate };
}
