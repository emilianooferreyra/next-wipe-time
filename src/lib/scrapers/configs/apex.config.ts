import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Apex Legends
 */
export const apexConfig: GameScraperConfig = {
  id: "apex",
  name: "Apex Legends",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(
        now.getTime() + 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastWipe: new Date(
        now.getTime() - 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      frequency: "Every 3 months",
      source: "ea.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 3 months (Seasons)",
    confirmed: false,
    announcement: "Apex Legends seasons typically release every 3 months",
  },
  developer: "Respawn Entertainment",
  typicalCycle: "Every 3 months",
};
