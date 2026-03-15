import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Call of Duty: Modern Warfare III
 */
export const codmw3Config: GameScraperConfig = {
  id: "cod-mw3",
  name: "Call of Duty: Modern Warfare III",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: async () => {
    const now = new Date();
    return {
      nextWipe: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      lastWipe: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      frequency: "Every 2 months",
      source: "callofduty.com (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "season" as const,
    };
  },
  fallbackData: {
    frequency: "Every 2 months (approx)",
    confirmed: false,
    announcement: "MW3 seasons typically last around 2 months",
  },
  developer: "Activision",
  typicalCycle: "Every 2 months",
};
