import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Escape from Tarkov
 *
 * Estrategia: SCRAPED
 * Tarkov no tiene schedule fijo
 */
export const tarkovConfig: GameScraperConfig = {
  id: "tarkov",
  name: "Escape from Tarkov",
  eventType: "wipe",
  strategy: "scraped",
  scraperFunction: async () => {
    // Implementacion temporal
    const now = new Date();
    return {
      nextWipe: new Date(
        now.getTime() + 180 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastWipe: "2024-07-10T12:00:00Z",
      frequency: "Every 6 months (approx)",
      source: "r/EscapefromTarkov (Estimated)",
      scrapedAt: now.toISOString(),
      confirmed: false,
      eventType: "wipe" as const,
    };
  },
  fallbackData: {
    lastWipe: "2024-07-10T12:00:00Z",
    frequency: "Every 6 months (approx)",
    confirmed: false,
    announcement: "Tarkov wipes are irregular. Typically every 6-12 months.",
  },
  developer: "Battlestate Games",
  typicalCycle: "Every 6-12 months (irregular)",
};
