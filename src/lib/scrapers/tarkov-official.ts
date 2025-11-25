import { newPage } from "../browser";
import type { WipeData } from "@/schemas/wipe-data";

/**
 * Scrape official Tarkov news from escapefromtarkov.com
 * Looks for the latest wipe announcement with changelog information
 */
export async function scrapeTarkovOfficial(): Promise<WipeData | null> {
  const page = await newPage();

  try {
    console.log("📍 Fetching Tarkov official news...");

    // Go to news page
    await page.goto("https://www.escapefromtarkov.com/news", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    console.log("✅ News page loaded");

    // Wait for content to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Extract news articles
    const newsData = await page.evaluate(() => {
      const articles = [];

      // Look for article containers
      const articleElements = document.querySelectorAll(
        '[class*="news"], article, [class*="post"], [class*="article"]'
      );

      for (const element of Array.from(articleElements).slice(0, 10)) {
        const titleEl = element.querySelector("h1, h2, h3, .title, [class*='title']");
        const dateEl = element.querySelector(
          "time, [class*='date'], .published, .date"
        );
        const contentEl = element.querySelector(
          "[class*='content'], [class*='description'], p"
        );
        const linkEl = element.querySelector("a");

        if (titleEl && linkEl) {
          articles.push({
            title: titleEl.textContent?.trim() || "",
            date: dateEl?.textContent?.trim() || "",
            content: contentEl?.textContent?.substring(0, 500) || "",
            link: linkEl.href || "",
          });
        }
      }

      return articles;
    });

    console.log("📊 Found articles:", newsData.length);

    // Look for wipe-related articles
    const wipeArticles = newsData.filter((article) => {
      const text = `${article.title} ${article.content}`.toLowerCase();
      return (
        text.includes("wipe") ||
        text.includes("reset") ||
        text.includes("season") ||
        text.includes("patch")
      );
    });

    if (wipeArticles.length === 0) {
      console.log("⚠️  No wipe articles found");
      return null;
    }

    // Get the most recent wipe article
    const latestArticle = wipeArticles[0];
    console.log("🎯 Latest wipe article:", latestArticle.title);

    // Now fetch the detailed article page for more info
    if (latestArticle.link) {
      console.log("📍 Fetching detailed article...");
      await page.goto(latestArticle.link, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const detailedData = await page.evaluate(() => {
        const title = document.querySelector("h1, h2, [class*='title']");
        const date = document.querySelector(
          "time, [class*='date'], .published"
        );
        const content = document.querySelector(
          "[class*='content'], article, main"
        );
        const images = Array.from(
          document.querySelectorAll("img, [style*='background-image']")
        );

        let features: Array<{ title: string; description: string }> = [];
        let bugFixes: string[] = [];
        let balanceChanges: string[] = [];

        // Try to extract structured data
        const sections = document.querySelectorAll(
          "h2, h3, [class*='section']"
        );

        for (const section of Array.from(sections).slice(0, 20)) {
          const sectionTitle = section.textContent?.toLowerCase() || "";
          const nextElement = section.nextElementSibling;

          if (sectionTitle.includes("features") || sectionTitle.includes("new")) {
            // Collect features
            const items = nextElement?.querySelectorAll("li, p, div");
            if (items) {
              Array.from(items).forEach((item) => {
                const text = item.textContent?.trim();
                if (text && text.length > 10) {
                  features.push({
                    title: text.substring(0, 100),
                    description: text,
                  });
                }
              });
            }
          } else if (
            sectionTitle.includes("fix") ||
            sectionTitle.includes("bug")
          ) {
            // Collect bug fixes
            const items = nextElement?.querySelectorAll("li, p, div");
            if (items) {
              Array.from(items).forEach((item) => {
                const text = item.textContent?.trim();
                if (text && text.length > 10) {
                  bugFixes.push(text);
                }
              });
            }
          } else if (
            sectionTitle.includes("balance") ||
            sectionTitle.includes("change")
          ) {
            // Collect balance changes
            const items = nextElement?.querySelectorAll("li, p, div");
            if (items) {
              Array.from(items).forEach((item) => {
                const text = item.textContent?.trim();
                if (text && text.length > 10) {
                  balanceChanges.push(text);
                }
              });
            }
          }
        }

        return {
          title: title?.textContent?.trim() || "",
          date: date?.textContent?.trim() || "",
          summary: content?.textContent?.substring(0, 500) || "",
          features: features.slice(0, 5),
          bugFixes: bugFixes.slice(0, 10),
          balanceChanges: balanceChanges.slice(0, 10),
          images: images
            .map((img: any) => {
              return (
                img.src ||
                img.style?.backgroundImage?.match(/url\("([^"]+)"\)/)?.[1]
              );
            })
            .filter(Boolean)
            .slice(0, 3),
        };
      });

      console.log("✅ Extracted detailed changelog");

      // Try to parse wipe date from article
      const wipeDateMatch = latestArticle.content.match(
        /(?:wipe|reset)\s+(?:on\s+)?(\w+\s+\d+(?:st|nd|rd|th)?(?:,?\s*\d{4})?)/i
      );

      return {
        nextWipe: null,
        lastWipe: null,
        frequency: "Unknown - Check official",
        source: "escapefromtarkov.com",
        scrapedAt: new Date().toISOString(),
        confirmed: true,
        announcement: latestArticle.title,
        changelog: {
          title: detailedData.title,
          summary: detailedData.summary,
          features: detailedData.features,
          bugFixes: detailedData.bugFixes,
          balanceChanges: detailedData.balanceChanges,
          imageUrl: detailedData.images?.[0],
          sourceUrl: latestArticle.link,
        },
      };
    }

    return null;
  } catch (error) {
    console.error("❌ Error scraping Tarkov official:", error);
    return null;
  }
}
