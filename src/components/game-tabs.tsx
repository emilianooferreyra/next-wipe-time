"use client";

import { useState } from "react";
import type { GameId } from "@/types/game-ids";

export type Game = {
  id: GameId;
  name: string;
  accentColor: string;
  backgroundImage: string;
  hoverMedia?: string;
  hoverMediaType?: "video" | "gif";
};

const games: Game[] = [
  {
    id: "rust",
    name: "Rust",
    accentColor: "rgb(206, 106, 76)",
    backgroundImage: "/images/games/rust.jpg",
    hoverMedia: "/videos/games/rust.webm",
    hoverMediaType: "video",
  },
  {
    id: "tarkov",
    name: "Escape from Tarkov",
    accentColor: "rgb(155, 179, 96)",
    backgroundImage: "/images/games/tarkov.jpg",
    hoverMedia: "/videos/games/tarkov.webm",
    hoverMediaType: "video",
  },
  {
    id: "poe2",
    name: "Path of Exile 2",
    accentColor: "rgb(175, 96, 37)",
    backgroundImage: "/images/games/poe2.jpg",
    hoverMedia: "https://web.poecdn.com/video/poe2/FateoftheVaal/FotV_Transition.webm",
    hoverMediaType: "video",
  },
  {
    id: "poe",
    name: "Path of Exile",
    accentColor: "rgb(175, 96, 37)",
    backgroundImage: "/images/games/poe.jpg",
    hoverMedia: "/videos/games/poe.webm",
    hoverMediaType: "video",
  },
  {
    id: "fortnite",
    name: "Fortnite",
    accentColor: "rgb(0, 188, 242)",
    backgroundImage: "/images/games/fortnite.webp",
    hoverMedia: "/videos/games/fortnite.gif",
    hoverMediaType: "gif",
  },
  {
    id: "diablo4",
    name: "Diablo 4",
    accentColor: "rgb(139, 0, 0)",
    backgroundImage: "/images/games/diablo4.jpg",
    hoverMedia: "/videos/games/diablo4.mp4",
    hoverMediaType: "video",
  },
  {
    id: "pubg",
    name: "PUBG",
    accentColor: "rgb(244, 125, 0)",
    backgroundImage: "/images/games/pubg.webp",
    hoverMedia: "/videos/games/pubg.gif",
    hoverMediaType: "gif",
  },
];


type GameTabsProps = {
  onGameChange: (game: Game) => void;
};

export function GameTabs({ onGameChange }: GameTabsProps) {
  const [selectedGame, setSelectedGame] = useState<string>(games[0].id);

  const handleTabClick = (game: Game) => {
    setSelectedGame(game.id);
    onGameChange(game);
  };

  return (
    <div className="border-b border-white/10 bg-zinc-900/50 backdrop-blur-md">
      <nav
        className="flex gap-2 px-6 py-3 overflow-x-auto"
        aria-label="Game selection"
      >
        {games.map((game) => {
          const isSelected = selectedGame === game.id;
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => handleTabClick(game)}
              className={`group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-500 ${
                isSelected
                  ? "bg-zinc-800/80 text-zinc-50 ring-1 ring-white/20"
                  : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300"
              }`}
            >
              <div
                className={`w-8 h-8 rounded overflow-hidden transition-all duration-500 ${
                  isSelected ? "ring-2 ring-offset-2 ring-offset-zinc-900" : ""
                }`}
                style={{
                  ...(isSelected && {
                    boxShadow: `0 0 0 2px ${game.accentColor}`,
                  }),
                }}
              >
                <div
                  className="w-full h-full transition-all duration-500"
                  style={{
                    backgroundImage: `url('${game.backgroundImage}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: isSelected
                      ? "brightness(1.1)"
                      : "brightness(0.7) grayscale(0.5)",
                  }}
                />
              </div>

              {game.name}

              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-500 ease-out"
                style={{
                  backgroundColor: game.accentColor,
                  opacity: isSelected ? 1 : 0,
                  transform: isSelected ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin: "center",
                }}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export { games };
