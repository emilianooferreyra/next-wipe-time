/**
 * Type-safe Game IDs using Template Literal Types
 *
 * This file provides compile-time validation for all game IDs,
 * enabling autocomplete and preventing typos.
 */

// Single version games
export const SINGLE_GAMES = [
  "rust",
  "tarkov",
  "fortnite",
  "lastepoch",
  "valorant",
  "lol",
  "tft",
  "apex",
  "pubg",
  "warframe",
  "dbd",
  "rocketleague",
  "overwatch2",
  "destiny2",
  "r6siege",
] as const;

// Multi-version game families
export const MULTI_VERSION_GAMES = {
  diablo: ["diablo4", "diablo3", "diablo2", "diabloimmortal"],
  poe: ["poe", "poe2"],
  cod: ["cod", "cod-mw3", "cod-bo6"],
} as const;

// Extract types from const arrays
export type SingleGameId = (typeof SINGLE_GAMES)[number];
export type MultiVersionFamily = keyof typeof MULTI_VERSION_GAMES;
export type MultiVersionGameId =
  (typeof MULTI_VERSION_GAMES)[MultiVersionFamily][number];

// Union of all valid game IDs
export type GameId = SingleGameId | MultiVersionGameId;

// Type to check if a game has versions
export type GameFamily<T extends GameId> = T extends MultiVersionGameId
  ? Extract<MultiVersionFamily, { [K in MultiVersionFamily]: T extends (typeof MULTI_VERSION_GAMES)[K][number] ? K : never }[MultiVersionFamily]>
  : never;

// Extract base game ID from versioned ID
export type BaseGameId<T extends GameId> = T extends `${infer Base}-${string}`
  ? Base extends GameFamily<T>
    ? Base
    : T
  : T;

// Get all versions for a game family
export type GameVersions<T extends MultiVersionFamily> =
  (typeof MULTI_VERSION_GAMES)[T][number];

// Helper to get all game IDs as array
export function getAllGameIds(): readonly GameId[] {
  const multiVersionIds = Object.values(MULTI_VERSION_GAMES).flat();
  return [...SINGLE_GAMES, ...multiVersionIds] as const;
}

// Type guard to check if a string is a valid GameId
export function isValidGameId(id: string): id is GameId {
  return getAllGameIds().includes(id as GameId);
}

// Type guard for single vs multi-version
export function isSingleGame(id: GameId): id is SingleGameId {
  return SINGLE_GAMES.includes(id as SingleGameId);
}

export function isMultiVersionGame(id: GameId): id is MultiVersionGameId {
  const allMultiVersion = Object.values(MULTI_VERSION_GAMES).flat();
  return allMultiVersion.includes(id as MultiVersionGameId);
}

// Get game family if multi-version
export function getGameFamily(id: GameId): MultiVersionFamily | null {
  for (const [family, games] of Object.entries(MULTI_VERSION_GAMES)) {
    if ((games as readonly GameId[]).includes(id)) {
      return family as MultiVersionFamily;
    }
  }
  return null;
}

// Get all versions for a game
export function getGameVersions(id: GameId): readonly GameId[] {
  const family = getGameFamily(id);
  if (!family) return [id];
  return MULTI_VERSION_GAMES[family];
}
