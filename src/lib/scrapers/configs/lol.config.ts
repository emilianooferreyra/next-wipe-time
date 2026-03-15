import type { GameScraperConfig } from "../types";

/**
 * Configuracion de League of Legends
 */
export const lolConfig: GameScraperConfig = {
  id: "lol",
  name: "League of Legends",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(
        now.getTime() + 120 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastWipe: new Date(
        now.getTime() - 120 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      frequency: "Seasonal",
      source: "leagueoflegends.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Seasonal (3 splits per year)",
    confirmed: false,
    announcement: "LoL has 3 competitive splits per year",
  },
  developer: "Riot Games",
  typicalCycle: "Seasonal (3 splits)",
};
