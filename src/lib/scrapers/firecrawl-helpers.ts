/**
 * Firecrawl Helper Functions
 *
 * Utilities for using Firecrawl to scrape game data more reliably
 */

export interface FirecrawlConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ScrapedGameData {
  eventName?: string;
  eventType?: "season" | "league" | "wipe" | "patch" | "event" | "update";
  startDate?: string;
  endDate?: string;
  announcementUrl?: string;
  patchNotesUrl?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  description?: string;
  features?: Array<{
    title: string;
    description: string;
    imageUrl?: string;
  }>;
}

/**
 * Generic Firecrawl scraper for game news pages
 */
export async function scrapeGameNews(url: string, schema?: any): Promise<any> {
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error scraping with Firecrawl:", error);
    throw error;
  }
}

/**
 * Extract structured data from a URL using Firecrawl
 */
export async function extractStructuredData(
  url: string,
  prompt: string,
  schema: any,
): Promise<any> {
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        urls: [url],
        prompt,
        schema,
      }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl Extract API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error extracting data with Firecrawl:", error);
    throw error;
  }
}

/**
 * Search the web for game-related information
 */
export async function searchGameInfo(
  query: string,
  limit: number = 5,
): Promise<any> {
  try {
    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`Firecrawl Search API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching with Firecrawl:", error);
    throw error;
  }
}

/**
 * Parse dates from various formats commonly found in game announcements
 */
export function parseGameDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  try {
    // Try ISO format first
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }

    // Try common formats like "December 1, 2024" or "Dec 1, 2024"
    const commonDate = new Date(dateStr);
    if (!isNaN(commonDate.getTime())) {
      return commonDate;
    }

    return null;
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return null;
  }
}

/**
 * Extract image URLs from markdown content
 */
export function extractImagesFromMarkdown(markdown: string): string[] {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const images: string[] = [];
  let match: RegExpExecArray | null;

  do {
    match = imageRegex.exec(markdown);
    if (match && match[1]) {
      images.push(match[1]);
    }
  } while (match !== null);

  return images;
}

/**
 * Extract video URLs from markdown content (YouTube, Twitch, etc.)
 */
export function extractVideosFromMarkdown(markdown: string): string[] {
  const videoRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|twitch\.tv\/videos\/)([^\s&]+)/g;
  const videos: string[] = [];
  let match: RegExpExecArray | null;

  do {
    match = videoRegex.exec(markdown);
    if (match) {
      videos.push(match[0]);
    }
  } while (match !== null);

  return videos;
}

/**
 * Fetches the latest announcement URL from the Path of Exile news page.
 */
export async function getLatestPoENewsAnnouncementUrl(): Promise<
  string | null
> {
  try {
    const response = await fetch("https://www.pathofexile.com/news");
    if (!response.ok) {
      throw new Error(`Failed to fetch PoE news: ${response.statusText}`);
    }
    const html = await response.text();

    const match = html.match(
      /<div id="topSplash"[^>]*>[\s\S]*?<a href="([^"]+)"/,
    );

    if (match && match[1]) {
      return match[1].replace(/&#x3A;/g, ":").replace(/&#x2F;/g, "/");
    }

    return null;
  } catch (error) {
    console.error("Error fetching latest PoE announcement URL:", error);
    return null;
  }
}
