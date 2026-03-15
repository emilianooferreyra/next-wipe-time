import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Overwatch 2
 */
export const overwatch2Config: GameScraperConfig = {
  id: "overwatch2",
  name: "Overwatch 2",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(
        now.getTime() + 63 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastWipe: new Date(
        now.getTime() - 63 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      frequency: "Every 9 weeks",
      source: "overwatch.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 9 weeks",
    confirmed: false,
    announcement: "Overwatch 2 seasons last approximately 9 weeks",
  },
  developer: "Blizzard Entertainment",
  typicalCycle: "Every 9 weeks",
};
