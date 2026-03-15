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
      // Single games
      case "rust":
        config = (await import("./configs/rust.config")).rustConfig;
        break;
      case "tarkov":
        config = (await import("./configs/tarkov.config")).tarkovConfig;
        break;
      case "fortnite":
        config = (await import("./configs/fortnite.config")).fortniteConfig;
        break;
      case "lastepoch":
        config = (await import("./configs/lastepoch.config")).lastepochConfig;
        break;
      case "valorant":
        config = (await import("./configs/valorant.config")).valorantConfig;
        break;
      case "lol":
        config = (await import("./configs/lol.config")).lolConfig;
        break;
      case "tft":
        config = (await import("./configs/tft.config")).tftConfig;
        break;
      case "apex":
        config = (await import("./configs/apex.config")).apexConfig;
        break;
      case "pubg":
        config = (await import("./configs/pubg.config")).pubgConfig;
        break;
      case "warframe":
        config = (await import("./configs/warframe.config")).warframeConfig;
        break;
      case "dbd":
        config = (await import("./configs/dbd.config")).dbdConfig;
        break;

      // Multi-version games
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
      case "cod":
        config = (await import("./configs/cod.config")).codConfig;
        break;
      case "cod-mw3":
        config = (await import("./configs/cod-mw3.config")).codmw3Config;
        break;
      case "cod-bo6":
        config = (await import("./configs/cod-bo6.config")).codbo6Config;
        break;
      case "rocketleague":
        config = (await import("./configs/rocketleague.config"))
          .rocketLeagueConfig;
        break;
      case "overwatch2":
        config = (await import("./configs/overwatch2.config")).overwatch2Config;
        break;
      case "destiny2":
        config = (await import("./configs/destiny2.config")).destiny2Config;
        break;
      case "r6siege":
        config = (await import("./configs/r6siege.config")).r6siegeConfig;
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
    // Single games
    "rust",
    "tarkov",
    "fortnite",
    "lastepoch",
    "valorant",
    "lol",
    "tft",
    "apex",
    "pubg",
    "warframe",
    "dbd",
    // Multi-version games
    "poe",
    "poe2",
    "diablo4",
    "diablo3",
    "diablo2",
    "diabloimmortal",
    "cod",
    "cod-mw3",
    "cod-bo6",
    "rocketleague",
    "overwatch2",
    "destiny2",
    "r6siege",
  ];
}
