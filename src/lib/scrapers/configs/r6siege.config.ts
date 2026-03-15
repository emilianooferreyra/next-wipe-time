import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Rainbow Six Siege
 */
export const r6siegeConfig: GameScraperConfig = {
  id: "r6siege",
  name: "Rainbow Six Siege",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      lastWipe: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      frequency: "Every 3 months",
      source: "ubisoft.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 3 months (Operations)",
    confirmed: false,
    announcement: "R6 Siege Operations typically release every 3 months",
  },
  developer: "Ubisoft",
  typicalCycle: "Every 3 months",
};
