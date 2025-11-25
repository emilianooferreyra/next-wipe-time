"use client";

import { useQuery } from "@tanstack/react-query";
import { parseWipeData } from "@/schemas/wipe-data";
import type { WipeData } from "@/types/game";

/**
 * Fetch wipe data for a specific game version
 * Uses TanStack Query for caching, refetching, and state management
 *
 * @param gameId - The game version ID (e.g., "diablo-iv", "poe2")
 * @returns Query result with data, isLoading, isError, error
 */
export function useWipeData(gameId: string | null) {
  const { data, isLoading, isError, error } = useQuery<WipeData | null>({
    queryKey: ["wipe", gameId],
    queryFn: async () => {
      if (!gameId) return null;

      const res = await fetch(`/api/wipes/${gameId}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch wipe data for ${gameId}`);
      }

      const data = await res.json();
      return parseWipeData(data);
    },
    enabled: !!gameId, // Don't fetch if gameId is null/undefined
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
