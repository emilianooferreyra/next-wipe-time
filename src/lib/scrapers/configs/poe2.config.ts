import type { GameScraperConfig } from "../types";

export const poe2Config: GameScraperConfig = {
  id: "poe2",
  name: "Path of Exile 2",
  eventType: "league",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(
        now.getTime() + 91 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastWipe: new Date(
        now.getTime() - 91 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      frequency: "Every 13 weeks",
      source: "pathofexile.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "league" as const,
    };
  },
  fallbackData: {
    frequency: "Every 13 weeks",
    confirmed: false,
    announcement: "Path of Exile 2 leagues typically release every 13 weeks",
  },
  developer: "Grinding Gear Games",
  typicalCycle: "Every 13 weeks",
};
