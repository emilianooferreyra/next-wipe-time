/**
 * Legacy types file - Re-exports from new type-safe config-types
 *
 * This file is kept for backward compatibility.
 * New code should import from ./config-types.ts
 */

export type {
  GameScraperConfig,
  ScraperStrategy,
  EventType,
  CalculatedScraperConfig,
  ScrapedScraperConfig,
  ApiScraperConfig,
  ScheduleConfig,
  ConfigByStrategy,
  GamesByStrategy,
} from "./config-types";

export {
  isCalculatedConfig,
  isScrapedConfig,
  isApiConfig,
} from "./config-types";
