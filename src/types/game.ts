import type { WipeData } from "@/schemas/wipe-data";

// Re-export WipeData for convenience
export type { WipeData };

export interface Game {
  id: string;
  name: string;
  accentColor: string;
  backgroundImage: string;
  hoverMedia?: string;
  hoverMediaType?: "video" | "gif";
}

export type GameDataMap = Record<string, WipeData | undefined>;
export type LoadingMap = Record<string, boolean>;

export const FILTERS = {
  ALL: "all",
  CONFIRMED: "confirmed",
  ESTIMATED: "estimated",
  SOON: "soon",
  THIS_WEEK: "this-week",
  THIS_MONTH: "this-month",
} as const;

export type FilterType = (typeof FILTERS)[keyof typeof FILTERS];

export interface FilterConfig {
  id: FilterType;
  label: string;
  icon: string;
  count?: number;
}
