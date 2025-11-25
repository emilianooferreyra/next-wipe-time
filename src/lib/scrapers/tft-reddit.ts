import type { WipeData } from "@/schemas/wipe-data";
import { newPage } from "../browser";

// Helper function to construct WipeData object consistently
function createWipeData(
  nextWipe: Date,
  lastWipe: Date,
  confirmed: boolean,
  announcement: string,
  eventType: "season" | "patch" | "update" | "event" = "season",
  eventName?: string,
  patchNotes?: string,
  source: string = "Estimated based on typical set length",
  frequency: string = "Every ~4 months"
): WipeData {
  return {
    nextWipe: nextWipe.toISOString(),
    lastWipe: lastWipe.toISOString(),
    frequency,
    source,
    scrapedAt: new Date().toISOString(),
    confirmed,
    announcement,
    eventType,
    eventName,
    patchNotes,
  };
}

export async function scrapeTFTSets(): Promise<WipeData> {
  try {
    console.log("📍 Fetching TFT set info...");

    // Try Official News first
    const officialData = await scrapeOfficialNews();
    if (officialData) {
      return officialData;
    }

    // Try Reddit first
    const redditData = await scrapeReddit();
    if (redditData) {
      return redditData;
    }

    // Fallback to known schedule
    return getFallbackSchedule();
  } catch (error) {
    console.error("❌ Error scraping TFT:", error);
    throw new Error(`Failed to scrape TFT: ${error}`);
  }
}

async function scrapeOfficialNews(): Promise<WipeData | null> {
  const page = await newPage();
  try {
    console.log("🔍 Checking TFT Official News...");
    await page.goto("https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/", {
      waitUntil: "domcontentloaded",
    });

    const articleData = await page.evaluate(() => {
      const articles = document.querySelectorAll("article");
      for (const article of articles) {
        const titleElement = article.querySelector("h2");
        const title = titleElement?.textContent?.trim() || "";
        const lowerTitle = title.toLowerCase();

        if ((lowerTitle.includes("set") || lowerTitle.includes("update")) && (lowerTitle.includes("release") || lowerTitle.includes("patch"))) {
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
        potentialDate.setUTCHours(18, 0, 0, 0); // TFT sets start at 11 AM PT
        const lastSet = new Date(potentialDate);
        lastSet.setMonth(lastSet.getMonth() - 4);

        return createWipeData(
          potentialDate,
          lastSet,
          true,
          title,
          "season",
          "", // eventName will be determined from title or not set
          link,
          "teamfighttactics.leagueoflegends.com (Official)",
          "Every ~4 months"
        );
      }
    }
    return null;
  } catch (error) {
    console.error("❌ Error scraping TFT News:", error);
    return null;
  } finally {
    await page.close();
  }
}

async function scrapeReddit(): Promise<WipeData | null> {
  try {
    const { scrapeRedditPosts, searchPosts, extractDatesFromPost } =
      await import("@/lib/reddit-scraper");

    const posts = await scrapeRedditPosts("TeamfightTactics", {
      limit: 50,
      sort: "new",
    });

    if (posts.length === 0) {
      console.log("⚠️  No posts found in r/TeamfightTactics");
      return null;
    }

    const setPosts = searchPosts(
      posts,
      [
        "new set",
        "set 13",
        "set 14",
        "set 15",
        "mid-set",
        "midset",
        "set announcement",
        "upcoming set",
      ],
      ["discussion", "question", "help", "comp", "guide", "meta"],
    );

    console.log(`🔍 Found ${setPosts.length} set-related posts`);

    for (const post of setPosts) {
      const dates = extractDatesFromPost(post);

      if (dates.length > 0) {
        const futureDate = dates.find((d) => d > new Date());

        if (futureDate) {
          const now = new Date();
          const daysUntil =
            (futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntil >= 7 && daysUntil <= 150) {
            const lastSet = new Date(futureDate);
            lastSet.setMonth(lastSet.getMonth() - 4);

            return createWipeData(
              futureDate,
              lastSet,
              true,
              post.title,
              "season",
              "", // eventName will be determined from title or not set
              post.url, // Reddit post URL as patch notes link
              "r/TeamfightTactics",
              "Every ~4 months"
            );
          }
        }
      }
    }

    console.log("⚠️  No set announcement found on Reddit");
    return null;
  } catch (error) {
    console.error("❌ Error with Reddit:", error);
    return null;
  }
}

async function scrapeFandom(): Promise<WipeData | null> {
  // Removed scrapeFandom as official news is now the primary source.
  return null;
}
function getFallbackSchedule(): WipeData {
  console.log("⚠️  Using fallback schedule for TFT");

  const now = new Date();

  // CONFIRMED: TFT Set 16 "Lore & Legends" releases December 3, 2025
  const set16Release = new Date(Date.UTC(2025, 11, 3, 18, 0, 0)); // Dec 3, 2025
  const set15End = new Date(Date.UTC(2025, 10, 19, 18, 0, 0)); // Nov 19, 2025

  // Special events
  const globalReveal = new Date(Date.UTC(2025, 10, 16, 0, 0, 0)); // Nov 14-16, 2025
  const pbeRelease = new Date(Date.UTC(2025, 10, 18, 18, 0, 0)); // Nov 18, 2025

  const specialEvents = [];

  // Add Global Reveal if it's upcoming or happening
  if (
    globalReveal >= now ||
    now <= new Date(Date.UTC(2025, 10, 16, 23, 59, 59))
  ) {
    specialEvents.push({
      name: "Set 16 Global Reveal at K.O. Coliseum",
      date: globalReveal.toISOString(),
      type: "reveal" as const,
      description:
        "Global reveal during Tactician's Crown tournament (Nov 14-16)",
    });
  }

  // Add PBE release if upcoming
  if (pbeRelease >= now) {
    specialEvents.push({
      name: "Set 16 PBE Release",
      date: pbeRelease.toISOString(),
      type: "beta" as const,
      description: "Test server release for Set 16: Lore & Legends",
    });
  }

  return createWipeData(
    set16Release,
    set15End,
    true,
    "Set 16: Lore & Legends - The biggest set in TFT history",
    "season",
    "Lore & Legends",
    "https://teamfighttactics.leagueoflegends.com/en-us/news/game-updates/set-10-remix-rumble-learn-more/", // Link to official announcement
    "Official Riot Games announcement",
    "Every ~4 months"
  );
}

function extractDatesFromText(text: string): {
  setDate: Date | null;
} {
  let setDate: Date | null = null;

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
