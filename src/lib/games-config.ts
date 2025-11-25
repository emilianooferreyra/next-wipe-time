/**
 * Games configuration with version support
 * Used for multi-version games like Diablo, Path of Exile, Call of Duty
 */

export type GameVersion = {
  id: string; // unique identifier (e.g., "diablo-iv", "diablo-iii")
  label: string; // display name (e.g., "Diablo IV")
  shortLabel?: string; // short version (e.g., "IV")
  image?: string; // optional separate image for version (falls back to parent game image)
};

export type GameConfig = {
  parentId: string; // "diablo", "poe", "cod"
  name: string; // display name
  accentColor: string;
  backgroundImage: string;
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
    backgroundImage: "/images/games/diablo4.jpg",
    hoverMedia: "/videos/games/diablo4.mp4",
    hoverMediaType: "video",
    versions: [
      {
        id: "diablo4",
        label: "",
        shortLabel: "Diablo IV",
        image: "/images/games/diablo4.jpg",
      },
      {
        id: "diablo3",
        label: "",
        shortLabel: "Diablo III",
        // Uses fallback to parent game image
      },
      {
        id: "diablo2",
        label: "",
        shortLabel: "Diablo II: Resurrected",
        // Uses fallback to parent game image
      },
    ],
    defaultVersionId: "diablo4",
  },

  poe: {
    parentId: "poe",
    name: "Path of Exile",
    accentColor: "rgb(175, 96, 37)",
    backgroundImage: "/images/games/poe.jpg",
    hoverMedia: "/videos/games/poe.webm",
    hoverMediaType: "video",
    versions: [
      {
        id: "poe",
        label: "",
        shortLabel: "Path of Exile",
        image: "/images/games/poe.jpg",
      },
      {
        id: "poe2",
        label: "",
        shortLabel: "Path of Exile 2",
        image: "/images/games/poe2.jpg",
      },
    ],
    defaultVersionId: "poe",
  },

  cod: {
    parentId: "cod",
    name: "Call of Duty",
    accentColor: "rgb(0, 255, 0)",
    backgroundImage: "/images/games/cod.jpg",
    hoverMedia: "/videos/games/cod.gif",
    hoverMediaType: "gif",
    versions: [
      {
        id: "cod",
        label: "",
        shortLabel: "Warzone",
        image: "/images/games/cod.jpg",
      },
      {
        id: "cod-mw3",
        label: "Modern Warfare III",
        shortLabel: "MW3",
        // Uses fallback to parent game image
      },
      {
        id: "cod-bo6",
        label: "Black Ops 6",
        shortLabel: "BO6",
        // Uses fallback to parent game image
      },
    ],
    defaultVersionId: "cod",
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
  gameId: string
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
