import { newPage } from "../browser";
import type { WipeData } from "@/schemas/wipe-data";

/**
 * Scrape Rocket League competitive season information
 *
 * Rocket League has competitive seasons that last ~3-4 months.
 * Each season brings new rewards and ranking resets.
 */
export async function scrapeRocketLeagueSeasons(): Promise<WipeData> {
  try {
    console.log("📍 Fetching Rocket League season info...");

    // Try Official News first
    const officialData = await scrapeOfficialNews();
    if (officialData) {
      return officialData;
    }

    // Try Reddit as backup
    const redditData = await scrapeReddit();
    if (redditData) {
      return redditData;
    }

    // Fallback to estimated schedule
    return getFallbackSchedule();
  } catch (error) {
    console.error("❌ Error scraping Rocket League:", error);
    throw new Error(`Failed to scrape Rocket League: ${error}`);
  }
}

async function scrapeOfficialNews(): Promise<WipeData | null> {
  const page = await newPage();
  try {
    console.log("🔍 Checking Rocket League Official News...");
    await page.goto("https://www.rocketleague.com/news/", {
      waitUntil: "domcontentloaded",
    });

    const articleData = await page.evaluate(() => {
      const articles = document.querySelectorAll("a[href*='/news/']");
      for (const article of articles) {
        const titleElement = article.querySelector("h2");
        const title = titleElement?.textContent?.trim() || "";
        const lowerTitle = title.toLowerCase();

        if (lowerTitle.includes("season") && (lowerTitle.includes("starts") || lowerTitle.includes("begins"))) {
          const link = (article as HTMLAnchorElement).href;
          const fullText = article.textContent?.toLowerCase() || "";
          
          const dateMatch = fullText.match(
            /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i,
          );

          if (dateMatch) {
            return {
              title,
              link,
              dateText: `${dateMatch[1]} ${dateMatch[2]}`,
            };
          }
        }
      }
      return null;
    });

    if (articleData) {
      const { title, link, dateText } = articleData;
      const potentialDate = new Date(`${dateText}, ${new Date().getFullYear()}`);

      if (potentialDate > new Date()) {
        potentialDate.setUTCHours(17, 0, 0, 0); // RL seasons start at 10 AM PT
        const lastSeason = new Date(potentialDate);
        lastSeason.setMonth(lastSeason.getMonth() - 3);

        return {
          nextWipe: potentialDate.toISOString(),
          lastWipe: lastSeason.toISOString(),
          frequency: "Every ~3-4 months",
          source: "rocketleague.com (Official)",
          scrapedAt: new Date().toISOString(),
          confirmed: true,
          announcement: title,
          patchNotes: link,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("❌ Error scraping Rocket League News:", error);
    return null;
  } finally {
    await page.close();
  }
}

// Removed scrapeFandom as official news is now the primary source.
async function scrapeFandom(): Promise<WipeData | null> {
  return null;
}

async function scrapeReddit(): Promise<WipeData | null> {
  try {
    const { scrapeRedditPosts, searchPosts, extractDatesFromPost } =
      await import("@/lib/reddit-scraper");

    const posts = await scrapeRedditPosts("RocketLeague", {
      limit: 50,
      sort: "new",
    });

    if (posts.length === 0) {
      console.log("⚠️  No posts found in r/RocketLeague");
      return null;
    }

    const seasonPosts = searchPosts(
      posts,
      ["new season", "season", "competitive season", "ranked season"],
      ["discussion", "question", "help", "tips", "rlcs"],
    );

    console.log(`🔍 Found ${seasonPosts.length} season-related posts`);

    for (const post of seasonPosts) {
      const dates = extractDatesFromPost(post);

      if (dates.length > 0) {
        const futureDate = dates.find((d) => d > new Date());

        if (futureDate) {
          const now = new Date();
          const daysUntil =
            (futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntil >= 3 && daysUntil <= 150) {
            const lastSeason = new Date(futureDate);
            lastSeason.setMonth(lastSeason.getMonth() - 3);

            console.log(`✅ Found season date in post: "${post.title}"`);

            return {
              nextWipe: futureDate.toISOString(),
              lastWipe: lastSeason.toISOString(),
              frequency: "Every ~3-4 months",
              source: "r/RocketLeague",
              scrapedAt: new Date().toISOString(),
              confirmed: true,
              announcement: post.title,
              patchNotes: post.url,
            };
          }
        }
      }
    }

    console.log("⚠️  No season announcement found on Reddit");
    return null;
  } catch (error) {
    console.error("❌ Error with Reddit:", error);
    return null;
  }
}

function getFallbackSchedule(): WipeData {
  console.log("⚠️  Using fallback schedule for Rocket League");

  const now = new Date();
  const nextSeason = new Date(now);
  nextSeason.setMonth(nextSeason.getMonth() + 2);

  const lastSeason = new Date(nextSeason);
  lastSeason.setMonth(lastSeason.getMonth() - 3);

  return {
    nextWipe: nextSeason.toISOString(),
    lastWipe: lastSeason.toISOString(),
    frequency: "Every ~3-4 months",
    source: "Estimated based on typical season length",
    scrapedAt: new Date().toISOString(),
    confirmed: false,
    announcement: "Estimated - check official sources",
  };
}

function extractDatesFromText(text: string): {
  seasonDate: Date | null;
} {
  let seasonDate: Date | null = null;

  const monthDayPattern =
    /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?/gi;

  const monthMap: Record<string, number> = {
    january: 0,
    jan: 0,
    february: 1,
    feb: 1,
    march: 2,
    mar: 2,
    april: 3,
    apr: 3,
    may: 4,
    june: 5,
    jun: 5,
    july: 6,
    jul: 6,
    august: 7,
    aug: 7,
    september: 8,
    sep: 8,
    october: 9,
    oct: 9,
    november: 10,
    nov: 10,
    december: 11,
    dec: 11,
  };

  const matches = text.matchAll(monthDayPattern);
  for (const match of matches) {
    const month = match[1].toLowerCase();
    const day = parseInt(match[2]);
    const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();

    const monthNum = monthMap[month];
    if (monthNum !== undefined) {
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
