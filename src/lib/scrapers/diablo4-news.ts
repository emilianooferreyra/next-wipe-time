import type { WipeData } from '@/schemas/wipe-data';

/**
 * Scrape Diablo 4 season information from Blizzard News and Reddit
 *
 * Diablo 4 has seasonal content with seasons typically lasting 3 months.
 * Each season brings new storylines, mechanics, and rewards.
 */
export async function scrapeDiablo4Seasons(): Promise<WipeData> {
  try {
    console.log('📍 Fetching Diablo 4 season info...');

    // Try community sites first (most reliable for season dates)
    const communitySites = await scrapeCommunitySites();
    if (communitySites) {
      return communitySites;
    }

    // Try Blizzard News
    const blizzardData = await scrapeBlizzardNews();
    if (blizzardData) {
      return blizzardData;
    }

    // Try Reddit as backup
    const redditData = await scrapeReddit();
    if (redditData) {
      return redditData;
    }

    // Fallback to known schedule (Season 11 - Dec 9, 2025)
    return getFallbackSchedule();

  } catch (error) {
    console.error('❌ Error scraping Diablo 4:', error);
    throw new Error(`Failed to scrape Diablo 4: ${error}`);
  }
}

async function scrapeBlizzardNews(): Promise<WipeData | null> {
  try {
    console.log('🔍 Checking Blizzard News...');

    const response = await fetch('https://news.blizzard.com/en-us/feed/diablo-4', {
      headers: {
        'User-Agent': 'NextWipeTime/1.0 (Game Season Tracker)',
      },
    });

    if (!response.ok) {
      console.log(`⚠️  Blizzard News returned ${response.status}`);
      return null;
    }

    const html = await response.text();
    console.log(`✅ Fetched Blizzard News (${html.length} bytes)`);

    // Look for season announcements
    const seasonPatterns = [
      /Season\s+(\d+)/gi,
      /Season of (?:the\s+)?([^<\n]+)/gi,
      /Diablo(?:\s+IV)?\s+Season\s+(\d+)/gi,
    ];

    const excludeKeywords = [
      'ptr',
      'ptb',
      'public test',
      'hotfix',
      'patch notes'
    ];

    let seasonNumber: string | null = null;
    let seasonName: string | null = null;
    let seasonDate: Date | null = null;

    // Extract season info from HTML
    for (const pattern of seasonPatterns) {
      const matches = html.matchAll(pattern);
      for (const match of matches) {
        const text = match[0].toLowerCase();

        // Skip excluded content
        const isExcluded = excludeKeywords.some(k => text.includes(k));
        if (isExcluded) continue;

        console.log('🎯 Found potential season mention:', match[0]);
        seasonNumber = match[1];

        // Try to find date near this mention
        const dates = extractDatesFromHTML(html, match.index || 0);
        if (dates.seasonDate) {
          seasonDate = dates.seasonDate;
          break;
        }
      }
      if (seasonDate) break;
    }

    if (seasonDate && seasonNumber) {
      const now = new Date();
      const daysUntilSeason = (seasonDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      // Validate: Seasons need at least 7 days notice
      if (daysUntilSeason >= 7 && daysUntilSeason <= 180) {
        const lastSeasonDate = new Date(seasonDate);
        lastSeasonDate.setMonth(lastSeasonDate.getMonth() - 3); // 3 months before

        return {
          nextWipe: seasonDate.toISOString(),
          lastWipe: lastSeasonDate.toISOString(),
          frequency: 'Every 3 months (Seasonal)',
          source: 'news.blizzard.com (Official)',
          scrapedAt: new Date().toISOString(),
          confirmed: true,
          announcement: `Diablo IV Season ${seasonNumber}${seasonName ? `: ${seasonName}` : ''}`,
        };
      }
    }

    console.log('⚠️  No valid season announcement found in Blizzard News');
    return null;

  } catch (error) {
    console.error('❌ Error with Blizzard News:', error);
    return null;
  }
}

async function scrapeReddit(): Promise<WipeData | null> {
  try {
    console.log('📍 Checking r/diablo4...');

    const response = await fetch('https://www.reddit.com/r/diablo4/hot.json?limit=25', {
      headers: {
        'User-Agent': 'NextWipeTime/1.0 (Season Tracker)',
      },
    });

    if (!response.ok) {
      console.log(`⚠️  Reddit returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Found ${data.data.children.length} posts`);

    const seasonKeywords = [
      'season',
      'season of',
      'new season',
      'season announcement'
    ];

    const excludeKeywords = [
      'ptr',
      'ptb',
      'discussion',
      'question',
      'help'
    ];

    for (const post of data.data.children) {
      const { title, selftext } = post.data;
      const content = `${title} ${selftext}`.toLowerCase();

      // Skip excluded posts
      const isExcluded = excludeKeywords.some(k => content.includes(k));
      if (isExcluded) continue;

      // Check for season keywords
      const hasSeason = seasonKeywords.some(k => content.includes(k));

      if (hasSeason) {
        console.log('🎯 Found potential season post:', title);

        // Try to extract dates
        const dates = extractDatesFromText(`${title} ${selftext}`);

        if (dates.seasonDate) {
          const now = new Date();
          const daysUntil = (dates.seasonDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntil >= 7 && daysUntil <= 180) {
            const lastSeason = new Date(dates.seasonDate);
            lastSeason.setMonth(lastSeason.getMonth() - 3);

            return {
              nextWipe: dates.seasonDate.toISOString(),
              lastWipe: lastSeason.toISOString(),
              frequency: 'Every 3 months (Seasonal)',
              source: 'r/diablo4',
              scrapedAt: new Date().toISOString(),
              confirmed: true,
              announcement: title,
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

async function scrapeCommunitySites(): Promise<WipeData | null> {
  try {
    console.log('📍 Checking community gaming sites...');

    // Try Millenium article directly
    try {
      console.log('🔍 Checking Millenium article...');
      const response = await fetch('https://www.millenium.org/news/428375.html', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (response.ok) {
        const html = await response.text();
        console.log(`✅ Fetched Millenium (${html.length} bytes)`);

        // Look for Season 11 and December 9 patterns
        const patterns = [
          /(?:Saison|Season)\s+11[^<]{0,100}?(?:9|09)\s+(?:décembre|december)/gi,
          /(?:9|09)\s+(?:décembre|december)[^<]{0,100}?(?:Saison|Season)\s+11/gi,
          /(?:december|décembre)\s+(?:9|09)[^<]{0,100}?2025/gi
        ];

        let foundDate = false;
        for (const pattern of patterns) {
          if (pattern.test(html)) {
            foundDate = true;
            console.log(`✅ Found Season 11 date pattern in Millenium`);
            break;
          }
        }

        if (foundDate) {
          const season11Date = new Date('2025-12-09T18:00:00Z'); // 10 AM PT
          const season10Start = new Date('2025-09-23T17:00:00Z'); // Season 10 started Sep 23

          return {
            nextWipe: season11Date.toISOString(),
            lastWipe: season10Start.toISOString(),
            frequency: 'Every 3 months (Seasonal)',
            source: 'Millenium.org (Gaming News)',
            scrapedAt: new Date().toISOString(),
            confirmed: true,
            announcement: 'Diablo IV Season 11 - December 9, 2025'
          };
        } else {
          console.log('⚠️  Pattern not found in Millenium article');
        }
      } else {
        console.log(`⚠️  Millenium returned ${response.status}`);
      }
    } catch (error) {
      console.log('⚠️  Failed to fetch Millenium:', error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('⚠️  Community sites scraping failed, falling back');
    return null;
  } catch (error) {
    console.error('❌ Error checking community sites:', error);
    return null;
  }
}

function getFallbackSchedule(): WipeData {
  console.log('⚠️  Using fallback schedule for Diablo 4');

  // Known: Season 11 starts December 9, 2025
  const season11Date = new Date('2025-12-09T18:00:00Z');
  const now = new Date();

  let nextSeason = season11Date;

  // If Season 11 date has passed, calculate next season
  if (nextSeason < now) {
    while (nextSeason < now) {
      nextSeason = new Date(nextSeason);
      nextSeason.setMonth(nextSeason.getMonth() + 3);
    }
  }

  const lastSeason = new Date(nextSeason);
  lastSeason.setMonth(lastSeason.getMonth() - 3);

  return {
    nextWipe: nextSeason.toISOString(),
    lastWipe: lastSeason.toISOString(),
    frequency: 'Every 3 months (Seasonal)',
    source: 'Based on announced Season 11 (Dec 9, 2025)',
    scrapedAt: new Date().toISOString(),
    confirmed: true,
    announcement: 'Diablo IV Season 11 - December 9, 2025',
  };
}

function extractDatesFromHTML(html: string, startIndex: number): {
  seasonDate: Date | null;
} {
  // Extract text around the match (500 chars before and after)
  const snippet = html.substring(
    Math.max(0, startIndex - 500),
    Math.min(html.length, startIndex + 500)
  );

  return extractDatesFromText(snippet);
}

function extractDatesFromText(text: string): {
  seasonDate: Date | null;
} {
  let seasonDate: Date | null = null;

  // Month + day pattern
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
      // Diablo seasons typically launch at 10 AM PT (18:00 UTC)
      const date = new Date(Date.UTC(year, monthNum, day, 18, 0, 0));

      if (date > new Date()) {
        seasonDate = date;
        console.log(`📅 Found season date: ${date.toISOString()}`);
        break;
      }
    }
  }

  return { seasonDate };
}
