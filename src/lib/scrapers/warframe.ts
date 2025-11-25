import { newPage } from "../browser";
import type { WipeData } from "@/schemas/wipe-data";

export async function scrapeWarframeUpdate(): Promise<WipeData> {
  const page = await newPage();

  try {
    console.log("📍 Navigating to Warframe news...");

    await page.goto("https://www.warframe.com/news", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    console.log("✅ Page loaded, waiting for content...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await page.evaluate(() => {
      const articles = Array.from(
        document.querySelectorAll('a[href*="/news/"]'),
      );

      for (const article of articles) {
        const titleElement = article.querySelector("h2");
        const title = titleElement?.textContent?.trim() || "";
        const lowerTitle = title.toLowerCase();

        if (
          (lowerTitle.includes("update") || lowerTitle.includes("expansion")) &&
          !lowerTitle.includes("hotfix") &&
          (lowerTitle.includes("coming") ||
            lowerTitle.includes("arriving") ||
            lowerTitle.includes("release"))
        ) {
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
        potentialDate.setUTCHours(17, 0, 0, 0); // Warframe updates typically release at 12 PM ET

        const lastWipe = new Date(potentialDate);
        lastWipe.setMonth(lastWipe.getMonth() - 3); // Estimate last major update ~3 months ago

        return {
          nextWipe: potentialDate.toISOString(),
          lastWipe: lastWipe.toISOString(),
          frequency: "Major updates 2-4 times per year",
          source: "Warframe News (Official)",
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
    lastWipe.setDate(lastWipe.getDate() - 90); // Estimate last major update ~3 months ago
    const nextWipe = new Date(now);
    nextWipe.setDate(nextWipe.getDate() + 90); // Estimate next major update in ~3 months

    return {
      nextWipe: nextWipe.toISOString(),
      lastWipe: lastWipe.toISOString(),
      frequency: "Major updates 2-4 times per year",
      source: "Warframe News (Estimated)",
      scrapedAt: new Date().toISOString(),
      confirmed: false,
      announcement: "Check Warframe.com for confirmed update dates",
    };
  } catch (error) {
    console.error("Error scraping Warframe:", error);
    throw new Error(`Failed to scrape Warframe update data: ${error}`);
  } finally {
    await page.close();
  }
}
