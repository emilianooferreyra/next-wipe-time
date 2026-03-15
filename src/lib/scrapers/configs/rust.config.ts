import type { GameScraperConfig } from "../types";

/**
 * Configuracion de Rust
 *
 * Estrategia: CALCULATED
 * Rust tiene un schedule predecible: primer jueves de cada mes a las 19:00 UTC
 */
export const rustConfig: GameScraperConfig = {
  id: "rust",
  name: "Rust",
  eventType: "wipe",
  strategy: "calculated",
  schedule: {
    type: "monthly",
    dayOfWeek: 4,
    weekOfMonth: 1,
    time: "19:00",
    timezone: "UTC",
  },
  fallbackData: {
    announcement:
      "Facepunch official servers wipe on the first Thursday of each month at 19:00 UTC",
    eventName: "Monthly Wipe",
  },
  developer: "Facepunch Studios",
  typicalCycle: "Monthly (First Thursday at 7PM UTC)",
};
