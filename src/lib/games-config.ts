/**
 * Games configuration with version support
 * Used for multi-version games like Diablo, Path of Exile, Call of Duty
 */

export type GameVersion = {
  id: string; // unique identifier (e.g., "diablo-iv", "diablo-iii")
  label: string; // display name (e.g., "Diablo IV")
  shortLabel?: string; // short version (e.g., "IV")
  image?: string; // optional separate image for version (falls back to parent game image)
  hoverMedia?: string; // optional separate hover media for version
  hoverMediaType?: "video" | "gif"; // type of hover media
};

export type GameConfig = {
  parentId: string; // "diablo", "poe", "cod"
  name: string; // display name
  accentColor: string;
  backgroundImage: string;
  coverImage?: string; // static cover image for games without versions (card display)
  hoverMedia?: string;
  hoverMediaType?: "video" | "gif";
  versions: GameVersion[];
  defaultVersionId: string; // which version to show by default
};

export const GAMES_WITH_VERSIONS: Record<string, GameConfig> = {
  diablo: {
    parentId: "diablo",
    name: "Diablo",
    accentColor: "rgb(139, 0, 0)",
    backgroundImage:
      "https://bnetcmsus-a.akamaihd.net/cms/blog_header/x4/X499874868Z61727473723366.jpg",
    hoverMedia: "/videos/games/diablo4.mp4",
    hoverMediaType: "video",
    versions: [
      {
        id: "diablo4",
        label: "Diablo IV",
        shortLabel: "IV",
        image:
          "https://bnetcmsus-a.akamaihd.net/cms/blog_header/x4/X499874868Z61727473723366.jpg",
        hoverMedia:
          "https://blz-contentstack-assets.akamaized.net/v3/assets/blta8f9a8e092360c6c/blt2097ffa7eac71a03/66c7887754ac148308dfa7a5/card_diablo_iv_hover.webm",
        hoverMediaType: "video",
      },
      {
        id: "diablo3",
        label: "Diablo III",
        shortLabel: "III",
        image:
          "https://blz-contentstack-images.akamaized.net/v3/assets/blta8f9a8e092360c6c/blt1315e30958e75426/61a50f460df21d7804454d88/diablo3.jpg?format=webply&quality=80&auto=webp",
        hoverMedia:
          "https://blz-contentstack-assets.akamaized.net/v3/assets/blta8f9a8e092360c6c/blt96fa5091bd3b0835/66c78900fd942465b0e5308c/card_diablo_iii_hover.webm",
        hoverMediaType: "video",
      },
      {
        id: "diablo2",
        label: "Diablo II: Resurrected",
        shortLabel: "II",
        image:
          "https://blz-contentstack-images.akamaized.net/v3/assets/blta8f9a8e092360c6c/blt0076b0be3961b1c7/620c26b504503350d255b8dc/diablo2.jpg?format=webply&quality=80&auto=webp",
        hoverMedia:
          "https://blz-contentstack-assets.akamaized.net/v3/assets/blta8f9a8e092360c6c/blta6961fb10293cc01/66c788e0af5f733b7f928ad8/card_diablo_ii_resurrected_hover.webm",
        hoverMediaType: "video",
      },
      {
        id: "diabloimmortal",
        label: "Diablo Immortal",
        shortLabel: "Immortal",
        image:
          "https://blz-contentstack-images.akamaized.net/v3/assets/blta8f9a8e092360c6c/blt14732d868dcaaebd/6287cff46eb6de7d054a58c8/diablo-immortal.jpg?format=webply&quality=80&auto=webp",
        hoverMedia:
          "https://blz-contentstack-assets.akamaized.net/v3/assets/blta8f9a8e092360c6c/blt13c57a92702efa85/68cdaf37a4aa228ad7f9eab8/DIM_QuartFeat_13_DsktpApp_600x800.webm",
        hoverMediaType: "video",
      },
    ],
    defaultVersionId: "diablo4",
  },

  poe: {
    parentId: "poe",
    name: "Path of Exile",
    accentColor: "rgb(175, 96, 37)",
    backgroundImage:
      "https://web.poecdn.com/public/news/2024-07-18/SettlersOfKalguurHeader.jpg",
    hoverMedia: "/videos/games/poe.webm",
    hoverMediaType: "video",
    versions: [
      {
        id: "poe",
        label: "Path of Exile",
        shortLabel: "PoE 1",
        image:
          "https://web.poecdn.com/public/news/2024-07-18/SettlersOfKalguurHeader.jpg",
      },
      {
        id: "poe2",
        label: "Path of Exile 2",
        shortLabel: "PoE 2",
        image:
          "https://web.poecdn.com/image/poe2/promo/FateoftheVaal/PoE2_FotV_BG_1920x1080.jpg",
        hoverMedia:
          "https://web.poecdn.com/video/poe2/FateoftheVaal/FotV_Transition.webm",
        hoverMediaType: "video",
      },
    ],
    defaultVersionId: "poe2",
  },

  tarkov: {
    parentId: "tarkov",
    name: "Escape from Tarkov",
    accentColor: "rgb(158, 136, 85)",
    backgroundImage: "https://assets.tarkov.com/news/15/banner_15_0.jpg",
    hoverMedia: "/videos/games/tarkov.mp4",
    hoverMediaType: "video",
    versions: [
      {
        id: "tarkov",
        label: "Escape from Tarkov",
        shortLabel: "Tarkov",
        image: "https://assets.tarkov.com/news/15/banner_15_0.jpg",
      },
      {
        id: "tarkov-arena",
        label: "Arena",
        shortLabel: "Arena",
        image: "https://assets.tarkov.com/news/arena/arena_banner.jpg",
      },
    ],
    defaultVersionId: "tarkov",
  },

  rust: {
    parentId: "rust",
    name: "Rust",
    accentColor: "rgb(206, 66, 43)",
    backgroundImage: "https://files.facepunch.com/rust/blog/header_2024_10.jpg",
    coverImage:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg?t=1708706822",
    hoverMedia: "/videos/games/rust.mp4",
    hoverMediaType: "video",
    versions: [],
    defaultVersionId: "rust",
  },

  fortnite: {
    parentId: "fortnite",
    name: "Fortnite",
    accentColor: "rgb(29, 78, 216)",
    backgroundImage:
      "https://cdn2.unrealengine.com/fortnite-chapter-5-season-4-header-1920x1080-6927d7802163.jpg",
    coverImage:
      "https://cdn2.unrealengine.com/fortnite-battle-royale-1920x1080-0c1e6f8c9a9e.jpg",
    hoverMedia: "/videos/games/fortnite.mp4",
    hoverMediaType: "video",
    versions: [],
    defaultVersionId: "fortnite",
  },

  pubg: {
    parentId: "pubg",
    name: "PUBG",
    accentColor: "rgb(255, 165, 0)",
    backgroundImage: "https://cdn.akamai.steamstatic.com/steam/apps/578080/header.jpg?t=1708706822",
    coverImage: "https://cdn.akamai.steamstatic.com/steam/apps/578080/header.jpg?t=1708706822",
    hoverMedia: "/videos/games/pubg.mp4",
    hoverMediaType: "video",
    versions: [],
    defaultVersionId: "pubg",
  },

};
/**
 * Get game config by parent ID
 */
