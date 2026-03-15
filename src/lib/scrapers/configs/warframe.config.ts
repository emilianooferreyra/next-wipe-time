import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Warframe
 */
export const warframeConfig: GameScraperConfig = {
  id: "warframe",
  name: "Warframe",
  eventType: "update",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastWipe: new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      frequency: "Frequent updates",
      source: "warframe.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "update" as const,
    };
  },
  fallbackData: {
    frequency: "Frequent updates",
    confirmed: false,
    announcement: "Warframe receives frequent updates and hotfixes",
  },
  developer: "Digital Extremes",
  typicalCycle: "Frequent updates",
};
