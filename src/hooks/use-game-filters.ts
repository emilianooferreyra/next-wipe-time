import { useMemo } from "react";
import { games } from "@/components/game-tabs";
import type { GameDataMap, FilterType, Game } from "@/types/game";

export function useGameFilters(
  gameData: GameDataMap,
  filter: FilterType
): Game[] {
  return useMemo(() => {
    return games
      .filter((game) => {
        const data = gameData[game.id];

        if (filter === "all") return true;

        if (filter === "confirmed") {
          return data?.confirmed === true;
        }

        if (filter === "estimated") {
          return data?.nextWipe && data?.confirmed === false;
        }

        if (
          filter === "soon" ||
          filter === "this-week" ||
          filter === "this-month"
        ) {
          if (!data?.nextWipe) return false;

          const now = new Date();
          const nextWipe = new Date(data.nextWipe);
          const diffMs = nextWipe.getTime() - now.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);

          if (filter === "soon") return diffDays <= 7;
          if (filter === "this-week") return diffDays <= 7;
          if (filter === "this-month") return diffDays <= 30;
        }

        return true;
      })
      .sort((a, b) => {
        const dataA = gameData[a.id];
        const dataB = gameData[b.id];

        if (!dataA?.nextWipe && !dataB?.nextWipe) return 0;
        if (!dataA?.nextWipe) return 1;
        if (!dataB?.nextWipe) return -1;

        const confirmedA = dataA?.confirmed !== false;
        const confirmedB = dataB?.confirmed !== false;

        if (confirmedA && !confirmedB) return -1;
        if (!confirmedA && confirmedB) return 1;

        const timeA = new Date(dataA.nextWipe).getTime();
        const timeB = new Date(dataB.nextWipe).getTime();

        return timeA - timeB;
      });
  }, [filter, gameData]);
}
