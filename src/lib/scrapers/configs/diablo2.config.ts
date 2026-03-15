import type { GameScraperConfig } from "../types";

export const diablo2Config: GameScraperConfig = {
  id: "diablo2",
  name: "Diablo II: Resurrected",
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
      frequency: "Varies",
      source: "blizzard.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Varies",
    confirmed: false,
    announcement: "Diablo II: Resurrected ladder resets vary in schedule",
  },
  developer: "Blizzard Entertainment",
  typicalCycle: "Varies",
};
