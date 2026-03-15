/**
 * Global streamers database
 * Maps streamer usernames to their platforms and games
 * Format: [username]: { platform, games: [gameIds], realName?, country? }
 */

export interface StreamerProfile {
  username: string;
  realName?: string;
  platform: "twitch" | "kick" | "youtube";
  platforms?: ("twitch" | "kick" | "youtube")[];
  games: string[];
  country?: string;
  followers?: number;
  profileImage?: string;
  verified?: boolean;
}

export const GLOBAL_STREAMERS: Record<string, StreamerProfile> = {
  // Tarkov
  pestily: {
    username: "pestily",
    realName: "Daniel Lakstins",
    platform: "twitch",
    games: ["tarkov"],
    country: "AU",
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
  willerz: {
    username: "willerz",
    platform: "twitch",
    games: ["tarkov"],
    country: "US",
    verified: true,
  },
  gingy: {
    username: "gingy",
    platform: "twitch",
    games: ["tarkov"],
    country: "US",
    verified: true,
  },
  sheefgg: {
    username: "sheefgg",
    platform: "twitch",
    games: ["tarkov"],
    verified: true,
  },

  // PoE / PoE2
  zizaran: {
    username: "zizaran",
    realName: "Kjetil Borge",
    platform: "twitch",
    games: ["poe", "poe2"],
    country: "NO",
    verified: true,
  },
  mathil1: {
    username: "mathil1",
    realName: "Mathil",
    platform: "twitch",
    games: ["poe", "poe2"],
    country: "AU",
    verified: true,
  },
  steelmage: {
    username: "steelmage",
    realName: "Ollie",
    platform: "twitch",
    games: ["poe", "poe2"],
    country: "NZ",
    verified: true,
  },
  ben_: {
    username: "ben_",
    platform: "twitch",
    games: ["poe", "poe2"],
    verified: true,
  },
  jungroan: {
    username: "jungroan",
    platform: "twitch",
    games: ["poe", "poe2"],
    verified: true,
  },
  alkaiserx: {
    username: "alkaiserx",
    platform: "twitch",
    games: ["poe", "poe2", "diablo4"],
    verified: true,
  },
  quin69: {
    username: "quin69",
    realName: "Quintin Crawford",
    platform: "twitch",
    games: ["poe", "poe2", "diablo4"],
    country: "NZ",
    verified: true,
  },
  pohx: {
    username: "pohx",
    platform: "twitch",
    games: ["poe", "poe2"],
    verified: true,
  },
  nugiyen: {
    username: "nugiyen",
    platform: "twitch",
    games: ["poe", "poe2"],
    country: "DE",
    verified: true,
  },
  ghazzy: {
    username: "ghazzy",
    platform: "twitch",
    games: ["poe", "poe2"],
    verified: true,
  },
  subtractem: {
    username: "subtractem",
    platform: "twitch",
    games: ["poe", "poe2"],
    verified: true,
  },
  ruetoo: {
    username: "ruetoo",
    platform: "twitch",
    games: ["poe", "poe2"],
    verified: true,
  },
  goratha: {
    username: "goratha",
    platform: "twitch",
    games: ["poe", "poe2"],
    verified: true,
  },
  imexile: {
    username: "imexile",
    platform: "twitch",
    games: ["poe", "poe2"],
    verified: true,
  },
  pathofmatth: {
    username: "pathofmatth",
    platform: "twitch",
    games: ["poe", "poe2"],
    verified: true,
  },
  empyriangaming: {
    username: "empyriangaming",
    platform: "twitch",
    games: ["poe", "poe2"],
    verified: true,
  },

  // Diablo
  wudijo: {
    username: "wudijo",
    platform: "twitch",
    games: ["diablo4", "poe2"],
    country: "DE",
    verified: true,
  },
  raxxanterax: {
    username: "raxxanterax",
    platform: "twitch",
    games: ["diablo4", "diablo3"],
    country: "US",
    verified: true,
  },
  rob2628: {
    username: "rob2628",
    platform: "twitch",
    games: ["diablo4"],
    verified: true,
  },
  datmodz: {
    username: "datmodz",
    platform: "twitch",
    games: ["diablo4"],
    verified: true,
  },

  // Rust
  blooprint: {
    username: "blooprint",
    platform: "twitch",
    games: ["rust"],
    verified: true,
  },
  willjum: {
    username: "willjum",
    platform: "twitch",
    games: ["rust"],
    verified: true,
  },
  hjune: {
    username: "hjune",
    platform: "twitch",
    games: ["rust"],
    verified: true,
  },
  posty: {
    username: "posty",
    platform: "twitch",
    games: ["rust"],
    verified: true,
  },
  spoonkid: {
    username: "spoonkid",
    platform: "twitch",
    games: ["rust"],
    verified: true,
  },

  // CoD
  scump: {
    username: "scump",
    platform: "twitch",
    games: ["cod", "cod-bo6"],
    verified: true,
  },
  shotzzy: {
    username: "shotzzy",
    platform: "twitch",
    games: ["cod", "cod-bo6"],
    verified: true,
  },
  huskerrs: {
    username: "huskerrs",
    platform: "twitch",
    games: ["cod", "warzone"],
    verified: true,
  },
  teepee: {
    username: "teepee",
    platform: "twitch",
    games: ["cod", "warzone"],
    verified: true,
  },
  symfuhny: {
    username: "symfuhny",
    platform: "twitch",
    games: ["cod", "warzone"],
    verified: true,
  },

  // Fortnite
  ninja: {
    username: "ninja",
    platform: "twitch",
    games: ["fortnite"],
    verified: true,
  },
  clix: {
    username: "clix",
    platform: "twitch",
    games: ["fortnite"],
    verified: true,
  },
  sypherpk: {
    username: "sypherpk",
    platform: "twitch",
    games: ["fortnite"],
    verified: true,
  },
  bugha: {
    username: "bugha",
    platform: "twitch",
    games: ["fortnite"],
    verified: true,
  },

  // Valorant
  tarik: {
    username: "tarik",
    platform: "twitch",
    games: ["valorant"],
    verified: true,
  },
  tenz: {
    username: "tenz",
    platform: "twitch",
    games: ["valorant"],
    verified: true,
  },
  kyedae: {
    username: "kyedae",
    platform: "twitch",
    games: ["valorant"],
    verified: true,
  },
  s0m: {
    username: "s0m",
    platform: "twitch",
    games: ["valorant"],
    verified: true,
  },
  shahzam: {
    username: "shahzam",
    platform: "twitch",
    games: ["valorant"],
    verified: true,
  },

  // LoL
  loltyler1: {
    username: "loltyler1",
    platform: "twitch",
    games: ["lol"],
    verified: true,
  },
  caedrel: {
    username: "caedrel",
    platform: "twitch",
    games: ["lol"],
    verified: true,
  },
  thebausffs: {
    username: "thebausffs",
    platform: "twitch",
    games: ["lol"],
    verified: true,
  },

  // Generic
  shroud: {
    username: "shroud",
    platform: "twitch",
    games: ["valorant", "deadlock", "tarkov"],
    verified: true,
  },
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
