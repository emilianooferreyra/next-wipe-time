import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Fortnite
 */
export const fortniteConfig: GameScraperConfig = {
  id: "fortnite",
  name: "Fortnite",
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
      frequency: "Every 60-90 days",
      source: "fortnite.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 60-90 days (Chapter/Season)",
    confirmed: false,
    announcement: "Fortnite seasons typically last 60-90 days",
  },
  developer: "Epic Games",
  typicalCycle: "Every 60-90 days",
};
