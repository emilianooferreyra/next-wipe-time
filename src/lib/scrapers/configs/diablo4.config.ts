import type { GameScraperConfig } from "../types";

export const diablo4Config: GameScraperConfig = {
  id: "diablo4",
  name: "Diablo IV",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(
        now.getTime() + 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastWipe: new Date(
        now.getTime() - 90 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      frequency: "Every 3 months",
      source: "blizzard.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 3 months",
    confirmed: false,
    announcement: "Diablo IV seasons typically release every 3 months",
  },
  developer: "Blizzard Entertainment",
  typicalCycle: "Every 3 months",
};
