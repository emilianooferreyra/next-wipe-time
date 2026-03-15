import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Valorant
 */
export const valorantConfig: GameScraperConfig = {
  id: "valorant",
  name: "Valorant",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(
        now.getTime() + 60 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastWipe: new Date(
        now.getTime() - 60 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      frequency: "Every 2 months",
      source: "playvalorant.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 2 months (Acts)",
    confirmed: false,
    announcement: "Valorant Acts typically release every 2 months",
  },
  developer: "Riot Games",
  typicalCycle: "Every 2 months (Acts)",
};
