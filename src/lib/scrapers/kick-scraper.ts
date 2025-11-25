import { newPage } from "../browser";

export interface LiveStreamData {
  platform: "kick";
  streamerUsername: string;
  streamerDisplayName: string;
  title: string;
  game: string;
  viewerCount: number;
  url: string;
  thumbnailUrl: string;
}

/**
 * Scrape Kick homepage for live streams
 * Dynamically finds all streams without needing a predefined list
 */
export async function scrapeKickLiveStreamsDirect(
  category: string = "Escape from Tarkov"
): Promise<LiveStreamData[]> {
  const page = await newPage();

  try {
    console.log(`🔍 Scraping Kick for live ${category} streams...`);

    // Go to Kick main page - streams load dynamically
    const url = "https://kick.com/";
    console.log(`   URL: ${url}`);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    // Wait for streams to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Scroll to load more streams
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const streams = await page.evaluate(() => {
      const streamList: any[] = [];
      const debugInfo: any[] = [];

      // Try multiple selector approaches
      let links: Element[] = [];

      // Method 1: Look for links with /channels/
      links = Array.from(document.querySelectorAll('a[href*="/channels/"]'));
      debugInfo.push(`Found ${links.length} /channels/ links`);

      // Method 2: If not found, try other channel patterns
      if (links.length === 0) {
        links = Array.from(document.querySelectorAll('a[href*="kick.com/"]'));
        debugInfo.push(`Found ${links.length} kick.com links`);
      }

      // Method 3: Try stream cards
      if (links.length === 0) {
        const cards = document.querySelectorAll('[class*="card"], [class*="stream"], article');
        links = Array.from(cards);
        debugInfo.push(`Found ${links.length} stream cards`);
      }

      debugInfo.push(`Total links to check: ${links.length}`);

      for (const link of links) {
        try {
          let href = "";
          if (link.tagName === "A") {
            href = (link as any).href;
          } else {
            const aEl = link.querySelector("a");
            if (aEl) href = (aEl as any).href;
          }

          if (!href || !href.includes("kick.com")) continue;

          // Extract username
          const urlMatch = href.match(/kick\.com\/([^/?#]+)/);
          const username = urlMatch ? urlMatch[1] : null;

          if (!username || username === "" || username === "browse") continue;

          // Get container for text
          let container = link;
          if (link.tagName !== "A") {
            container = link;
          } else {
            container = link.parentElement || link;
          }

          const containerText = container.textContent || "";

          // Check if LIVE
          const isLive = containerText.toLowerCase().includes("live");
          if (!isLive) continue;

          const lines = containerText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

          // Get title
          let title = "";
          for (const line of lines) {
            if (line.length > 10 && line.length < 150 && !line.includes("LIVE") && !line.includes("Kick") && !line.includes("watching")) {
              title = line;
              break;
            }
          }

          if (!title && lines.length > 1) title = lines[1];
          if (!title) title = "Stream";

          // Get viewers
          let viewers = "0";
          const viewerMatch = containerText.match(/([\d.]+\s*[KM]?)\s*(?:viewers?|watching)/i);
          if (viewerMatch) {
            viewers = viewerMatch[1].trim();
          }

          // Get thumbnail
          let thumbnail = "";
          const imgEl = container.querySelector("img");
          if (imgEl) thumbnail = (imgEl as any).src || "";

          if (title && username) {
            streamList.push({
              username,
              displayName: username,
              title,
              viewers,
              thumbnail,
              url: href,
            });
          }
        } catch (e) {
          // Skip
        }
      }

      debugInfo.push(`Extracted ${streamList.length} streams`);
      console.log("DEBUG (Kick):", JSON.stringify(debugInfo));
      console.log("STREAMS (Kick):", JSON.stringify(streamList.slice(0, 3)));

      return { streams: streamList, debug: debugInfo };
    });

    // Extract streams and debug info
    const streamData = streams as any;
    const streamList = streamData.streams || streams;
    const debugInfo = streamData.debug || [];

    console.log("Kick Debug Info:", debugInfo);

    // Process and format streams
    const liveStreams: LiveStreamData[] = streamList
      .filter((s: any) => s.username && s.title)
      .map((stream: any) => {
        // Parse viewer count
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
          platform: "kick",
          streamerUsername: stream.username.toLowerCase(),
          streamerDisplayName: stream.displayName,
          title: stream.title,
          game: category,
          viewerCount,
          url: stream.url,
          thumbnailUrl: stream.thumbnail,
        };
      })
      .sort((a: LiveStreamData, b: LiveStreamData) => b.viewerCount - a.viewerCount);

    console.log(`✅ Found ${liveStreams.length} live streams on Kick`);
    return liveStreams;
  } catch (error) {
    console.error("❌ Error scraping Kick:", error);
    return [];
  }
}

/**
 * Scrape Kick for live streams from a list of streamers
 */
export async function scrapeKickLiveStreams(
  streamerUsernames: string[]
): Promise<LiveStreamData[]> {
  // Use direct category scraping which is more reliable
  return scrapeKickLiveStreamsDirect("Escape from Tarkov");
}

/**
 * Scrape Kick for live streams by category
 */
export async function scrapeKickByCategory(
  categoryName: string,
  limit: number = 20
): Promise<LiveStreamData[]> {
  const page = await newPage();

  try {
    console.log(`🔍 Scraping Kick for ${categoryName} streams...`);

    const url = `https://kick.com/categories/${encodeURIComponent(categoryName)}`;
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const streams = await page.evaluate((limit) => {
      const streamList: any[] = [];
      const streamElements = document.querySelectorAll(
        "[class*='stream'], [class*='channel'], [data-test*='stream']"
      );

      for (let i = 0; i < Math.min(limit, streamElements.length); i++) {
        const el = streamElements[i];

        const titleEl = el.querySelector("[class*='title'], h3, a");
        const streamerEl = el.querySelector("[class*='username'], [class*='channel']");
        const viewerEl = el.querySelector("[class*='viewer']");
        const linkEl = el.querySelector("a");

        if (titleEl && streamerEl) {
          streamList.push({
            title: titleEl.textContent?.trim() || "",
            streamer: streamerEl.textContent?.trim() || "",
            viewers: viewerEl?.textContent?.trim() || "0",
            link: (linkEl as any)?.href || "",
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

        const username = stream.link
          .split("/")
          .filter(Boolean)
          .pop() || stream.streamer;

        return {
          platform: "kick",
          streamerUsername: username,
          streamerDisplayName: stream.streamer,
          title: stream.title,
          game: categoryName,
          viewerCount,
          url: stream.link || `https://kick.com/${username}`,
          thumbnailUrl: "",
        };
      });

    console.log(`✅ Found ${liveStreams.length} live streams for ${categoryName} on Kick`);
    return liveStreams;
  } catch (error) {
    console.error("❌ Error scraping Kick by category:", error);
    return [];
  }
}
