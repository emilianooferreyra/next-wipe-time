import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Destiny 2
 */
export const destiny2Config: GameScraperConfig = {
  id: "destiny2",
  name: "Destiny 2",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      lastWipe: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      frequency: "Every 3 months",
      source: "bungie.net (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 3 months",
    confirmed: false,
    announcement: "Destiny 2 seasons typically last 3 months",
  },
  developer: "Bungie",
  typicalCycle: "Every 3 months",
};
