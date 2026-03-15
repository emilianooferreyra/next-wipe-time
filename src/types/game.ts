import type { WipeData } from "@/schemas/wipe-data";
import type { GameId } from "./game-ids";

// Re-export WipeData for convenience
export type { WipeData };
export type { GameId } from "./game-ids";

export interface Game {
  id: GameId;
  name: string;
  accentColor: string;
  backgroundImage: string;
  hoverMedia?: string;
  hoverMediaType?: "video" | "gif";
}

// ============================================
// Generic Data Map Types
// ============================================

/**
 * Generic map type for optional values
 */
export type DataMap<T> = {
  readonly [K in string]?: T;
};

/**
 * Game data map with optional WipeData values
 */
export type GameDataMap = DataMap<WipeData>;

/**
 * Loading map with required boolean values
 */
export type LoadingMap = Required<DataMap<boolean>>;

/**
 * Type-safe game data map with all values defined
 */
export type CompleteGameDataMap = {
  readonly [K in GameId]: WipeData;
};

// ============================================
// Type Guards for Maps
// ============================================

/**
 * Type guard to check if game data exists
 */
export function hasGameData(
  map: GameDataMap,
  gameId: GameId
): map is GameDataMap & { [K in typeof gameId]: WipeData } {
  return map[gameId] !== undefined;
}

/**
 * Safely get game data with type narrowing
 */
export function getGameData(
  map: GameDataMap,
  gameId: GameId
): WipeData | undefined {
  return map[gameId];
}

/**
 * Get game data or throw error
 */
export function requireGameData(
  map: GameDataMap,
  gameId: GameId
): WipeData {
  const data = map[gameId];
  if (data === undefined) {
    throw new Error(`No data found for game: ${gameId}`);
  }
  return data;
}

// ============================================
// Filter Types with Mapped Types
// ============================================

/**
 * Available filter types
 */
export const FILTERS = {
  ALL: "all",
  CONFIRMED: "confirmed",
  ESTIMATED: "estimated",
  SOON: "soon",
  THIS_WEEK: "this-week",
  THIS_MONTH: "this-month",
} as const;

export type FilterType = (typeof FILTERS)[keyof typeof FILTERS];

/**
 * Filter metadata (without runtime count)
 */
export type FilterMetadata = {
  label: string;
  icon: string;
  description?: string;
};

/**
 * Mapped type: ensures ALL filters have metadata
 * TypeScript will error if any filter is missing
 */
export type FilterMetadataMap = {
  [K in FilterType]: FilterMetadata;
};

/**
 * Type-safe filter metadata configuration
 * This guarantees compile-time completeness
 */
export const FILTER_METADATA: FilterMetadataMap = {
  all: {
    label: "All Games",
    icon: "gamepad-2",
    description: "Show all games",
  },
  confirmed: {
    label: "Confirmed",
    icon: "circle-check",
    description: "Only confirmed dates",
  },
  estimated: {
    label: "Estimated",
    icon: "triangle-alert",
    description: "Estimated dates only",
  },
  soon: {
    label: "Coming Soon",
    icon: "flame",
    description: "Wipes happening soon",
  },
  "this-week": {
    label: "This Week",
    icon: "calendar-days",
    description: "Wipes this week",
  },
  "this-month": {
    label: "This Month",
    icon: "calendar",
    description: "Wipes this month",
  },
};

/**
 * Filter config with runtime count
 */
export interface FilterConfig extends FilterMetadata {
  id: FilterType;
  count?: number;
}

/**
 * Get filter metadata (type-safe)
 */
export function getFilterMetadata(type: FilterType): FilterMetadata {
  return FILTER_METADATA[type];
}

/**
 * Create FilterConfig from FilterType
 */
export function createFilterConfig(
  type: FilterType,
  count?: number
): FilterConfig {
  return {
    id: type,
    ...FILTER_METADATA[type],
    count,
  };
}
