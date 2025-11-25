import { newPage } from "../browser";
import type { WipeData } from "@/schemas/wipe-data";

export async function scrapeOverwatch2Season(): Promise<WipeData> {
  const page = await newPage();

  try {
    console.log("📍 Navigating to Overwatch 2 news...");

    await page.goto("https://overwatch.blizzard.com/en-us/news/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    console.log("✅ Page loaded, waiting for content...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await page.evaluate(() => {
      const articles = Array.from(
        document.querySelectorAll(
          'a[href*="/news/article/"]',
        ),
      );

      for (const article of articles) {
        const titleElement = article.querySelector("h5");
        const title = titleElement?.textContent?.trim() || "";
        const lowerTitle = title.toLowerCase();

        if (lowerTitle.includes("season") && (lowerTitle.includes("begins") || lowerTitle.includes("starts") || lowerTitle.includes("coming"))) {
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

    if (data) {
      const { title, link, dateText } = data;
      const potentialDate = new Date(`${dateText}, ${new Date().getFullYear()}`);

      if (potentialDate > new Date()) {
        potentialDate.setUTCHours(19, 0, 0, 0); // OW2 seasons typically start at 12 PM PT

        const lastWipe = new Date(potentialDate);
        lastWipe.setDate(lastWipe.getDate() - 63); // ~9 weeks per season

        return {
          nextWipe: potentialDate.toISOString(),
          lastWipe: lastWipe.toISOString(),
          frequency: "Every ~9 weeks",
          source: "Overwatch 2 News (Official)",
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
    lastWipe.setDate(lastWipe.getDate() - 30); // Estimate last season started ~30 days ago
    const nextWipe = new Date(now);
    nextWipe.setDate(nextWipe.getDate() + 35); // Estimate next season in ~35 days

    return {
      nextWipe: nextWipe.toISOString(),
      lastWipe: lastWipe.toISOString(),
      frequency: "Every ~9 weeks",
      source: "Overwatch 2 News (Estimated)",
      scrapedAt: new Date().toISOString(),
      confirmed: false,
      announcement: "Check official Overwatch news for confirmed dates",
    };
  } catch (error) {
    console.error("Error scraping Overwatch 2:", error);
    throw new Error(`Failed to scrape Overwatch 2 season data: ${error}`);
  } finally {
    await page.close();
  }
}
