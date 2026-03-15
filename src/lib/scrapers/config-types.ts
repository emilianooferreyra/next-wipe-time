/**
 * Type-safe Scraper Configuration using Discriminated Unions
 *
 * This provides compile-time type safety for scraper configurations,
 * ensuring that each strategy type has only the fields it needs.
 */

import type { WipeData } from "@/schemas/wipe-data";
import type { GameId } from "@/types/game-ids";

/**
 * Event types that games can have
 */
export type EventType =
  | "season"
  | "league"
  | "wipe"
  | "patch"
  | "event"
  | "update";

/**
 * Base configuration shared by all scraper types
 */
type BaseScraperConfig = {
  id: GameId;
  name: string;
  eventType: EventType;
  developer: string;
  typicalCycle: string;
  fallbackData?: Partial<WipeData>;
};

/**
 * Schedule configuration for calculated scrapers
 */
export type ScheduleConfig = {
  type: "monthly" | "weekly" | "seasonal";
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  weekOfMonth?: number; // 1-5
  dayOfMonth?: number; // 1-31
  time: string; // HH:MM format
  timezone: string; // IANA timezone
  duration?: number; // Duration in days
};

/**
 * Calculated scraper - uses mathematical formulas (e.g., Rust)
 */
export type CalculatedScraperConfig = BaseScraperConfig & {
  strategy: "calculated";
  schedule: ScheduleConfig;
  scraperFunction?: never;
  apiEndpoint?: never;
};

/**
 * Scraped scraper - uses custom scraping function (e.g., PoE)
 */
export type ScrapedScraperConfig = BaseScraperConfig & {
  strategy: "scraped";
  scraperFunction: () => Promise<WipeData>;
  schedule?: never;
  apiEndpoint?: never;
};

/**
 * API scraper - fetches from official API
 */
export type ApiScraperConfig = BaseScraperConfig & {
  strategy: "api";
  apiEndpoint: string;
  schedule?: never;
  scraperFunction?: never;
};

/**
 * Discriminated union of all scraper config types
 */
export type GameScraperConfig =
  | CalculatedScraperConfig
  | ScrapedScraperConfig
  | ApiScraperConfig;

/**
 * Strategy type extracted from config
 */
export type ScraperStrategy = GameScraperConfig["strategy"];

// ============================================
// Type Guards
// ============================================

/**
 * Type guard for calculated configs
 */
export function isCalculatedConfig(
  config: GameScraperConfig
): config is CalculatedScraperConfig {
  return config.strategy === "calculated";
}

/**
 * Type guard for scraped configs
 */
export function isScrapedConfig(
  config: GameScraperConfig
): config is ScrapedScraperConfig {
  return config.strategy === "scraped";
}

/**
 * Type guard for API configs
 */
export function isApiConfig(
  config: GameScraperConfig
): config is ApiScraperConfig {
  return config.strategy === "api";
}

// ============================================
// Helper Types
// ============================================

/**
 * Extract config type by strategy
 */
export type ConfigByStrategy<S extends ScraperStrategy> =
  S extends "calculated"
    ? CalculatedScraperConfig
    : S extends "scraped"
      ? ScrapedScraperConfig
      : S extends "api"
        ? ApiScraperConfig
        : never;

/**
 * Get all game IDs that use a specific strategy
 */
export type GamesByStrategy<S extends ScraperStrategy> = Extract<
  GameScraperConfig,
  { strategy: S }
>["id"];
