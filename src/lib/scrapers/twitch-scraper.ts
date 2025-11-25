import { newPage } from "../browser";
import { getStreamersForGame } from "../streamers";

export interface LiveStreamData {
  platform: "twitch";
  streamerUsername: string;
  streamerDisplayName: string;
  title: string;
  game: string;
  viewerCount: number;
  url: string;
  thumbnailUrl: string;
  startedAt?: string;
}

/**
 * Scrape Twitch category page for live streams in a specific game
 * This is more reliable than checking individual streamers
 */
export async function scrapeTwitchByGameDirect(
  gameCategory: string
): Promise<LiveStreamData[]> {
  const page = await newPage();

  try {
    console.log(`🔍 Scraping Twitch for ${gameCategory} live streams...`);

    // Go to the game category page
    const categoryUrl = `https://www.twitch.tv/directory/game/${encodeURIComponent(gameCategory)}`;
    console.log(`   URL: ${categoryUrl}`);

    try {
      await page.goto(categoryUrl, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
    } catch (err) {
      console.log("⚠️  Category page timeout, trying with longer wait...");
      await page.goto(categoryUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
    }

    // Wait for streams to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Scroll down to load more streams
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const streams = await page.evaluate(() => {
      const streamList: any[] = [];
      const debugInfo: any[] = [];

      // Try different selectors
      let articles: Element[] = [];

      // Method 1: article tags
      articles = Array.from(document.querySelectorAll('article'));
      debugInfo.push(`Found ${articles.length} articles`);

      // Method 2: If no articles, try other selectors
      if (articles.length === 0) {
        const divs = document.querySelectorAll('[data-a-target*="preview"], [class*="ScPreviewCardContainer"]');
        articles = Array.from(divs);
        debugInfo.push(`Found ${articles.length} preview cards via divs`);
      }

      // Method 3: Try links
      if (articles.length === 0) {
        const links = document.querySelectorAll('a[href*="twitch.tv"][href*="/"]');
        articles = Array.from(links).map((link) => link.parentElement!).filter(Boolean);
        debugInfo.push(`Found ${articles.length} via parent links`);
      }

      debugInfo.push(`Total elements to check: ${articles.length}`);

      for (let i = 0; i < articles.length; i++) {
        try {
          const article = articles[i];

          // Get all links in this element
          const links = article.querySelectorAll('a');
          let streamUrl = "";

          for (const link of links) {
            const href = (link as any).href;
            if (href && href.includes("twitch.tv/") && !href.includes("directory") && !href.includes("search")) {
              streamUrl = href;
              break;
            }
          }

          if (!streamUrl) continue;

          // Extract username
          const urlMatch = streamUrl.match(/twitch\.tv\/([^/?#]+)/);
          const username = urlMatch ? urlMatch[1] : null;

          if (!username) continue;

          // Get text content
          const textContent = article.textContent || "";
          const lines = textContent.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

          // Get title - first substantial line
          let title = "";
          for (const line of lines) {
            if (line.length > 10 && line.length < 200) {
              title = line;
              break;
            }
          }

          if (!title && lines.length > 0) title = lines[0];
          if (!title) title = "Stream";

          // Get viewer count
          let viewers = "0";
          const viewerMatch = textContent.match(/([\d.]+\s*[KM]?)\s*(?:viewers?|watching)/i);
          if (viewerMatch) {
            viewers = viewerMatch[1].trim();
          }

          // Get thumbnail
          const imgEl = article.querySelector("img");
          const thumbnail = (imgEl as any)?.src || "";

          if (title && username) {
            streamList.push({
              username,
              displayName: username,
              title,
              viewers,
              thumbnail,
              url: streamUrl,
            });
          }
        } catch (e) {
          // Skip
        }
      }

      debugInfo.push(`Extracted ${streamList.length} streams`);
      console.log("DEBUG:", JSON.stringify(debugInfo));
      console.log("STREAMS:", JSON.stringify(streamList.slice(0, 3))); // Log first 3 streams

      return { streams: streamList, debug: debugInfo };
    });

    // Extract streams and debug info
    const streamData = streams as any;
    const streamList = streamData.streams || streams;
    const debugInfo = streamData.debug || [];

    console.log("Twitch Debug Info:", debugInfo);

    // Process and format streams
    const liveStreams: LiveStreamData[] = streamList
      .filter((s: any) => s.username && s.title)
      .map((stream: any) => {
        // Parse viewer count (e.g., "1.2K" → 1200)
        let viewerCount = 0;
        const viewerText = stream.viewers.toLowerCase();

        if (viewerText.includes("k")) {
          viewerCount = parseFloat(viewerText) * 1000;
        } else if (viewerText.includes("m")) {
          viewerCount = parseFloat(viewerText) * 1000000;
        } else {
          const match = viewerText.match(/[\d,]+/);
          if (match) {
            viewerCount = parseInt(match[0].replace(/,/g, ""));
          }
        }

        return {
          platform: "twitch",
          streamerUsername: stream.username.toLowerCase(),
          streamerDisplayName: stream.displayName,
          title: stream.title,
          game: gameCategory,
          viewerCount,
          url: stream.url,
          thumbnailUrl: stream.thumbnail,
        };
      })
      .sort((a: LiveStreamData, b: LiveStreamData) => b.viewerCount - a.viewerCount); // Sort by viewers

    console.log(`✅ Found ${liveStreams.length} live streams on Twitch for ${gameCategory}`);
    return liveStreams;
  } catch (error) {
    console.error("❌ Error scraping Twitch:", error);
    return [];
  }
}

/**
 * Scrape Twitch for live streams from a list of streamers
 * Falls back to direct game scraping if individual checks fail
 */
export async function scrapeTwitchLiveStreams(
  streamerUsernames: string[]
): Promise<LiveStreamData[]> {
  // For now, just use the direct game category scraping
  // which is more reliable than checking individual streamers
  return scrapeTwitchByGameDirect("Escape from Tarkov");
}

/**
 * Scrape Twitch for live streams by game
 */
export async function scrapeTwitchByGame(
  gameName: string,
  limit: number = 20
): Promise<LiveStreamData[]> {
  const page = await newPage();

  try {
    console.log(`🔍 Scraping Twitch for ${gameName} streams...`);

    const url = `https://www.twitch.tv/directory/game/${encodeURIComponent(gameName)}`;
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const streams = await page.evaluate((limit) => {
      const streamList: any[] = [];
      const streamElements = document.querySelectorAll(
        "[class*='stream'], [data-test-selector*='stream']"
      );

      for (let i = 0; i < Math.min(limit, streamElements.length); i++) {
        const el = streamElements[i];

        const titleEl = el.querySelector("[class*='title'], h3, a");
        const streamerEl = el.querySelector("[class*='username'], [class*='channel']");
        const viewerEl = el.querySelector("[class*='viewer']");
        const gameEl = el.querySelector("[class*='game']");

        if (titleEl && streamerEl) {
          streamList.push({
            title: titleEl.textContent?.trim() || "",
            streamer: streamerEl.textContent?.trim() || "",
            viewers: viewerEl?.textContent?.trim() || "0",
            game: gameEl?.textContent?.trim() || "",
            link: (el.querySelector("a") as any)?.href || "",
          });
        }
      }

      return streamList;
    }, limit);

    const liveStreams: LiveStreamData[] = streams
      .filter((s) => s.streamer && s.title)
      .map((stream) => {
        const viewerMatch = stream.viewers.match(/[\d.,]+/);
        const viewerCount = viewerMatch
          ? parseInt(viewerMatch[0].replace(/[.,]/g, ""))
          : 0;

        const username = stream.link.split("/").filter(Boolean).pop() || stream.streamer;

        return {
          platform: "twitch",
          streamerUsername: username,
          streamerDisplayName: stream.streamer,
          title: stream.title,
          game: stream.game || gameName,
          viewerCount,
          url: stream.link || `https://twitch.tv/${username}`,
          thumbnailUrl: "",
        };
      });

    console.log(`✅ Found ${liveStreams.length} live streams for ${gameName}`);
    return liveStreams;
  } catch (error) {
    console.error("❌ Error scraping Twitch by game:", error);
    return [];
  }
}
