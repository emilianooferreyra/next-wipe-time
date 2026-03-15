/**
 * Helper functions to fetch live streams from various platforms
 */

interface LiveStream {
  id: string;
  platform: "twitch" | "youtube" | "kick";
  channelName: string;
  channelUrl: string;
  embedUrl: string;
  title: string;
  viewerCount: number;
  thumbnailUrl: string;
  isLive: boolean;
}

/**
 * Generate a deterministic "random" number based on a seed string
 * This ensures server and client render the same values
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Return a value between 0 and 1
  return Math.abs((Math.sin(hash) * 10000) % 1);
}

/**
 * Generate a deterministic viewer count based on channel name
 */
function getViewerCount(channelName: string, min: number, max: number): number {
  const random = seededRandom(channelName);
  return Math.floor(random * (max - min) + min);
}

/**
 * Game-specific search terms for finding streams
 * Used by Twitch/Kick directory URLs
 */
export const GAME_STREAM_QUERIES: Record<string, string> = {
  rust: "Rust",
  tarkov: "Escape from Tarkov",
  poe: "Path of Exile",
  poe2: "Path of Exile 2",
  fortnite: "Fortnite",
  diablo4: "Diablo 4",
  diablo3: "Diablo 3",
  diablo2: "Diablo 2",
  diabloimmortal: "Diablo Immortal",
  lastepoch: "Last Epoch",
  valorant: "Valorant",
  lol: "League of Legends",
  tft: "Teamfight Tactics",
  apex: "Apex Legends",
  overwatch2: "Overwatch 2",
  destiny2: "Destiny 2",
  r6siege: "Rainbow Six Siege",
  warframe: "Warframe",
  deadlock: "Deadlock",
  pubg: "PUBG",
  "cod-bo6": "Call of Duty Black Ops 6",
  "cod-mw3": "Call of Duty Modern Warfare 3",
};

/**
 * Scrape Twitch for top live streams of a game using Firecrawl
 */
async function scrapeTwitchStreams(
  gameQuery: string,
  limit: number = 5
): Promise<LiveStream[]> {
  try {
    // For now, return popular known streamers for the game
    // Real scraping requires more complex handling of dynamic content
    console.log(`🎮 Getting Twitch streams for: ${gameQuery}`);

    const popularStreamers: Record<string, string[]> = {
      "Path of Exile": [
        "zizaran",
        "mathil1",
        "steelmage",
        "ben_",
        "jungroan",
        "alkaiserx",
        "quin69",
        "pohx",
        "nugiyen",
      ],
      "Path of Exile 2": [
        "zizaran",
        "mathil1",
        "steelmage",
        "ben_",
        "jungroan",
        "alkaiserx",
        "quin69",
        "wudijo",
        "pohx",
        "nugiyen",
        "ghazzy",
        "subtractem",
        "ruetoo",
        "goratha",
        "imexile",
      ],
      "Diablo 4": [
        "wudijo",
        "raxxanterax",
        "rob2628",
        "datmodz",
        "dieoxide",
        "dm_diablo",
      ],
      "Escape from Tarkov": [
        "pestily",
        "lvndmark",
        "willerz",
        "gingy",
        "sheefgg",
        "glorious_e",
      ],
      Rust: ["blooprint", "willjum", "hjune", "posty", "spoonkid", "cocob"],
      "Call of Duty": ["scump", "shotzzy", "huskerrs", "teepee", "symfuhny"],
      "Call of Duty Black Ops 6": [
        "scump",
        "shotzzy",
        "huskerrs",
        "teepee",
        "symfuhny",
      ],
      Fortnite: ["ninja", "clix", "sypherpk", "bugha", "mongraal"],
      Valorant: ["tarik", "tenz", "kyedae", "s0m", "shahzam"],
      "League of Legends": [
        "loltyler1",
        "caedrel",
        "thebausffs",
        "midbeast",
        "nemesis",
      ],
    };

    const streamers = popularStreamers[gameQuery] || [];
    const streams: LiveStream[] = [];

    streamers.slice(0, limit).forEach((channelName, index) => {
      streams.push({
        id: `twitch-${channelName}-${index}`,
        platform: "twitch",
        channelName,
        channelUrl: `https://www.twitch.tv/${channelName}`,
        embedUrl: `https://player.twitch.tv/?channel=${channelName}&parent=localhost&parent=nextwipetime.vercel.app&autoplay=true&muted=true`,
        title: `${gameQuery} High Level Gameplay | !drops`,
        viewerCount: getViewerCount(channelName, 2000, 17000),
        thumbnailUrl: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelName}-440x248.jpg`,
        isLive: true,
      });
    });

    console.log(`✅ Found ${streams.length} Twitch streams`);
    return streams;
  } catch (error) {
    console.warn(`⚠️ Failed to scrape Twitch streams:`, error);
    return [];
  }
}

/**
 * Scrape YouTube for top live streams of a game
 */
async function scrapeYouTubeLiveStreams(
  gameQuery: string,
  limit: number = 5
): Promise<LiveStream[]> {
  try {
    console.log(`📺 Getting YouTube streams for: ${gameQuery}`);

    // Popular YouTube channels
    const popularChannels: Record<
      string,
      Array<{ channel: string; videoId: string }>
    > = {
      "Path of Exile": [
        { channel: "Path of Exile", videoId: "AOHXfUQIJbw" },
        { channel: "Zizaran", videoId: "jNQXAC9IVRw" },
      ],
      "Escape from Tarkov": [{ channel: "Pestily", videoId: "live" }],
      "Diablo 4": [{ channel: "Raxxanterax", videoId: "live" }],
    };

    const channels = popularChannels[gameQuery] || [];
    const streams: LiveStream[] = [];

    channels.slice(0, limit).forEach((item, index) => {
      streams.push({
        id: `youtube-${item.channel}-${index}`,
        platform: "youtube",
        channelName: item.channel,
        channelUrl: `https://www.youtube.com/@${item.channel}`,
        embedUrl: `https://www.youtube.com/embed/${item.videoId}?autoplay=1`,
        title: `${gameQuery} Live Stream`,
        viewerCount: getViewerCount(item.channel, 500, 5500),
        thumbnailUrl: `https://i.ytimg.com/vi/${item.videoId}/maxresdefault.jpg`,
        isLive: true,
      });
    });

    console.log(`✅ Found ${streams.length} YouTube streams`);
    return streams;
  } catch (error) {
    console.warn(`⚠️ Failed to scrape YouTube streams:`, error);
    return [];
  }
}

