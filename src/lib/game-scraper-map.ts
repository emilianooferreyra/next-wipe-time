/**
 * Maps game IDs to their scraper functions
 * Supports both single games and multi-version games
 */

import type { WipeData } from "@/schemas/wipe-data";

// Import all scrapers
import { scrapeRustWipe } from "./scrapers/rust";
import { scrapeTarkovWipeFromReddit } from "./scrapers/tarkov-reddit";
import { scrapePoeWipe } from "./scrapers/poe";
import { scrapePoe2League } from "./scrapers/poe2";
import { scrapeFortniteWipe } from "./scrapers/fortnite";
import { scrapeDiablo4Seasons } from "./scrapers/diablo4-news";
import { scrapeLastEpochCycles } from "./scrapers/last-epoch-forum";
import { scrapeValorantActs } from "./scrapers/valorant-fandom";
import { scrapeLoLSeasons } from "./scrapers/lol-reddit";
import { scrapeTFTSets } from "./scrapers/tft-reddit";
import { scrapeApexSeasons } from "./scrapers/apex-fandom";
import { scrapeCODSeasons } from "./scrapers/cod-fandom";
import { scrapeCodMW3Season } from "./scrapers/cod-mw3";
import { scrapeCodBO6Season } from "./scrapers/cod-bo6";
import { scrapeRocketLeagueSeasons } from "./scrapers/rocketleague-fandom";
import { scrapeDBDChapters } from "./scrapers/dbd-fandom";
import { scrapePUBGSeasons } from "./scrapers/pubg-steam";
import { scrapeOverwatch2Season } from "./scrapers/overwatch2";
import { scrapeDestiny2Season } from "./scrapers/destiny2";
import { scrapeR6SiegeSeason } from "./scrapers/r6siege";
import { scrapeWarframeUpdate } from "./scrapers/warframe";
import { scrapeDiablo3Seasons } from "./scrapers/diablo3";
import { scrapeDiablo2Seasons } from "./scrapers/diablo2";

export type GameScraperFunction = () => Promise<WipeData>;

/**
 * Map of game IDs to their scraper functions
 * This includes both single games and versioned games
 */
export const GAME_SCRAPER_MAP: Record<string, GameScraperFunction> = {
  // Single games (no versions)
  rust: scrapeRustWipe,
  tarkov: scrapeTarkovWipeFromReddit,
  fortnite: scrapeFortniteWipe,
  lastepoch: scrapeLastEpochCycles,
  valorant: scrapeValorantActs,
  lol: scrapeLoLSeasons,
  tft: scrapeTFTSets,
  apex: scrapeApexSeasons,
  pubg: scrapePUBGSeasons,
  warframe: scrapeWarframeUpdate,
  dbd: scrapeDBDChapters,

  // Multi-version games
  // Path of Exile
  poe: scrapePoeWipe,
  poe2: scrapePoe2League,

  // Diablo
  diablo4: scrapeDiablo4Seasons,
  diablo3: scrapeDiablo3Seasons,
  diablo2: scrapeDiablo2Seasons,

  // Call of Duty
  cod: scrapeCODSeasons,
  "cod-mw3": scrapeCodMW3Season,
  "cod-bo6": scrapeCodBO6Season,

  // Other multi-version
  rocketleague: scrapeRocketLeagueSeasons,
  overwatch2: scrapeOverwatch2Season,
  destiny2: scrapeDestiny2Season,
  r6siege: scrapeR6SiegeSeason,
};

/**
 * Get the scraper function for a game ID
 */
export function getScraperForGame(
  gameId: string,
): GameScraperFunction | null {
  return GAME_SCRAPER_MAP[gameId] || null;
}

/**
 * Check if a game has a scraper available
 */
export function hasScraperForGame(gameId: string): boolean {
  return gameId in GAME_SCRAPER_MAP;
}

/**
 * Get all available game IDs
 */
export function getAvailableGameIds(): string[] {
  return Object.keys(GAME_SCRAPER_MAP);
}
