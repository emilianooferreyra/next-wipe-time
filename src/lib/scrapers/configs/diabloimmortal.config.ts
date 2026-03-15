import type { GameScraperConfig } from "../types";

export const diabloImmortalConfig: GameScraperConfig = {
  id: "diabloimmortal",
  name: "Diablo Immortal",
  eventType: "update",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: null,
      lastWipe: null,
      frequency: "Regular updates",
      source: "blizzard.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "update" as const,
    };
  },
  fallbackData: {
    frequency: "Regular updates",
    confirmed: false,
    announcement: "Diablo Immortal receives regular content updates",
  },
  developer: "Blizzard Entertainment",
  typicalCycle: "Regular updates",
};
