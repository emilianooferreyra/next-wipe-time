import { newPage } from "../browser";
import type { WipeData } from "@/schemas/wipe-data";

/**
 * Scrape Valorant act information from Fandom Wiki
 *
 * Valorant has 6 acts per season, each lasting ~2 months.
 * Each act brings new Battle Pass, ranked changes, and sometimes new agents/maps.
 */
export async function scrapeValorantActs(): Promise<WipeData> {
  try {
    console.log("📍 Fetching Valorant act info...");

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

    // Fallback to known schedule
    return getFallbackSchedule();
  } catch (error) {
    console.error("❌ Error scraping Valorant:", error);
    throw new Error(`Failed to scrape Valorant: ${error}`);
  }
}

async function scrapeOfficialNews(): Promise<WipeData | null> {
  const page = await newPage();
  try {
    console.log("🔍 Checking Valorant Official News...");
    await page.goto("https://playvalorant.com/en-us/news/", {
      waitUntil: "domcontentloaded",
    });

    const articleData = await page.evaluate(() => {
      const articles = document.querySelectorAll("article");
      for (const article of articles) {
        const titleElement = article.querySelector("h5");
        const title = titleElement?.textContent?.trim() || "";
        const lowerTitle = title.toLowerCase();

        if (lowerTitle.includes("act") && (lowerTitle.includes("release") || lowerTitle.includes("guide"))) {
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
        potentialDate.setUTCHours(21, 0, 0, 0); // Valorant acts start at 2 PM PT
        const lastAct = new Date(potentialDate);
        lastAct.setDate(lastAct.getDate() - 60);

        return {
          nextWipe: potentialDate.toISOString(),
          lastWipe: lastAct.toISOString(),
          frequency: "Every ~2 months (6 acts per year)",
          source: "playvalorant.com (Official)",
          scrapedAt: new Date().toISOString(),
          confirmed: true,
          announcement: title,
          patchNotes: link,
        };
      }
    }
    return null;
  } catch (error) {
    console.error("❌ Error scraping Valorant News:", error);
    return null;
  } finally {
    await page.close();
  }
}

async function scrapeFandomWiki(): Promise<WipeData | null> {
  // Official news is now primary
  return null;
}

async function scrapeReddit(): Promise<WipeData | null> {
  try {
    const { scrapeRedditPosts, searchPosts, extractDatesFromPost } =
      await import("@/lib/reddit-scraper");

    const posts = await scrapeRedditPosts("VALORANT", {
      limit: 50,
      sort: "new",
    });

    if (posts.length === 0) {
      console.log("⚠️  No posts found in r/VALORANT");
      return null;
    }

    const actPosts = searchPosts(
      posts,
      ["episode", "act", "new act", "act announcement", "season 2025"],
      ["discussion", "question", "help", "bug", "tier list"],
    );

    console.log(`🔍 Found ${actPosts.length} act-related posts`);

    for (const post of actPosts) {
      const dates = extractDatesFromPost(post);

      if (dates.length > 0) {
        const futureDate = dates.find((d) => d > new Date());

        if (futureDate) {
          const now = new Date();
          const daysUntil =
            (futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

          if (daysUntil >= 3 && daysUntil <= 90) {
            const lastAct = new Date(futureDate);
            lastAct.setDate(lastAct.getDate() - 60);

            console.log(`✅ Found act date in post: "${post.title}"`);

            // Extract patch notes from post body
            let patchNotes: string | undefined;
            const officialLinkRegex = /https?:\/\/(?:www\.)?(playvalorant\.com|riotgames\.com)[\w\/\-\.]+/g;
            const links = post.selftext.match(officialLinkRegex);

            if (links && links.length > 0) {
              patchNotes = links[0];
            } else if (post.selftext) {
              patchNotes = `${post.selftext.substring(0, 300)}...`;
            }

            return {
              nextWipe: futureDate.toISOString(),
              lastWipe: lastAct.toISOString(),
              frequency: "Every ~2 months (6 acts per year)",
              source: "r/VALORANT",
              scrapedAt: new Date().toISOString(),
              confirmed: true,
              announcement: post.title,
              patchNotes,
            };
          }
        }
      }
    }

    console.log("⚠️  No act announcement found on Reddit");
    return null;
  } catch (error) {
    console.error("❌ Error with Reddit:", error);
    return null;
  }
}

function getFallbackSchedule(): WipeData {
  console.log("⚠️  Using fallback schedule for Valorant");

  // Known: Season 2025 started January 8, 2025
  // Acts are ~60 days each, 6 acts per year
  const season2025Start = new Date("2025-01-08T21:00:00Z");
  const now = new Date();

  let actNumber = 1;
  let nextActDate = new Date(season2025Start);

  // Calculate which act we're in
  while (nextActDate < now) {
    actNumber++;
    nextActDate = new Date(season2025Start);
    nextActDate.setDate(nextActDate.getDate() + (actNumber - 1) * 60);
  }

  const lastActDate = new Date(nextActDate);
  lastActDate.setDate(lastActDate.getDate() - 60);

  return {
    nextWipe: nextActDate.toISOString(),
    lastWipe: lastActDate.toISOString(),
    frequency: "Every ~2 months (6 acts per year)",
    source: "Based on Season 2025 schedule (Jan 8, 2025)",
    scrapedAt: new Date().toISOString(),
    confirmed: false,
    announcement: `Valorant Season 2025 Act ${actNumber} (estimated)`,
  };
}

function extractDatesFromText(text: string): {
  actDate: Date | null;
} {
  let actDate: Date | null = null;

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
      // Valorant acts typically launch at 2 PM PT (21:00 UTC)
      const date = new Date(Date.UTC(year, monthNum, day, 21, 0, 0));

      if (date > new Date()) {
        actDate = date;
        console.log(`📅 Found act date: ${date.toISOString()}`);
        break;
      }
    }
  }

  return { actDate };
}
