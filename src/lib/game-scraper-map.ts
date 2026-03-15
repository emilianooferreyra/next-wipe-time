/**
 * Optimized Game Scraper Map with Dynamic Imports
 *
 * BREAKING CHANGE: Now uses dynamic config loading for ~200KB bundle reduction
 * Configs are loaded on-demand instead of all upfront
 */

import type { WipeData } from "@/schemas/wipe-data";
import { optimizedScraperEngine } from "./scrapers/optimized-engine";
import {
  getSupportedGameIds,
  loadGameConfig,
} from "./scrapers/dynamic-config-loader";

export type {
  GameScraperConfig,
  ScraperStrategy,
} from "./scrapers/types";

/**
 * Optimized game scraper map - uses dynamic imports
 */
export const gameScraperMap = {
  /**
   * Scrape game data using optimized engine with dynamic config loading
   */
  async scrape(gameId: string): Promise<WipeData> {
    return optimizedScraperEngine.scrape(gameId);
  },

  /**
   * Get scraper function for a game (backward compatibility)
   * @deprecated Use scrape() directly instead
   */
  getScraper(gameId: string): (() => Promise<WipeData>) | null {
    return () => this.scrape(gameId);
  },

  /**
   * Check if game is supported
   */
  hasScraper(gameId: string): boolean {
    return getSupportedGameIds().includes(gameId);
  },

  /**
   * Get all supported game IDs
   */
  getAvailableGameIds(): string[] {
    return getSupportedGameIds();
  },

  /**
   * Preload config for a game (useful for optimization)
   */
  async preloadConfig(gameId: string): Promise<void> {
    await loadGameConfig(gameId);
  },
};

export { optimizedScraperEngine as scraperEngine };

// Helper functions for direct usage
export function getScraperForGame(gameId: string) {
  return gameScraperMap.getScraper(gameId);
}

export function hasScraperForGame(gameId: string): boolean {
  return gameScraperMap.hasScraper(gameId);
}
