import type { WipeData } from '@/schemas/wipe-data';

/**
 * Scrape Last Epoch cycle information from official forums
 *
 * Last Epoch has "Cycles" (similar to seasons/leagues).
 * Cycles typically last 3-4 months with fresh economy and new content.
 */
export async function scrapeLastEpochCycles(): Promise<WipeData> {
  try {
    console.log('📍 Fetching Last Epoch cycle info...');

    // Try multiple sources in order of reliability

    // 1. Try official forum first
    const forumData = await scrapeForumAnnouncements();
    if (forumData) {
      return forumData;
    }

    // 2. Try Reddit r/LastEpoch
    const redditData = await scrapeRedditAnnouncements();
    if (redditData) {
      return redditData;
    }

    // 3. Try Steam news
    const steamData = await scrapeSteamNews();
    if (steamData) {
      return steamData;
    }

    // 4. Fallback to known schedule
    return getFallbackSchedule();

  } catch (error) {
    console.error('❌ Error scraping Last Epoch:', error);
    throw new Error(`Failed to scrape Last Epoch: ${error}`);
  }
}

async function scrapeForumAnnouncements(): Promise<WipeData | null> {
  try {
    console.log('🔍 Checking Last Epoch forums...');

    const forumUrl = 'https://forum.lastepoch.com/c/announcements/37.json';

    const response = await fetch(forumUrl, {
      headers: {
        'User-Agent': 'NextWipeTime/1.0 (Cycle Tracker)',
      },
    });

    if (!response.ok) {
      console.log(`⚠️  Forum returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Found ${data.topic_list?.topics?.length || 0} topics`);

    // Look for cycle announcements
    const cycleKeywords = [
      'cycle',
      'season',
      'patch',
      'harbingers',
      'reset',
      'new content'
    ];

    const excludeKeywords = [
      'poll',
      'survey',
      'hotfix',
      'bugfix',
      'maintenance'
    ];

    if (data.topic_list?.topics) {
      for (const topic of data.topic_list.topics) {
        const title = topic.title?.toLowerCase() || '';

        // Skip excluded topics
        const isExcluded = excludeKeywords.some(k => title.includes(k));
        if (isExcluded) {
          console.log('⏭️  Skipping non-cycle post:', topic.title);
          continue;
        }

        // Check for cycle keywords
        const hasCycleKeyword = cycleKeywords.some(k => title.includes(k));

        if (hasCycleKeyword) {
          console.log('🎯 Found potential cycle announcement:', topic.title);

          // Try to extract dates from title
          const dates = extractDatesFromText(topic.title);

          if (dates.cycleDate) {
            const now = new Date();
            const daysUntilCycle = (dates.cycleDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

            // Validate: Cycles need at least 7 days notice
            if (daysUntilCycle >= 7 && daysUntilCycle <= 180) {
              const lastCycleDate = new Date(dates.cycleDate);
              lastCycleDate.setMonth(lastCycleDate.getMonth() - 4); // ~4 months before

              return {
                nextWipe: dates.cycleDate.toISOString(),
                lastWipe: lastCycleDate.toISOString(),
                frequency: 'Every 3-4 months (Cycles)',
                source: 'forum.lastepoch.com (Official)',
                scrapedAt: new Date().toISOString(),
                confirmed: true,
                announcement: topic.title,
              };
            }
          }

          // Also check the topic creation/update date as potential cycle start
          if (topic.created_at || topic.bumped_at) {
            const topicDate = new Date(topic.created_at || topic.bumped_at);
            const now = new Date();

            // If this is a recent announcement (within last 7 days)
            const daysSincePost = (now.getTime() - topicDate.getTime()) / (1000 * 60 * 60 * 24);

            if (daysSincePost <= 7) {
              // This might be an announcement for an upcoming cycle
              // Estimate cycle start ~2 weeks from announcement
              const estimatedCycleStart = new Date(topicDate);
              estimatedCycleStart.setDate(estimatedCycleStart.getDate() + 14);

              if (estimatedCycleStart > now) {
                const lastCycle = new Date(estimatedCycleStart);
                lastCycle.setMonth(lastCycle.getMonth() - 4);

                return {
                  nextWipe: estimatedCycleStart.toISOString(),
                  lastWipe: lastCycle.toISOString(),
                  frequency: 'Every 3-4 months (Cycles)',
                  source: 'forum.lastepoch.com (Estimated from recent announcement)',
                  scrapedAt: new Date().toISOString(),
                  confirmed: false,
                  announcement: topic.title,
                };
              }
            }
          }
        }
      }
    }

    console.log('⚠️  No cycle announcement found in forums');
    return null;

  } catch (error) {
    console.error('❌ Error with forum:', error);
    return null;
  }
}

function getFallbackSchedule(): WipeData {
  console.log('⚠️  Using fallback schedule for Last Epoch');

  // Known recent cycles:
  // - Cycle 1.1 (Season 2): May 2024
  // - Cycle 1.2 "Harbingers of Ruin" (Season 3): August 21, 2024
  // - Season 3 extended to Q1 2025 (January-March 2025)
  // - Typical cycle duration: 3-4 months (irregular, devs prioritizing quality over strict schedules)

  const lastKnownCycle = new Date('2024-08-21T17:00:00Z'); // Cycle 1.2 Harbingers of Ruin (Season 3)

  // Season 3 extended to Q1 2025 - estimate mid-February 2025 for next cycle
  // Using February 15, 2025 as estimated next cycle (Q1 2025 midpoint)
  const estimatedNextCycle = new Date('2025-02-15T17:00:00Z'); // Q1 2025 estimate

  return {
    nextWipe: estimatedNextCycle.toISOString(),
    lastWipe: lastKnownCycle.toISOString(),
    frequency: 'Every 3-4 months (Cycles)',
    source: 'Estimated based on Season 3 extension to Q1 2025',
    scrapedAt: new Date().toISOString(),
    confirmed: false,
    announcement: 'Season 3 (Harbingers of Ruin) extended to Q1 2025. Next cycle expected mid-February 2025. Last Epoch announces new cycles 1-2 weeks in advance. Devs prioritize quality updates over strict schedules. Check forum.lastepoch.com, r/LastEpoch, or Steam for official announcements.',
  };
}

async function scrapeRedditAnnouncements(): Promise<WipeData | null> {
  try {
    console.log('🔍 Checking Reddit r/LastEpoch...');

    const redditUrl = 'https://www.reddit.com/r/LastEpoch/hot.json?limit=25';

    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'NextWipeTime/1.0 (Cycle Tracker)',
      },
    });

    if (!response.ok) {
      console.log(`⚠️  Reddit returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    const posts = data.data?.children || [];
    console.log(`✅ Found ${posts.length} Reddit posts`);

    const cycleKeywords = ['cycle', 'season', 'new cycle', 'next cycle', 'patch', 'update'];
    const excludeKeywords = ['poll', 'survey', 'bug', 'build', 'help'];

    for (const post of posts) {
      const title = post.data.title?.toLowerCase() || '';
      const selftext = post.data.selftext?.toLowerCase() || '';
      const fullText = `${title} ${selftext}`;

      // Skip excluded posts
      const isExcluded = excludeKeywords.some(k => fullText.includes(k));
      if (isExcluded) continue;

      // Check for cycle keywords
      const hasCycleKeyword = cycleKeywords.some(k => fullText.includes(k));

      if (hasCycleKeyword && post.data.link_flair_text?.toLowerCase().includes('news')) {
        console.log('🎯 Found potential cycle announcement on Reddit:', title);

        const dates = extractDatesFromText(fullText);
        if (dates.cycleDate) {
          const now = new Date();
          const daysUntilCycle = (dates.cycleDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntilCycle >= 1 && daysUntilCycle <= 180) {
            const lastCycleDate = new Date(dates.cycleDate);
            lastCycleDate.setMonth(lastCycleDate.getMonth() - 4);

            return {
              nextWipe: dates.cycleDate.toISOString(),
              lastWipe: lastCycleDate.toISOString(),
              frequency: 'Every 3-4 months (Cycles)',
              source: 'Reddit r/LastEpoch',
              scrapedAt: new Date().toISOString(),
              confirmed: true,
              announcement: post.data.title,
            };
          }
        }
      }
    }

    console.log('⚠️  No cycle announcement found on Reddit');
    return null;

  } catch (error) {
    console.error('❌ Error with Reddit:', error);
    return null;
  }
}

async function scrapeSteamNews(): Promise<WipeData | null> {
  try {
    console.log('🔍 Checking Steam news...');

    // Last Epoch App ID: 899770
    const steamUrl = 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=899770&count=10&format=json';

    const response = await fetch(steamUrl, {
      headers: {
        'User-Agent': 'NextWipeTime/1.0 (Cycle Tracker)',
      },
    });

    if (!response.ok) {
      console.log(`⚠️  Steam returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    const newsItems = data.appnews?.newsitems || [];
    console.log(`✅ Found ${newsItems.length} Steam news items`);

    const cycleKeywords = ['cycle', 'season', 'new content', 'major update', 'harbingers'];

    for (const item of newsItems) {
      const title = item.title?.toLowerCase() || '';
      const contents = item.contents?.toLowerCase() || '';
      const fullText = `${title} ${contents}`;

      const hasCycleKeyword = cycleKeywords.some(k => fullText.includes(k));

      if (hasCycleKeyword) {
        console.log('🎯 Found potential cycle announcement on Steam:', item.title);

        const dates = extractDatesFromText(fullText);
        if (dates.cycleDate) {
          const now = new Date();
          const daysUntilCycle = (dates.cycleDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntilCycle >= 1 && daysUntilCycle <= 180) {
            const lastCycleDate = new Date(dates.cycleDate);
            lastCycleDate.setMonth(lastCycleDate.getMonth() - 4);

            return {
              nextWipe: dates.cycleDate.toISOString(),
              lastWipe: lastCycleDate.toISOString(),
              frequency: 'Every 3-4 months (Cycles)',
              source: 'Steam News (Official)',
              scrapedAt: new Date().toISOString(),
              confirmed: true,
              announcement: item.title,
            };
          }
        }
      }
    }

    console.log('⚠️  No cycle announcement found on Steam');
    return null;

  } catch (error) {
    console.error('❌ Error with Steam:', error);
    return null;
  }
}

function extractDatesFromText(text: string): {
  cycleDate: Date | null;
} {
  let cycleDate: Date | null = null;

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
      // Last Epoch cycles typically launch at 12 PM EST (17:00 UTC)
      const date = new Date(Date.UTC(year, monthNum, day, 17, 0, 0));

      if (date > new Date()) {
        cycleDate = date;
        console.log(`📅 Found cycle date: ${date.toISOString()}`);
        break;
      }
    }
  }

  return { cycleDate };
}
