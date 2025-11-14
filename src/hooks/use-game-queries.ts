import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { games } from "@/components/game-tabs";
import { parseWipeData } from "@/schemas/wipe-data";
import type { GameDataMap, LoadingMap, WipeData } from "@/types/game";

export function useGameQueries() {
  const gameQueries = useQueries({
    queries: games.map((game) => ({
      queryKey: ["wipe", game.id],
      queryFn: async (): Promise<WipeData> => {
        const res = await fetch(`/api/wipes/${game.id}`, {
          cache: "no-store",
        });
        const data = await res.json();
        return parseWipeData(data);
      },
      staleTime: 0,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    })),
  });

  const gameData: GameDataMap = useMemo(
    () =>
      Object.fromEntries(games.map((game, i) => [game.id, gameQueries[i].data])),
    [gameQueries]
  );

  const loading: LoadingMap = useMemo(
    () =>
      Object.fromEntries(
        games.map((game, i) => [game.id, gameQueries[i].isLoading])
      ),
    [gameQueries]
  );

  return { gameData, loading };
}
