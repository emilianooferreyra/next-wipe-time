import { newPage } from "../browser";
import type { WipeData } from "@/schemas/wipe-data";

/**
 * Scrape Apex Legends season information from Fandom Wiki
 *
 * Apex has seasons that last ~90 days (3 months).
 * Each season brings new legend, battle pass, and map changes.
 */
export async function scrapeApexSeasons(): Promise<WipeData> {
  try {
    console.log("📍 Fetching Apex Legends season info...");

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
    console.error("❌ Error scraping Apex:", error);
    throw new Error(`Failed to scrape Apex: ${error}`);
  }
}

async function scrapeEANews(): Promise<WipeData | null> {
  const page = await newPage();
  try {
    console.log("🔍 Checking EA Official News...");
    await page.goto("https://www.ea.com/games/apex-legends/news", {
      waitUntil: "domcontentloaded",
    });

    const articleData = await page.evaluate(() => {
      const articles = document.querySelectorAll("ea-tile");
      for (const article of articles) {
        const titleElement = article.querySelector("h3");
        const title = titleElement?.textContent?.trim() || "";
        const lowerTitle = title.toLowerCase();

        if (lowerTitle.includes("season")) {
          const linkElement = article.querySelector("a");
          const link = linkElement?.href;
          const fullText = article.textContent?.toLowerCase() || "";

          // Extract date from the article text
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
        potentialDate.setUTCHours(17, 0, 0, 0); // Apex seasons start at 10 AM PT

        const lastSeason = new Date(potentialDate);
        lastSeason.setDate(lastSeason.getDate() - 90);

        return {
          nextWipe: potentialDate.toISOString(),
          lastWipe: lastSeason.toISOString(),
          frequency: "Every ~3 months (90 days)",
          source: "EA News (Official)",
          scrapedAt: new Date().toISOString(),
          confirmed: true,
          announcement: title,
          patchNotes: link,
        };
      }
    }

    console.log("⚠️  No recent season found in EA News");
    return null;
  } catch (error) {
    console.error("❌ Error with EA News:", error);
    return null;
  } finally {
    await page.close();
  }
}

async function scrapeReddit(): Promise<WipeData | null> {
  try {
    const { scrapeRedditPosts, searchPosts, extractDatesFromPost } =
      await import("@/lib/reddit-scraper");

    // Fetch posts from r/apexlegends
    const posts = await scrapeRedditPosts("apexlegends", {
      limit: 50,
      sort: "new",
    });

    if (posts.length === 0) {
      console.log("⚠️  No posts found in r/apexlegends");
      return null;
    }

    // Search for season-related posts
    const seasonPosts = searchPosts(
      posts,
      [
        "season 27",
        "season 28",
        "season 29",
        "new season",
        "season announcement",
      ],
      ["tier list", "looking for", "lfg", "best legend", "tips", "how to"],
    );

    console.log(`🔍 Found ${seasonPosts.length} season-related posts`);

    // Try to find dates in relevant posts
    for (const post of seasonPosts) {
      const dates = extractDatesFromPost(post);

      if (dates.length > 0) {
        // Get the nearest future date
        const futureDate = dates.find((d) => d > new Date());

        if (futureDate) {
          const now = new Date();
          const daysUntil =
            (futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          // Validate: reasonable timeframe for season announcement
          if (daysUntil >= 3 && daysUntil <= 120) {
            const lastSeason = new Date(futureDate);
            lastSeason.setDate(lastSeason.getDate() - 90);

            console.log(`✅ Found season date in post: "${post.title}"`);

            // Extract patch notes from post body
            let patchNotes: string | undefined;
            const officialLinkRegex = /https?:\/\/(?:www\.)?(ea\.com|apexlegends\.com)[\w\/\-\.]+/g;
            const links = post.selftext.match(officialLinkRegex);

            if (links && links.length > 0) {
              patchNotes = links[0];
            } else if (post.selftext) {
              patchNotes = `${post.selftext.substring(0, 300)}...`;
            }

            return {
              nextWipe: futureDate.toISOString(),
              lastWipe: lastSeason.toISOString(),
              frequency: "Every ~3 months (90 days)",
              source: "r/apexlegends",
              scrapedAt: new Date().toISOString(),
              confirmed: true,
              announcement: post.title,
              patchNotes,
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
  console.log("⚠️  Using fallback schedule for Apex");

  // Known: Season 27 started November 4, 2025
  // Apex seasons typically last ~90 days
  const season27Start = new Date("2025-11-04T17:00:00Z"); // 10 AM PT
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
    frequency: "Every ~3 months (90 days)",
    source: "Based on Season 27 (Nov 4, 2025)",
    scrapedAt: new Date().toISOString(),
    confirmed: false,
    announcement: "Season 28 estimated ~Feb 2, 2026",
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
