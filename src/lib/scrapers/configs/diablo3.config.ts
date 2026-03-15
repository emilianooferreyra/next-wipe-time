import type { GameScraperConfig } from "../types";

export const diablo3Config: GameScraperConfig = {
  id: "diablo3",
  name: "Diablo III",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(
        now.getTime() + 105 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastWipe: new Date(
        now.getTime() - 105 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      frequency: "Every 3-4 months",
      source: "blizzard.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 3-4 months",
    confirmed: false,
    announcement: "Diablo III seasons typically release every 3-4 months",
  },
  developer: "Blizzard Entertainment",
  typicalCycle: "Every 3-4 months",
};
