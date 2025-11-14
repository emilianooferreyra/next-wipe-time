import { GameCard } from "@/components/game-card";
import type { Game, GameDataMap, LoadingMap } from "@/types/game";

type GameGridProps = {
  games: Game[];
  gameData: GameDataMap;
  loading: LoadingMap;
};

export function GameGrid({ games, gameData, loading }: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-zinc-300 mb-2">
          No games found
        </h3>
        <p className="text-zinc-500">Try changing your filter selection</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          wipeData={gameData[game.id]}
          loading={loading[game.id]}
        />
      ))}
    </div>
  );
}
