/**
 * Sistema de scrapers estandarizado - TODOS los juegos
 *
 * Uso:
 * ```typescript
 * import { gameScraperMap } from "@/lib/scrapers/configs";
 *
 * // Usar el motor de scraping
 * const data = await gameScraperMap.scrape("rust");
 *
 * // O usar el scraper directamente
 * const scraper = gameScraperMap.getScraper("poe");
 * const data = await scraper();
 * ```
 */

import type { WipeData } from "@/schemas/wipe-data";
import { scraperEngine } from "../engine";
import { apexConfig } from "./apex.config";
import { codConfig } from "./cod.config";
import { codbo6Config } from "./cod-bo6.config";
import { codmw3Config } from "./cod-mw3.config";
import { dbdConfig } from "./dbd.config";
import { destiny2Config } from "./destiny2.config";
import { diablo2Config } from "./diablo2.config";
import { diablo3Config } from "./diablo3.config";
import { diablo4Config } from "./diablo4.config";
import { diabloImmortalConfig } from "./diabloimmortal.config";
import { fortniteConfig } from "./fortnite.config";
import { lastepochConfig } from "./lastepoch.config";
import { lolConfig } from "./lol.config";
import { overwatch2Config } from "./overwatch2.config";
// Multi-version games
import { poeConfig } from "./poe.config";
import { poe2Config } from "./poe2.config";
import { pubgConfig } from "./pubg.config";
import { r6siegeConfig } from "./r6siege.config";
import { rocketLeagueConfig } from "./rocketleague.config";
// Single games
import { rustConfig } from "./rust.config";
import { tarkovConfig } from "./tarkov.config";
import { tftConfig } from "./tft.config";
import { valorantConfig } from "./valorant.config";
import { warframeConfig } from "./warframe.config";

// ============================================
// REGISTRAR TODOS LOS JUEGOS (24 total)
// ============================================

// Single games
scraperEngine.register(rustConfig);
scraperEngine.register(tarkovConfig);
scraperEngine.register(fortniteConfig);
scraperEngine.register(lastepochConfig);
scraperEngine.register(valorantConfig);
scraperEngine.register(lolConfig);
scraperEngine.register(tftConfig);
scraperEngine.register(apexConfig);
scraperEngine.register(pubgConfig);
scraperEngine.register(warframeConfig);
scraperEngine.register(dbdConfig);

// Multi-version games
scraperEngine.register(poeConfig);
scraperEngine.register(poe2Config);
scraperEngine.register(diablo4Config);
scraperEngine.register(diablo3Config);
scraperEngine.register(diablo2Config);
scraperEngine.register(diabloImmortalConfig);
scraperEngine.register(codConfig);
scraperEngine.register(codmw3Config);
scraperEngine.register(codbo6Config);
scraperEngine.register(rocketLeagueConfig);
scraperEngine.register(overwatch2Config);
scraperEngine.register(destiny2Config);
scraperEngine.register(r6siegeConfig);

/**
 * Mapa de scrapers estandarizado
 * Reemplaza el antiguo GAME_SCRAPER_MAP
 */
export const gameScraperMap = {
  /**
   * Obtener datos de un juego usando su estrategia configurada
   */
  async scrape(gameId: string): Promise<WipeData> {
    return scraperEngine.scrape(gameId);
  },

  /**
   * Obtener la función scraper para un juego (para compatibilidad con código antiguo)
   */
  getScraper(gameId: string): (() => Promise<WipeData>) | null {
    return () => this.scrape(gameId);
  },

  /**
   * Verificar si existe un scraper para un juego
   */
  hasScraper(gameId: string): boolean {
    const supportedGames = [
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
    return supportedGames.includes(gameId);
  },

  /**
   * Obtener todos los IDs de juegos soportados (24 total)
   */
  getAvailableGameIds(): string[] {
    return [
      // Single games (11)
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
      // Multi-version games (13)
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
  },
};

// ============================================
// EXPORTAR TODOS LOS CONFIGS
// ============================================

// Exportar el engine para uso avanzado
export { scraperEngine } from "../engine";
export type { GameScraperConfig, ScraperStrategy } from "../types";
export { apexConfig } from "./apex.config";
export { codConfig } from "./cod.config";
export { codbo6Config } from "./cod-bo6.config";
export { codmw3Config } from "./cod-mw3.config";
export { dbdConfig } from "./dbd.config";
export { destiny2Config } from "./destiny2.config";
export { diablo2Config } from "./diablo2.config";
export { diablo3Config } from "./diablo3.config";
export { diablo4Config } from "./diablo4.config";
export { diabloImmortalConfig } from "./diabloimmortal.config";
export { fortniteConfig } from "./fortnite.config";
export { lastepochConfig } from "./lastepoch.config";
export { lolConfig } from "./lol.config";
export { overwatch2Config } from "./overwatch2.config";
// Multi-version games
export { poeConfig } from "./poe.config";
export { poe2Config } from "./poe2.config";
export { pubgConfig } from "./pubg.config";
export { r6siegeConfig } from "./r6siege.config";
export { rocketLeagueConfig } from "./rocketleague.config";
// Single games
export { rustConfig } from "./rust.config";
export { tarkovConfig } from "./tarkov.config";
export { tftConfig } from "./tft.config";
export { valorantConfig } from "./valorant.config";
export { warframeConfig } from "./warframe.config";
