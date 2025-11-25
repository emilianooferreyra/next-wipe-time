import { newPage } from "../browser";
import type { WipeData } from "@/schemas/wipe-data";

export async function scrapeDestiny2Season(): Promise<WipeData> {
  const page = await newPage();
  try {
    console.log("📍 Navigating to Bungie news for Destiny 2...");
    await page.goto("https://www.bungie.net/en/explore/category/news", {
      waitUntil: "domcontentloaded",
    });

    const articleData = await page.evaluate(() => {
      const articles = document.querySelectorAll("a[href*='/news/article/']");
      for (const article of articles) {
        const titleElement = article.querySelector("div[class*='-title']");
        const title = titleElement?.textContent?.trim() || "";
        const lowerTitle = title.toLowerCase();

        if (lowerTitle.includes("season") && (lowerTitle.includes("release") || lowerTitle.includes("launch"))) {
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
        potentialDate.setUTCHours(17, 0, 0, 0); // Destiny resets are at 10 AM PT
        const lastSeason = new Date(potentialDate);
        lastSeason.setMonth(lastSeason.getMonth() - 3);

        return {
          nextWipe: potentialDate.toISOString(),
          lastWipe: lastSeason.toISOString(),
          frequency: "Every ~3 months",
          source: "Bungie News (Official)",
          scrapedAt: new Date().toISOString(),
          confirmed: true,
          announcement: title,
          patchNotes: link,
        };
      }
    }

    // Fallback if no specific date is found
    console.log("⚠️ No specific date found, using estimation.");
    const now = new Date();
    const lastWipe = new Date(now);
    lastWipe.setDate(lastWipe.getDate() - 45);
    const nextWipe = new Date(now);
    nextWipe.setDate(nextWipe.getDate() + 45);

    return {
      nextWipe: nextWipe.toISOString(),
      lastWipe: lastWipe.toISOString(),
      frequency: "Every ~3 months",
      source: "Bungie News (Estimated)",
      scrapedAt: new Date().toISOString(),
      confirmed: false,
      announcement: "Check Bungie.net for confirmed season dates.",
    };

  } catch (error) {
    console.error("Error scraping Destiny 2:", error);
    throw new Error(`Failed to scrape Destiny 2 season data: ${error}`);
  } finally {
    await page.close();
  }
}
