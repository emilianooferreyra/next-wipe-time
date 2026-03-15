import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Last Epoch
 */
export const lastepochConfig: GameScraperConfig = {
  id: "lastepoch",
  name: "Last Epoch",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(now.getTime() + 100 * 24 * 60 * 60 * 1000).toISOString(),
      lastWipe: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      frequency: "Every 3-4 months",
      source: "forum.lastepoch.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 3-4 months (Cycles)",
    confirmed: false,
    announcement: "Last Epoch Cycles typically last 3-4 months",
  },
  developer: "Eleventh Hour Games",
  typicalCycle: "Every 3-4 months (Cycles)",
};
