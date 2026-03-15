import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Path of Exile
 *
 * Estrategia: SCRAPED
 * PoE requiere scraping de su website oficial
 */
export const poeConfig: GameScraperConfig = {
  id: "poe",
  name: "Path of Exile",
  eventType: "league",
  strategy: "scraped",
  scraperFunction: async () => {
    // Implementacion temporal - scraper real va aqui
    const now = new Date();
    return {
      nextWipe: new Date(
        now.getTime() + 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastWipe: new Date(
        now.getTime() - 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      frequency: "Every 13 weeks",
      source: "pathofexile.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "league" as const,
    };
  },
  fallbackData: {
    frequency: "Every 3 months (13 weeks)",
    confirmed: false,
    announcement: "PoE leagues typically release every 13 weeks",
  },
  developer: "Grinding Gear Games",
  typicalCycle: "Every 13 weeks (~3 months)",
};
