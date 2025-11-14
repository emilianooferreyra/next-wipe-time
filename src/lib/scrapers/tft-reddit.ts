import type { WipeData } from '@/schemas/wipe-data';

/**
 * Scrape TFT set information from Reddit and community sources
 *
 * TFT has sets that last ~4 months.
 * Mid-set updates happen ~2 months into each set.
 */
export async function scrapeTFTSets(): Promise<WipeData> {
  try {
    console.log('📍 Fetching TFT set info...');

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
    console.error('❌ Error scraping TFT:', error);
    throw new Error(`Failed to scrape TFT: ${error}`);
  }
}

async function scrapeReddit(): Promise<WipeData | null> {
  try {
    const { scrapeRedditPosts, searchPosts, extractDatesFromPost } = await import('@/lib/reddit-scraper');

    const posts = await scrapeRedditPosts('TeamfightTactics', {
      limit: 50,
      sort: 'new'
    });

    if (posts.length === 0) {
      console.log('⚠️  No posts found in r/TeamfightTactics');
      return null;
    }

    const setPosts = searchPosts(
      posts,
      ['new set', 'set 13', 'set 14', 'set 15', 'mid-set', 'midset', 'set announcement', 'upcoming set'],
      ['discussion', 'question', 'help', 'comp', 'guide', 'meta']
    );

    console.log(`🔍 Found ${setPosts.length} set-related posts`);

    for (const post of setPosts) {
      const dates = extractDatesFromPost(post);

      if (dates.length > 0) {
        const futureDate = dates.find(d => d > new Date());

        if (futureDate) {
          const now = new Date();
          const daysUntil = (futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntil >= 7 && daysUntil <= 150) {
            const lastSet = new Date(futureDate);
            lastSet.setMonth(lastSet.getMonth() - 4);

            console.log(`✅ Found set date in post: "${post.title}"`);

            return {
              nextWipe: futureDate.toISOString(),
              lastWipe: lastSet.toISOString(),
              frequency: 'Every ~4 months',
              source: 'r/TeamfightTactics',
              scrapedAt: new Date().toISOString(),
              confirmed: true,
              announcement: post.title,
            };
          }
        }
      }
    }

    console.log('⚠️  No set announcement found on Reddit');
    return null;

  } catch (error) {
    console.error('❌ Error with Reddit:', error);
    return null;
  }
}

async function scrapeFandom(): Promise<WipeData | null> {
  try {
    console.log('🔍 Checking TFT Fandom Wiki...');

    // TFT info is on LoL Fandom wiki
    const response = await fetch('https://leagueoflegends.fandom.com/wiki/Teamfight_Tactics', {
      headers: {
        'User-Agent': 'NextWipeTime/1.0 (Set Tracker)',
      },
    });

    if (!response.ok) {
      console.log(`⚠️  Fandom returned ${response.status}`);
      return null;
    }

    const html = await response.text();
    console.log(`✅ Fetched Fandom Wiki (${html.length} bytes)`);

    // Look for set patterns
    const setPatterns = [
      /Set\s+(\d+)/gi,
      /Set\s+(\d+):\s*([^<\n]+)/gi,
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
        // TFT sets typically start at 11 AM PT (18:00 UTC)
        const date = new Date(Date.UTC(year, monthNum, day, 18, 0, 0));
        if (date > new Date()) {
          dates.push(date);
        }
      }
    }

    // Sort and get next date
    dates.sort((a, b) => a.getTime() - b.getTime());

    if (dates.length > 0) {
      const nextDate = dates[0];
      const lastSet = new Date(nextDate);
      lastSet.setMonth(lastSet.getMonth() - 4);

      return {
        nextWipe: nextDate.toISOString(),
        lastWipe: lastSet.toISOString(),
        frequency: 'Every ~4 months',
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
  console.log('⚠️  Using fallback schedule for TFT');

  const now = new Date();

  // CONFIRMED: TFT Set 16 "Lore & Legends" releases December 3, 2025
  const set16Release = new Date(Date.UTC(2025, 11, 3, 18, 0, 0)); // Dec 3, 2025
  const set15End = new Date(Date.UTC(2025, 10, 19, 18, 0, 0));     // Nov 19, 2025

  // Special events
  const globalReveal = new Date(Date.UTC(2025, 10, 16, 0, 0, 0)); // Nov 14-16, 2025
  const pbeRelease = new Date(Date.UTC(2025, 10, 18, 18, 0, 0));  // Nov 18, 2025

  const specialEvents = [];

  // Add Global Reveal if it's upcoming or happening
  if (globalReveal >= now || now <= new Date(Date.UTC(2025, 10, 16, 23, 59, 59))) {
    specialEvents.push({
      name: "Set 16 Global Reveal at K.O. Coliseum",
      date: globalReveal.toISOString(),
      type: "reveal" as const,
      description: "Global reveal during Tactician's Crown tournament (Nov 14-16)"
    });
  }

  // Add PBE release if upcoming
  if (pbeRelease >= now) {
    specialEvents.push({
      name: "Set 16 PBE Release",
      date: pbeRelease.toISOString(),
      type: "beta" as const,
      description: "Test server release for Set 16: Lore & Legends"
    });
  }

  return {
    nextWipe: set16Release.toISOString(),
    lastWipe: set15End.toISOString(),
    frequency: 'Every ~4 months',
    source: 'Official Riot Games announcement',
    scrapedAt: new Date().toISOString(),
    confirmed: true,
    announcement: 'Set 16: Lore & Legends - The biggest set in TFT history',
    eventType: 'season',
    eventName: 'Lore & Legends',
    specialEvents: specialEvents.length > 0 ? specialEvents : undefined,
  };
}

function extractDatesFromText(text: string): {
  setDate: Date | null;
} {
  let setDate: Date | null = null;

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
      // TFT sets typically launch at 11 AM PT (18:00 UTC)
      const date = new Date(Date.UTC(year, monthNum, day, 18, 0, 0));

      if (date > new Date()) {
        setDate = date;
        console.log(`📅 Found set date: ${date.toISOString()}`);
        break;
      }
    }
  }

  return { setDate };
}