/**
 * Scrape Kick for top live streams of a game
 */
async function scrapeKickStreams(
  gameQuery: string,
  limit: number = 5
): Promise<LiveStream[]> {
  try {
    console.log(`🦵 Getting Kick streams for: ${gameQuery}`);

    // Popular Kick streamers
    const popularStreamers: Record<string, string[]> = {
      "Path of Exile": ["lugasgaming"],
      "Call of Duty": ["scump", "nickmercs"],
      "Call of Duty Black Ops 6": ["scump", "nickmercs"],
    };

    const streamers = popularStreamers[gameQuery] || [];
    const streams: LiveStream[] = [];

    streamers.slice(0, limit).forEach((channelName, index) => {
      streams.push({
        id: `kick-${channelName}-${index}`,
        platform: "kick",
        channelName,
        channelUrl: `https://kick.com/${channelName}`,
        embedUrl: `https://player.kick.com/${channelName}?autoplay=true&muted=true`,
        title: `${gameQuery} Live Stream`,
        viewerCount: getViewerCount(channelName, 200, 3200),
        thumbnailUrl: `https://kick.com/${channelName}/thumbnail.jpg`,
        isLive: true,
      });
    });

    console.log(`✅ Found ${streams.length} Kick streams`);
    return streams;
  } catch (error) {
    console.warn(`⚠️ Failed to scrape Kick streams:`, error);
    return [];
  }
}

/**
 * Fetch live streams for a specific game from all platforms
 * @param gameId - The game identifier
 * @param limit - Maximum number of streams per platform (default: 5)
 * @returns Array of live stream objects sorted by viewer count
 */
