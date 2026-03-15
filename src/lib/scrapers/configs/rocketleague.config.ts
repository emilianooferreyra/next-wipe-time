import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Rocket League
 */
export const rocketLeagueConfig: GameScraperConfig = {
  id: "rocketleague",
  name: "Rocket League",
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
      source: "rocketleague.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 3-4 months",
    confirmed: false,
    announcement: "Rocket League seasons typically last 3-4 months",
  },
  developer: "Psyonix",
  typicalCycle: "Every 3-4 months",
};
