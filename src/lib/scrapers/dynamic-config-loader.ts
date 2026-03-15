/**
 * Dynamic Config Loader - Lazy load scraper configs on demand
 *
 * Reduces initial bundle size by ~200KB by avoiding barrel imports
 * Configs are loaded only when needed via dynamic import()
 */

import type { GameScraperConfig } from "./types";

// Config cache to avoid re-importing
const configCache = new Map<string, GameScraperConfig>();

/**
 * Dynamically import a game config by ID
 * Uses Next.js code splitting for optimal bundle size
 */
export async function loadGameConfig(
  gameId: string
): Promise<GameScraperConfig> {
  // Check cache first
  if (configCache.has(gameId)) {
    return configCache.get(gameId)!;
  }

  console.log(`📦 [Dynamic Import] Loading config for ${gameId}...`);

  let config: GameScraperConfig;

  // Dynamic import based on game ID
  try {
    switch (gameId) {
      case "rust":
        config = (await import("./configs/rust.config")).rustConfig;
        break;
      case "tarkov":
      case "tarkov-arena":
        config = (await import("./configs/tarkov.config")).tarkovConfig;
        break;
      case "fortnite":
        config = (await import("./configs/fortnite.config")).fortniteConfig;
        break;
      case "pubg":
        config = (await import("./configs/pubg.config")).pubgConfig;
        break;
      case "poe":
        config = (await import("./configs/poe.config")).poeConfig;
        break;
      case "poe2":
        config = (await import("./configs/poe2.config")).poe2Config;
        break;
      case "diablo4":
        config = (await import("./configs/diablo4.config")).diablo4Config;
        break;
      case "diablo3":
        config = (await import("./configs/diablo3.config")).diablo3Config;
        break;
      case "diablo2":
        config = (await import("./configs/diablo2.config")).diablo2Config;
        break;
      case "diabloimmortal":
        config = (await import("./configs/diabloimmortal.config"))
          .diabloImmortalConfig;
        break;

      default:
        throw new Error(`Unknown game ID: ${gameId}`);
    }

    // Cache for future use
    configCache.set(gameId, config);
    console.log(`✅ [Dynamic Import] Loaded config for ${gameId}`);

    return config;
  } catch (error) {
    console.error(`❌ [Dynamic Import] Failed to load config for ${gameId}:`, error);
    throw new Error(`Failed to load config for game: ${gameId}`);
  }
}

/**
 * Preload multiple configs in parallel
 * Useful for home page that shows all games
 */
export async function preloadConfigs(gameIds: string[]): Promise<void> {
  console.log(`📦 [Preload] Loading ${gameIds.length} configs...`);
  await Promise.all(gameIds.map(loadGameConfig));
  console.log(`✅ [Preload] All configs loaded`);
}

/**
 * Get list of all supported game IDs
 */
export function getSupportedGameIds(): string[] {
  return [
    "rust",
    "tarkov",
    "tarkov-arena",
    "fortnite",
    "pubg",
    "poe",
    "poe2",
    "diablo4",
    "diablo3",
    "diablo2",
    "diabloimmortal",
  ];
}
