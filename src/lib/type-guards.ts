import type { WipeData } from "@/schemas/wipe-data";

export function hasCompleteChangelog(data: WipeData): data is WipeData & {
  changelog: NonNullable<WipeData["changelog"]>;
} {
  return Boolean(
    data.changelog &&
      (data.changelog.title ||
        data.changelog.summary ||
        data.changelog.features)
  );
}

/**
 * Check if WipeData has videos
 */
export function hasVideos(data: WipeData): data is WipeData & {
  videos: NonNullable<WipeData["videos"]>;
} {
  return Boolean(data.videos && data.videos.length > 0);
}

/**
 * Check if WipeData has live streams
 */
export function hasLiveStreams(data: WipeData): data is WipeData & {
  liveStreams: NonNullable<WipeData["liveStreams"]>;
} {
  return Boolean(data.liveStreams && data.liveStreams.length > 0);
}

/**
 * Check if WipeData has streaming events
 */
export function hasStreamingEvents(data: WipeData): data is WipeData & {
  streamingEvents: NonNullable<WipeData["streamingEvents"]>;
} {
  return Boolean(data.streamingEvents && data.streamingEvents.length > 0);
}

/**
 * Check if WipeData is confirmed
 */
export function isConfirmedData(
  data: WipeData
): data is WipeData & { confirmed: true } {
  return data.confirmed === true;
}

/**
 * Check if WipeData has next wipe date
 */
export function hasNextWipe(
  data: WipeData
): data is WipeData & { nextWipe: string } {
  return data.nextWipe !== null && data.nextWipe !== undefined;
}

/**
 * Check if WipeData has both next and last wipe (for progress calculation)
 */
export function hasWipeDates(
  data: WipeData
): data is WipeData & { nextWipe: string; lastWipe: string } {
  return (
    data.nextWipe !== null &&
    data.nextWipe !== undefined &&
    data.lastWipe !== null &&
    data.lastWipe !== undefined
  );
}

/**
 * Discriminated union for async operations
 */
export type AsyncData<T, E = Error> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: E };

/**
 * Check if async operation is idle
 */
export function isIdle<T>(state: AsyncData<T>): state is { status: "idle" } {
  return state.status === "idle";
}

/**
 * Check if async operation is loading
 */
export function isLoading<T>(
  state: AsyncData<T>
): state is { status: "loading" } {
  return state.status === "loading";
}

/**
 * Check if async operation succeeded
 */
export function isSuccess<T>(
  state: AsyncData<T>
): state is { status: "success"; data: T } {
  return state.status === "success";
}

/**
 * Check if async operation failed
 */
export function isError<T, E = Error>(
  state: AsyncData<T, E>
): state is { status: "error"; error: E } {
  return state.status === "error";
}

/**
 * Type-safe check if a key exists in a map with defined value
 */
export function hasDefinedValue<K extends string, V>(
  map: Record<K, V | undefined>,
  key: K
): map is Record<K, V> & { [P in K]: V } {
  return map[key] !== undefined;
}

/**
 * Filter out undefined values from a map
 */
export function filterDefinedValues<K extends string, V>(
  map: Record<K, V | undefined>
): Record<K, V> {
  const result = {} as Record<K, V>;
  for (const [key, value] of Object.entries(map)) {
    if (value !== undefined) {
      result[key as K] = value as V;
    }
  }
  return result;
}

/**
 * Filter out null/undefined from arrays
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type-safe non-empty array check
 */
export function isNonEmptyArray<T>(arr: T[]): arr is [T, ...T[]] {
  return arr.length > 0;
}

export type Platform = "twitch" | "youtube" | "kick";

export function isPlatform(value: string): value is Platform {
  return ["twitch", "youtube", "kick"].includes(value);
}

export type EventType =
  | "season"
  | "league"
  | "wipe"
  | "patch"
  | "event"
  | "update";

export function isEventType(value: string): value is EventType {
  return ["season", "league", "wipe", "patch", "event", "update"].includes(
    value
  );
}
