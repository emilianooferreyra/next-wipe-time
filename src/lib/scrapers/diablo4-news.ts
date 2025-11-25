import { newPage } from "../browser";
import type { WipeData } from "@/schemas/wipe-data";

/**
 * Scrape Diablo 4 season information from Blizzard News and Reddit
 *
 * Diablo 4 has seasonal content with seasons typically lasting 3 months.
 * Each season brings new storylines, mechanics, and rewards.
 */
export async function scrapeDiablo4Seasons(): Promise<WipeData> {
  try {
    console.log("📍 Fetching Diablo 4 season info...");

    // Try Blizzard News first (most reliable)
    const blizzardData = await scrapeBlizzardNews();
    if (blizzardData) {
      return blizzardData;
    }

    // Fallback to known schedule (Season 11 - Dec 9, 2025)
    return getFallbackSchedule();
  } catch (error) {
    console.error("❌ Error scraping Diablo 4:", error);
    throw new Error(`Failed to scrape Diablo 4: ${error}`);
  }
}

async function scrapeBlizzardNews(): Promise<WipeData | null> {
  const page = await newPage();
  try {
    console.log("🔍 Checking Blizzard News (Diablo 4 section)...");
    await page.goto("https://news.blizzard.com/en-us/diablo4", {
      waitUntil: "domcontentloaded",
    });

    const articleData = await page.evaluate(() => {
      const articles = document.querySelectorAll("div[class*='ArticleListItem']");
      for (const article of articles) {
        const titleElement = article.querySelector("h2");
        const title = titleElement?.textContent?.trim() || "";
        const lowerTitle = title.toLowerCase();

        if (lowerTitle.includes("season") && (lowerTitle.includes("begins") || lowerTitle.includes("starts") || lowerTitle.includes("coming"))) {
          const linkElement = article.querySelector("a");
          const link = linkElement?.href;
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
        potentialDate.setUTCHours(18, 0, 0, 0); // Diablo seasons typically launch at 10 AM PT
        const lastSeason = new Date(potentialDate);
        lastSeason.setMonth(lastSeason.getMonth() - 3);

        return {
          nextWipe: potentialDate.toISOString(),
          lastWipe: lastSeason.toISOString(),
          frequency: "Every 3 months (Seasonal)",
          source: "news.blizzard.com (Official)",
          scrapedAt: new Date().toISOString(),
          confirmed: true,
          announcement: title,
          patchNotes: link,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("❌ Error with Blizzard News:", error);
    return null;
  } finally {
    await page.close();
  }
}

// Removed scrapeCommunitySites due to unreliability of external URLs.
// If needed, it can be re-implemented with a more robust strategy.

function getFallbackSchedule(): WipeData {
  console.log("⚠️  Using fallback schedule for Diablo 4");

  // Known: Season 11 starts December 9, 2025
  const season11Date = new Date("2025-12-09T18:00:00Z");
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
    frequency: "Every 3 months (Seasonal)",
    source: "Based on announced Season 11 (Dec 9, 2025)",
    scrapedAt: new Date().toISOString(),
    confirmed: true,
    announcement: "Diablo IV Season 11 - December 9, 2025",
  };
}

function extractDatesFromHTML(
  html: string,
  startIndex: number,
): {
  seasonDate: Date | null;
} {
  // Extract text around the match (500 chars before and after)
  const snippet = html.substring(
    Math.max(0, startIndex - 500),
    Math.min(html.length, startIndex + 500),
  );

  return extractDatesFromText(snippet);
}

function extractDatesFromText(text: string): {
  seasonDate: Date | null;
} {
  let seasonDate: Date | null = null;

  // Month + day pattern
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
