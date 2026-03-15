import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Teamfight Tactics
 */
export const tftConfig: GameScraperConfig = {
  id: "tft",
  name: "Teamfight Tactics",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(
        now.getTime() + 100 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastWipe: new Date(
        now.getTime() - 100 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      frequency: "Every 3-4 months",
      source: "tft.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 3-4 months (Sets)",
    confirmed: false,
    announcement: "TFT Sets typically last 3-4 months with mid-set updates",
  },
  developer: "Riot Games",
  typicalCycle: "Every 3-4 months (Sets)",
};
