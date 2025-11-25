import { newPage } from "../browser";

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  description: string;
}

/**
 * Scrape YouTube for videos about a topic
 * Returns latest videos about the game/event
 */
export async function scrapeYouTubeVideos(
  searchQuery: string,
  limit: number = 10
): Promise<YouTubeVideo[]> {
  const page = await newPage();

  try {
    console.log(`🔍 Scraping YouTube for "${searchQuery}" videos...`);

    // Go to YouTube search
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}&sp=CAISBAgBEAE`;
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    // Wait for videos to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const videos = await page.evaluate((limit) => {
      const videoList: any[] = [];
      const videoElements = document.querySelectorAll("ytd-video-renderer");

      for (let i = 0; i < Math.min(limit, videoElements.length); i++) {
        const el = videoElements[i];

        // Extract video info
        const titleEl = el.querySelector("#video-title");
        const channelEl = el.querySelector("#channel-name a");
        const timeEl = el.querySelector("span.style-scope.yt-formatted-string");
        const thumbnailEl = el.querySelector("img#img");

        const linkEl = el.querySelector("a#video-title");
        const videoUrl = linkEl ? (linkEl as any).href : "";

        if (titleEl && channelEl && videoUrl) {
          videoList.push({
            title: titleEl.textContent?.trim() || "",
            channel: channelEl.textContent?.trim() || "",
            url: videoUrl,
            image: (thumbnailEl as any)?.src || "",
            time: timeEl?.textContent?.trim() || "",
          });
        }
      }

      return videoList;
    }, limit);

    const formattedVideos: YouTubeVideo[] = videos
      .filter((v) => v.title && v.channel && v.url)
      .map((video) => {
        // Extract video ID from URL
        const urlObj = new URL(video.url);
        const videoId = urlObj.searchParams.get("v") || "";

        return {
          id: videoId,
          title: video.title,
          channel: video.channel,
          url: video.url,
          thumbnailUrl: video.image,
          publishedAt: video.time,
          viewCount: 0, // Hard to scrape, would need additional request
          description: "",
        };
      });

    console.log(`✅ Found ${formattedVideos.length} YouTube videos`);
    return formattedVideos;
  } catch (error) {
    console.error("❌ Error scraping YouTube:", error);
    return [];
  }
}

/**
 * Scrape YouTube channel for latest videos
 */
export async function scrapeYouTubeChannel(
  channelName: string,
  limit: number = 10
): Promise<YouTubeVideo[]> {
  const page = await newPage();

  try {
    console.log(`🔍 Scraping YouTube channel: ${channelName}...`);

    // Try to go to channel
    const channelUrl = `https://www.youtube.com/@${encodeURIComponent(channelName)}/videos`;
    await page.goto(channelUrl, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });

    // Wait for videos to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Scroll to load more videos
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const videos = await page.evaluate((limit) => {
      const videoList: any[] = [];
      const videoElements = document.querySelectorAll("ytd-grid-video-renderer");

      for (let i = 0; i < Math.min(limit, videoElements.length); i++) {
        const el = videoElements[i];

        const titleEl = el.querySelector("#video-title");
        const timeEl = el.querySelector("#metadata-line span.style-scope");
        const linkEl = el.querySelector("a#video-title");
        const thumbnailEl = el.querySelector("img");

        const videoUrl = linkEl ? (linkEl as any).href : "";

        if (titleEl && videoUrl) {
          videoList.push({
            title: titleEl.textContent?.trim() || "",
            url: videoUrl,
            time: timeEl?.textContent?.trim() || "",
            image: (thumbnailEl as any)?.src || "",
          });
        }
      }

      return videoList;
    }, limit);

    const formattedVideos: YouTubeVideo[] = videos
      .filter((v) => v.title && v.url)
      .map((video) => {
        // Extract video ID from URL
        const urlObj = new URL(video.url);
        const videoId = urlObj.searchParams.get("v") || "";

        return {
          id: videoId,
          title: video.title,
          channel: channelName,
          url: video.url,
          thumbnailUrl: video.image,
          publishedAt: video.time,
          viewCount: 0,
          description: "",
        };
      });

    console.log(`✅ Found ${formattedVideos.length} videos from ${channelName}`);
    return formattedVideos;
  } catch (error) {
    console.error("❌ Error scraping YouTube channel:", error);
    return [];
  }
}

/**
 * Scrape official Tarkov announcement video (if exists)
 */
export async function scrapeTarkovOfficialVideos(): Promise<YouTubeVideo[]> {
  try {
    console.log("🔍 Scraping for official Tarkov videos...");

    // Try the official Tarkov channel
    const videos = await scrapeYouTubeChannel("EscapeFromTarkov", 5);

    if (videos.length > 0) {
      return videos.filter(
        (v) =>
          v.title.toLowerCase().includes("wipe") ||
          v.title.toLowerCase().includes("patch") ||
          v.title.toLowerCase().includes("update") ||
          v.title.toLowerCase().includes("new")
      );
    }

    return [];
  } catch (error) {
    console.error("❌ Error scraping Tarkov official videos:", error);
    return [];
  }
}
