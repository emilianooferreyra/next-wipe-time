import type { GameScraperConfig } from "../types";

/**
 * Configuracion de PUBG
 */
export const pubgConfig: GameScraperConfig = {
  id: "pubg",
  name: "PUBG",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(
        now.getTime() + 75 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastWipe: new Date(
        now.getTime() - 75 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      frequency: "Every 2-3 months",
      source: "steam community (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 2-3 months (Seasons)",
    confirmed: false,
    announcement: "PUBG seasons and updates are announced via Steam news",
  },
  developer: "KRAFTON",
  typicalCycle: "Every 2-3 months",
};