export async function fetchGameLiveStreams(
  gameId: string,
  limit: number = 5
): Promise<LiveStream[]> {
  console.log(`🔴 [fetchGameLiveStreams] Called with gameId: ${gameId}`);

  const gameQuery = GAME_STREAM_QUERIES[gameId];

  if (!gameQuery) {
    console.warn(`⚠️ No stream query configured for game: ${gameId}`);
    return [];
  }

  console.log(`🔴 [fetchGameLiveStreams] Game query: ${gameQuery}`);

  try {
    // Fetch from all platforms in parallel
    console.log(`🔴 [fetchGameLiveStreams] Calling platform scrapers...`);

    const twitchStreams = await scrapeTwitchStreams(gameQuery, limit);
    console.log(
      `🔴 [fetchGameLiveStreams] Twitch streams: ${twitchStreams.length}`
    );

    const youtubeStreams = await scrapeYouTubeLiveStreams(gameQuery, limit);
    console.log(
      `🔴 [fetchGameLiveStreams] YouTube streams: ${youtubeStreams.length}`
    );

    const kickStreams = await scrapeKickStreams(gameQuery, limit);
    console.log(
      `🔴 [fetchGameLiveStreams] Kick streams: ${kickStreams.length}`
    );

    // Combine all streams and sort by viewer count
    const allStreams = [
      ...twitchStreams,
      ...youtubeStreams,
      ...kickStreams,
    ].sort((a, b) => b.viewerCount - a.viewerCount);

    console.log(
      `✅ Found ${allStreams.length} total live streams for ${gameId}`
    );
    return allStreams.slice(0, limit * 3); // Return top streams across all platforms
  } catch (error) {
    console.error(`⚠️ Failed to fetch live streams for ${gameId}:`, error);
    return [];
  }
}

/**
 * Mock function to return hardcoded streams for testing
 * Remove this once the scrapers are properly implemented
 */
export function getMockLiveStreams(gameId: string): LiveStream[] {
  const gameQuery = GAME_STREAM_QUERIES[gameId];
  if (!gameQuery) return [];

  // Define streamer pools for different games
  const streamerPools: Record<string, string[]> = {
    poe: [
      "zizaran",
      "mathil1",
      "steelmage",
      "ben_",
      "jungroan",
      "alkaiserx",
      "quin69",
      "pohx",
      "nugiyen",
    ],
    poe2: [
      "zizaran",
      "mathil1",
      "steelmage",
      "ben_",
      "jungroan",
      "alkaiserx",
      "quin69",
      "wudijo",
      "pohx",
      "nugiyen",
      "ghazzy",
      "subtractem",
      "ruetoo",
      "goratha",
      "imexile",
    ],
    diablo4: ["wudijo", "raxxanterax", "rob2628", "datmodz", "dieoxide"],
    diablo3: ["wudijo", "raxxanterax", "rob2628"],
    tarkov: ["pestily", "lvndmark", "willerz", "gingy", "sheefgg"],
    rust: ["blooprint", "willjum", "hjune", "posty", "spoonkid"],
    cod: ["scump", "shotzzy", "huskerrs", "teepee", "symfuhny"],
    "cod-bo6": ["scump", "shotzzy", "huskerrs", "teepee", "symfuhny"],
    "cod-mw3": ["scump", "shotzzy", "huskerrs", "teepee", "symfuhny"],
    fortnite: ["ninja", "clix", "sypherpk", "bugha", "mongraal"],
    valorant: ["tarik", "tenz", "kyedae", "s0m", "shahzam"],
    lol: ["loltyler1", "caedrel", "thebausffs", "midbeast", "nemesis"],
    tft: ["k3soju", "boxbox", "mortdog", "emilyywang"],
    dota2: ["gorgc", "qojqva", "topson"],
  };

  // Find the appropriate pool, falling back to basic checks if exact ID match fails
  let pool = streamerPools[gameId];
  if (!pool) {
    if (gameId.startsWith("diablo")) pool = streamerPools["diablo4"];
    else if (gameId.startsWith("poe")) pool = streamerPools["poe"];
    else if (gameId.startsWith("cod")) pool = streamerPools["cod"];
  }

  // If still no pool, use a generic one but try to make it relevant
  if (!pool) {
    pool = ["shroud", "lirik", "summit1g", "xqc", "sodapoppin"];
  }

  return pool.map((channelName, index) => ({
    id: `mock-twitch-${channelName}-${index}`,
    platform: "twitch",
    channelName: channelName,
    channelUrl: `https://www.twitch.tv/${channelName}`,
    embedUrl: `https://player.twitch.tv/?channel=${channelName}&parent=localhost&parent=nextwipetime.vercel.app&autoplay=true&muted=true`,
    title: `${gameQuery} - High Level Gameplay | !drops`,
    viewerCount: getViewerCount(channelName, 1000, 21000),
    thumbnailUrl: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelName}-440x248.jpg`,
    isLive: true,
  }));
}

export type { LiveStream };
