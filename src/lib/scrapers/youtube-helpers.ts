import { scrapeYouTubeVideos } from "./youtube-scraper";

/**
 * Game-specific YouTube search queries for current season/wipe content
 */
const GAME_YOUTUBE_QUERIES: Record<string, string> = {
  rust: "Rust wipe update official",
  tarkov: "Escape from Tarkov wipe official",
  poe: "Path of Exile league announcement",
  poe2: "Path of Exile 2 GGG official trailer announcement 2025",
  fortnite: "Fortnite season trailer official",
  diablo4: "Diablo 4 Season trailer official",
  diablo3: "Diablo 3 Season trailer",
  diablo2: "Diablo 2 Resurrected Season",
  diabloimmortal: "Diablo Immortal update",
  lastepoch: "Last Epoch Cycle trailer",
  valorant: "Valorant Act trailer official",
  lol: "League of Legends season update",
  tft: "TFT Set trailer official",
  apex: "Apex Legends season trailer",
  cod: "Call of Duty season update",
  overwatch2: "Overwatch 2 season trailer",
  destiny2: "Destiny 2 season trailer",
  r6siege: "Rainbow Six Siege season reveal",
  warframe: "Warframe update official",
  deadlock: "Deadlock patch update",
  rocketleague: "Rocket League season trailer",
  dbd: "Dead by Daylight chapter trailer",
  pubg: "PUBG season update",
};

/**
 * Fetch YouTube videos for a specific game
 * @param gameId - The game identifier
 * @param limit - Maximum number of videos to fetch (default: 5)
 * @returns Array of video objects compatible with WipeData schema
 */
export async function fetchGameVideos(
  gameId: string,
  limit: number = 5
): Promise<any[]> {
  const query = GAME_YOUTUBE_QUERIES[gameId];

  if (!query) {
    console.warn(`⚠️ No YouTube query configured for game: ${gameId}`);
    return [];
  }

  try {
    console.log(`🎬 Fetching YouTube videos for ${gameId}...`);
    const youtubeVideos = await scrapeYouTubeVideos(query, limit);

    const videos = youtubeVideos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      platform: "youtube" as const,
      url: video.url,
      channelName: video.channel,
      publishedAt: video.publishedAt,
      thumbnailUrl: video.thumbnailUrl,
      type: "trailer" as const,
    }));

    console.log(`✅ Found ${videos.length} YouTube videos for ${gameId}`);
    return videos;
  } catch (error) {
    console.warn(`⚠️ Failed to scrape YouTube videos for ${gameId}:`, error);
    return [];
  }
}
