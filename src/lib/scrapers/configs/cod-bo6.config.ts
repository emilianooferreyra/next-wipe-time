import type { GameScraperConfig } from "../types";

export const codbo6Config: GameScraperConfig = {
  id: "cod-bo6",
  name: "Call of Duty: Black Ops 6",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(now.getTime() + 49 * 24 * 60 * 60 * 1000).toISOString(),
      lastWipe: new Date(now.getTime() - 49 * 24 * 60 * 60 * 1000).toISOString(),
      frequency: "Every 6-8 weeks",
      source: "callofduty.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 6-8 weeks",
    confirmed: false,
    announcement: "Black Ops 6 seasons typically last 6-8 weeks",
  },
  developer: "Activision",
  typicalCycle: "Every 6-8 weeks",
};
