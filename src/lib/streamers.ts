/**
 * Global streamers database
 * Maps streamer usernames to their platforms and games
 * Format: [username]: { platform, games: [gameIds], realName?, country? }
 */

export interface StreamerProfile {
  username: string;
  realName?: string;
  platform: "twitch" | "kick" | "youtube";
  platforms?: ("twitch" | "kick" | "youtube")[]; // If streamer is on multiple platforms
  games: string[]; // Game IDs they stream
  country?: string;
  followers?: number;
  profileImage?: string;
  verified?: boolean;
}

// Global streamers configuration
// This can be extended to fetch from a database or API later
export const GLOBAL_STREAMERS: Record<string, StreamerProfile> = {
  // Tarkov streamers
  pestily: {
    username: "pestily",
    realName: "Daniel Lakstins",
    platform: "twitch",
    games: ["tarkov"],
    country: "LV",
    verified: true,
  },
  klean: {
    username: "klean",
    realName: "Klean",
    platform: "twitch",
    games: ["tarkov"],
    verified: true,
  },
  lvndmark: {
    username: "lvndmark",
    realName: "Mark",
    platform: "twitch",
    games: ["tarkov"],
    country: "US",
    verified: true,
  },
  jager_plays: {
    username: "jager_plays",
    platform: "twitch",
    games: ["tarkov"],
    verified: true,
  },
  sheesh_tv: {
    username: "sheesh_tv",
    platform: "twitch",
    games: ["tarkov"],
    verified: true,
  },
  aqua: {
    username: "aqua",
    platform: "twitch",
    games: ["tarkov"],
    country: "RU",
  },
  worrun: {
    username: "worrun",
    platform: "twitch",
    games: ["tarkov"],
    verified: true,
  },
  // Add more streamers as needed
};

/**
 * Get streamers for a specific game
 */
export function getStreamersForGame(gameId: string): StreamerProfile[] {
  return Object.values(GLOBAL_STREAMERS).filter((streamer) =>
    streamer.games.includes(gameId)
  );
}

/**
 * Get all streamers across all games
 */
export function getAllStreamers(): StreamerProfile[] {
  return Object.values(GLOBAL_STREAMERS);
}
