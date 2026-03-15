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
import { diablo2Config } from "./diablo2.config";
import { diablo3Config } from "./diablo3.config";
import { diablo4Config } from "./diablo4.config";
import { diabloImmortalConfig } from "./diabloimmortal.config";
import { fortniteConfig } from "./fortnite.config";
import { poeConfig } from "./poe.config";
import { poe2Config } from "./poe2.config";
import { pubgConfig } from "./pubg.config";
import { rustConfig } from "./rust.config";
import { tarkovConfig } from "./tarkov.config";

// ============================================
// REGISTRAR JUEGOS SOPORTADOS (11 total)
// ============================================

scraperEngine.register(rustConfig);
scraperEngine.register(tarkovConfig);
scraperEngine.register(fortniteConfig);
scraperEngine.register(pubgConfig);
scraperEngine.register(poeConfig);
scraperEngine.register(poe2Config);
scraperEngine.register(diablo4Config);
scraperEngine.register(diablo3Config);
scraperEngine.register(diablo2Config);
scraperEngine.register(diabloImmortalConfig);

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
    return this.getAvailableGameIds().includes(gameId);
  },

  /**
   * Obtener todos los IDs de juegos soportados
   */
  getAvailableGameIds(): string[] {
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
  },
};

// ============================================
// EXPORTAR TODOS LOS CONFIGS
// ============================================

export { scraperEngine } from "../engine";
export type { GameScraperConfig, ScraperStrategy } from "../types";
export { diablo2Config } from "./diablo2.config";
export { diablo3Config } from "./diablo3.config";
export { diablo4Config } from "./diablo4.config";
export { diabloImmortalConfig } from "./diabloimmortal.config";
export { fortniteConfig } from "./fortnite.config";
export { poeConfig } from "./poe.config";
export { poe2Config } from "./poe2.config";
export { pubgConfig } from "./pubg.config";
export { rustConfig } from "./rust.config";
export { tarkovConfig } from "./tarkov.config";
