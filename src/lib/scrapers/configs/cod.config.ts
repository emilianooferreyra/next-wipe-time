import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Call of Duty: Warzone
 */
export const codConfig: GameScraperConfig = {
  id: "cod",
  name: "Call of Duty: Warzone",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      lastWipe: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      frequency: "Every 2 months",
      source: "callofduty.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 2 months (approx)",
    confirmed: false,
    announcement: "Warzone seasons typically last around 2 months",
  },
  developer: "Activision",
  typicalCycle: "Every 2 months",
};