export function getGameConfig(parentId: string): GameConfig | null {
  return GAMES_WITH_VERSIONS[parentId] || null;
}

/**
 * Get version by ID (e.g., "diablo-iv")
 */
export function getGameVersion(
  gameId: string,
): { config: GameConfig; version: GameVersion } | null {
  // Find which parent game this belongs to
  for (const [, config] of Object.entries(GAMES_WITH_VERSIONS)) {
    const version = config.versions.find((v) => v.id === gameId);
    if (version) {
      return { config, version };
    }
  }
  return null;
}

/**
 * Check if a game has multiple versions
 */
export function hasMultipleVersions(gameId: string): boolean {
  const gameInfo = getGameVersion(gameId);
  return gameInfo ? gameInfo.config.versions.length > 1 : false;
}

/**
 * Get all versions for a game
 */
export function getVersionsForGame(gameId: string): GameVersion[] {
  const gameInfo = getGameVersion(gameId);
  return gameInfo ? gameInfo.config.versions : [];
}

/**
 * Map a version ID to its parent game ID
 * E.g., "diablo3" -> "diablo4", "poe2" stays "poe2"
 */
export function getParentGameId(versionId: string): string | null {
  // Check all game configs
  for (const [, config] of Object.entries(GAMES_WITH_VERSIONS)) {
    const version = config.versions.find((v) => v.id === versionId);
    if (version) {
      // If this is the default version, return the versionId itself
      // Otherwise, return a "parent" identifier
      // Actually, we need to map back to a base game ID from game-tabs
      // For now, return the first version ID which should be the "main" one
      return config.versions[0].id;
    }
  }
  return null;
}

/**
 * Check if a game ID is a version ID (not in the base games list)
 */
export function isVersionId(gameId: string): boolean {
  for (const config of Object.values(GAMES_WITH_VERSIONS)) {
    if (config.versions.some((v) => v.id === gameId)) {
      return true;
    }
  }
  return false;
}

/**
 * Get the base game ID that should be displayed for a version
 * E.g., for "diablo3", return "diablo4" from the base games list
 */
export function getBaseGameIdForVersion(versionId: string): string {
  // Map version IDs to their base game equivalent
  // The first version in each config is considered the "base" for routing
  for (const config of Object.values(GAMES_WITH_VERSIONS)) {
    const version = config.versions.find((v) => v.id === versionId);
    if (version) {
      // Return the default version (which should exist in the base games list)
      return config.defaultVersionId;
    }
  }
  return versionId;
}

/**
 * Get cover image for a game (works for both single games and versions)
 * Returns coverImage for games without versions, or version.image for games with versions
 */
export function getGameCoverImage(gameId: string): string | null {
  const config = GAMES_WITH_VERSIONS[gameId];

  // If it's a parent game with no versions, return its coverImage
  if (config && config.versions.length === 0) {
    return config.coverImage || config.backgroundImage || null;
  }

  // If it's a parent game with versions, return the default version's image
  if (config && config.versions.length > 0) {
    const defaultVersion = config.versions.find(
      (v) => v.id === config.defaultVersionId,
    );
    return defaultVersion?.image || config.backgroundImage || null;
  }

  // If it's a version ID, find it in the configs
  for (const [, gameConfig] of Object.entries(GAMES_WITH_VERSIONS)) {
    const version = gameConfig.versions.find((v) => v.id === gameId);
    if (version) {
      return version.image || gameConfig.backgroundImage || null;
    }
  }

  return null;
}
