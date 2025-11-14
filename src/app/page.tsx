"use client";

import { useState } from "react";
import { useGameQueries } from "@/hooks/use-game-queries";
import { useGameFilters } from "@/hooks/use-game-filters";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import { GameFilters } from "./_components/game-filters";
import { GameGrid } from "./_components/game-grid";
import type { FilterType } from "@/types/game";

export default function Home() {
  const [filter, setFilter] = useState<FilterType>("all");
  const { gameData, loading } = useGameQueries();
  const filteredGames = useGameFilters(gameData, filter);

  return (
    <div className="relative min-h-screen font-sans bg-[#1a1f2e]">
      <Header />
      <GameFilters
        filter={filter}
        onFilterChange={setFilter}
        gameData={gameData}
      />

      <main className="relative mx-auto max-w-7xl px-6 py-12">
        <GameGrid games={filteredGames} gameData={gameData} loading={loading} />
      </main>

      <Footer />
    </div>
  );
}
