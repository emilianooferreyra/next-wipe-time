"use client";

import { useState } from "react";

export type Game = {
  id: string;
  name: string;
  accentColor: string;
  backgroundImage: string;
  hoverMedia?: string; // URL to video or GIF for hover effect
  hoverMediaType?: "video" | "gif"; // Type of media
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
    id: "lastepoch",
    name: "Last Epoch",
    accentColor: "rgb(138, 43, 226)",
    backgroundImage: "/images/games/lastepoch.jpg",
    hoverMedia: "/videos/games/lastepoch.webm",
    hoverMediaType: "video",
  },
  {
    id: "valorant",
    name: "Valorant",
    accentColor: "rgb(255, 70, 85)",
    backgroundImage: "/images/games/valorant.png",
    hoverMedia: "/videos/games/valorant.mp4",
    hoverMediaType: "video",
  },
  {
    id: "lol",
    name: "League of Legends",
    accentColor: "rgb(200, 155, 60)",
    backgroundImage: "/images/games/lol.avif",
    hoverMedia: "/videos/games/lol.webm",
    hoverMediaType: "video",
  },
  {
    id: "tft",
    name: "Teamfight Tactics",
    accentColor: "rgb(72, 112, 255)",
    backgroundImage: "/images/games/tft.avif",
    hoverMedia: "/videos/games/tft.webm",
    hoverMediaType: "video",
  },
  {
    id: "apex",
    name: "Apex Legends",
    accentColor: "rgb(220, 53, 69)",
    backgroundImage: "/images/games/apex.jpg",
    hoverMedia: "/videos/games/apex.mp4",
    hoverMediaType: "video",
  },
  {
    id: "cod",
    name: "Call of Duty",
    accentColor: "rgb(0, 255, 0)",
    backgroundImage: "/images/games/cod.jpg",
    hoverMedia: "/videos/games/cod.gif",
    hoverMediaType: "gif",
  },
  {
    id: "rocketleague",
    name: "Rocket League",
    accentColor: "rgb(0, 121, 255)",
    backgroundImage: "/images/games/rocket-league.webp",
    hoverMedia: "/videos/games/rocker-league.mp4",
    hoverMediaType: "video",
  },
  {
    id: "dbd",
    name: "Dead by Daylight",
    accentColor: "rgb(139, 0, 0)",
    backgroundImage: "/images/games/dbd.jpg",
    hoverMedia: "/videos/games/dbd.webm",
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
  {
    id: "overwatch2",
    name: "Overwatch 2",
    accentColor: "rgb(249, 147, 25)",
    backgroundImage: "/images/games/overwatch2.webp",
    hoverMedia: "/videos/games/overwatch2.gif",
    hoverMediaType: "gif",
  },
  {
    id: "destiny2",
    name: "Destiny 2",
    accentColor: "rgb(255, 255, 255)",
    backgroundImage: "/images/games/destiny2.jpg",
    hoverMedia: "/videos/games/destiny2.webp",
    hoverMediaType: "gif",
  },
  {
    id: "r6siege",
    name: "Rainbow Six Siege",
    accentColor: "rgb(211, 176, 99)",
    backgroundImage: "/images/games/r6siege.jpg",
    hoverMedia: "/videos/games/r6siege.webm",
    hoverMediaType: "video",
  },
  {
    id: "poe2",
    name: "Path of Exile 2",
    accentColor: "rgb(170, 117, 76)",
    backgroundImage: "/images/games/poe2.jpg",
    hoverMedia: "/videos/games/poe2.webm",
    hoverMediaType: "video",
  },
  {
    id: "warframe",
    name: "Warframe",
    accentColor: "rgb(0, 147, 208)",
    backgroundImage: "/images/games/warframe.jpg",
    hoverMedia: "/videos/games/warframe.webm",
    hoverMediaType: "video",
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
              className={`group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-zinc-800/80 text-zinc-50 ring-1 ring-white/20"
                  : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300"
              }`}
            >
              <div
                className={`w-8 h-8 rounded overflow-hidden transition-all duration-200 ${
                  isSelected ? "ring-2 ring-offset-2 ring-offset-zinc-900" : ""
                }`}
                style={{
                  ...(isSelected && {
                    boxShadow: `0 0 0 2px ${game.accentColor}`,
                  }),
                }}
              >
                <div
                  className="w-full h-full transition-all duration-200"
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

              {isSelected && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ backgroundColor: game.accentColor }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export { games };
