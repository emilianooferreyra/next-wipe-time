"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GameDetailView } from "@/components/game-detail-view";
import { games } from "@/components/game-tabs";
import {
  getBaseGameIdForVersion,
  getGameVersion,
  getVersionsForGame,
} from "@/lib/games-config";
import { buildMediaItems } from "@/lib/scrapers/media-helpers";
import { getMockLiveStreams } from "@/lib/scrapers/stream-helpers";
import { useGamePageData } from "@/hooks/use-game-page-data";

type Props = {
  gameId: string;
};

export function GameDetailsClient({ gameId }: Props) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  const { wipeData, liveStreams } = useGamePageData(gameId);

  const baseGameId = getBaseGameIdForVersion(gameId);
  const game = games.find((g) => g.id === baseGameId);

  const versions = getVersionsForGame(baseGameId);
  const currentVersion = versions.find((v) => v.id === gameId);

  // Countdown timer — valid useEffect: manages a setInterval side effect
  useEffect(() => {
    if (!wipeData?.nextWipe) return;

    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft(gameId, wipeData));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [wipeData, gameId]);

  if (!game) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-50 mb-4">
            Game not found
          </h1>
          <Link href="/" className="text-[#FA5D29] hover:text-[#FA5D29]/80">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const displayImage = currentVersion?.image || game.backgroundImage;
  const displayGameName =
    currentVersion?.label || currentVersion?.shortLabel || game.name;

  const officialLinks = getOfficialLinks(gameId);
  const eventType = getEventTypeLabel(gameId);
  const eventTitle = getEventTitle(gameId, wipeData);
  const mediaItems = buildMediaItems(wipeData, displayImage);
  const displayStreams =
    liveStreams.length > 0 ? liveStreams : getMockLiveStreams(gameId);
  // previousSeasons lives in customData (not in WipeData schema core fields)
  const previousSeasons = (wipeData?.customData?.["previousSeasons"] as any[] | undefined) ?? [];

  return (
    <GameDetailView
      gameId={gameId}
      gameName={displayGameName}
      gameImage={displayImage}
      gameWebsite={officialLinks[0]?.url || "#"}
      gameDescription={getGameDescription(baseGameId)}
      wipeData={wipeData}
      eventType={eventType}
      eventTitle={eventTitle}
      timeLeft={timeLeft}
      mediaItems={mediaItems}
      liveStreams={displayStreams}
      officialLinks={officialLinks}
      previousSeasons={previousSeasons}
      versions={versions}
      currentVersionId={gameId}
      baseGameId={baseGameId}
    />
  );
}

function calculateTimeLeft(gameId: string, wipeData?: any): string {
  const targetDate = wipeData?.nextWipe ? new Date(wipeData.nextWipe) : null;
  if (!targetDate) return "No date";

  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    const eventType = getEventTypeLabel(gameId);
    return `${eventType} is LIVE!`;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function getEventTypeLabel(gameId: string): string {
  if (gameId.startsWith("diablo")) return "Season";
  if (gameId.startsWith("poe")) return "League";
  if (gameId === "fortnite") return "Season";
  if (gameId === "valorant") return "Act";
  if (gameId === "lol") return "Season";
  if (gameId === "tft") return "Set";
  if (gameId === "overwatch2") return "Season";
  if (gameId === "destiny2") return "Season";
  if (gameId === "r6siege") return "Season";
  if (gameId === "warframe") return "Update";
  return "Wipe";
}

function getEventTitle(gameId: string, wipeData: any): string {
  if (gameId === "poe" && wipeData?.eventType) {
    if (wipeData.eventType === "event") return "Active Event";
    if (wipeData.eventType === "patch") return "Latest Patch";
    return "Next League";
  }

  if (gameId === "poe2" && wipeData?.eventType) {
    if (wipeData.eventType === "league") return "Next League";
    if (wipeData.eventType === "patch") return "Next Patch";
    if (wipeData.eventType === "update") return "Next Update";
    if (wipeData.eventType === "event") return "Next Event";
    return "Next Patch";
  }

  if (gameId === "tft") {
    if (wipeData?.eventName) return `Next Set: ${wipeData.eventName}`;
    return "Next Set";
  }

  if (gameId.startsWith("poe")) return "Next League";
  if (gameId.startsWith("diablo")) return "Next Season";
  if (gameId === "lastepoch") return "Next Cycle";
  if (gameId === "deadlock") return "Next Patch";
  if (gameId === "fortnite") return "Next Season";
  if (gameId === "lol") return "Next Season";
  if (gameId === "valorant") return "Next Act";
  if (wipeData?.isRelease) return "Release Date";
  return "Next Wipe";
}

export function getGameDescription(gameId: string): string {
  const descriptions: Record<string, string> = {
    rust: "Rust is a multiplayer survival game where the only goal is to survive. Do whatever it takes to last another night.",
    tarkov:
      "Escape from Tarkov is a hardcore and realistic online first-person action RPG/Simulator with MMO features.",
    poe: "Path of Exile is a free-to-play action role-playing video game. Join thousands of players in an immersive, dark online world.",
    poe2: "Path of Exile 2 is the next generation ARPG from Grinding Gear Games. Currently in Early Access.",
    fortnite:
      "Fortnite is a free-to-play Battle Royale game with numerous game modes for every type of player.",
    diablo4:
      "Discover the critically acclaimed franchise that defined the Action RPG genre.",
    lastepoch:
      "Last Epoch combines time travel, exciting dungeon crawling, engrossing character customization and endless replayability.",
    valorant:
      "Valorant is a 5v5 character-based tactical shooter. Outwit, outplay, and outshine your competition.",
    lol: "League of Legends is a team-based strategy game where two teams of five powerful champions face off.",
    tft: "Teamfight Tactics is an auto battler game developed and published by Riot Games.",
    diablo3:
      "Diablo III is a dungeon crawler hack-and-slash action role-playing game.",
    diablo2:
      "Diablo II: Resurrected breathes new life into Blizzard Entertainment's acclaimed action RPG.",
    diabloimmortal:
      "Diablo Immortal is a free-to-play massively multiplayer online action role-playing game.",
  };
  return (
    descriptions[gameId] ||
    `Experience the ultimate competitive gaming experience in ${gameId}.`
  );
}

function getOfficialLinks(gameId: string): { label: string; url: string }[] {
  const links: Record<string, { label: string; url: string }[]> = {
    rust: [
      { label: "Official Website", url: "https://rust.facepunch.com/" },
      { label: "Reddit r/playrust", url: "https://reddit.com/r/playrust" },
      {
        label: "Steam News",
        url: "https://store.steampowered.com/news/app/252490",
      },
    ],
    tarkov: [
      { label: "Official Website", url: "https://www.escapefromtarkov.com/" },
      {
        label: "Reddit r/EscapefromTarkov",
        url: "https://reddit.com/r/EscapefromTarkov",
      },
      { label: "Official Twitter", url: "https://twitter.com/bstategames" },
    ],
    poe: [
      { label: "Official Website", url: "https://www.pathofexile.com/" },
      { label: "Official Forums", url: "https://www.pathofexile.com/forum" },
      {
        label: "Reddit r/pathofexile",
        url: "https://reddit.com/r/pathofexile",
      },
    ],
    poe2: [
      { label: "Path of Exile 2", url: "https://pathofexile2.com/" },
      { label: "Official News", url: "https://www.pathofexile.com/" },
      {
        label: "Patch Notes Forum",
        url: "https://www.pathofexile.com/forum/view-forum/2212",
      },
      {
        label: "Reddit r/PathOfExile2",
        url: "https://reddit.com/r/PathOfExile2",
      },
      { label: "PoE2DB Wiki", url: "https://poe2db.tw/us/" },
      { label: "Maxroll Guides", url: "https://maxroll.gg/poe2" },
    ],
    fortnite: [
      { label: "Official Website", url: "https://www.fortnite.com/" },
      { label: "Fortnite Status", url: "https://status.epicgames.com/" },
      { label: "Fortnite.GG", url: "https://fortnite.gg/" },
    ],
    deadlock: [
      {
        label: "Steam Page",
        url: "https://store.steampowered.com/app/1422450/Deadlock/",
      },
      {
        label: "Reddit r/DeadlockTheGame",
        url: "https://reddit.com/r/DeadlockTheGame",
      },
    ],
    diablo4: [
      { label: "Official Website", url: "https://diablo4.blizzard.com/en-us/" },
      {
        label: "Vessel of Hatred Expansion",
        url: "https://diablo4.blizzard.com/en-us/vessel-of-hatred",
      },
      {
        label: "Official News",
        url: "https://news.blizzard.com/en-us/diablo4",
      },
      { label: "Reddit r/diablo4", url: "https://reddit.com/r/diablo4" },
    ],
    diablo3: [
      { label: "Official Website", url: "https://diablo3.blizzard.com/es-mx/" },
      {
        label: "Official News",
        url: "https://news.blizzard.com/en-us/diablo3",
      },
      { label: "Reddit r/diablo3", url: "https://reddit.com/r/diablo3" },
    ],
    diablo2: [
      { label: "Official Website", url: "https://diablo2.blizzard.com/en-us/" },
      {
        label: "Season Information",
        url: "https://diablo2.blizzard.com/en-us/#season",
      },
      {
        label: "Official News",
        url: "https://news.blizzard.com/en-us/feed/diablo-2-resurrected",
      },
    ],
    diabloimmortal: [
      {
        label: "Official Website",
        url: "https://diabloimmortal.blizzard.com/es-es/",
      },
      {
        label: "Official News",
        url: "https://news.blizzard.com/en-us/diablo-immortal",
      },
      {
        label: "Reddit r/DiabloImmortal",
        url: "https://reddit.com/r/DiabloImmortal",
      },
    ],
    lastepoch: [
      { label: "Official Forums", url: "https://forum.lastepoch.com/" },
      { label: "Reddit r/LastEpoch", url: "https://reddit.com/r/LastEpoch" },
      {
        label: "Steam News",
        url: "https://store.steampowered.com/news/app/899770",
      },
    ],
    tft: [
      {
        label: "TFT Website",
        url: "https://teamfighttactics.leagueoflegends.com/",
      },
      {
        label: "Reddit r/TeamfightTactics",
        url: "https://reddit.com/r/TeamfightTactics",
      },
      { label: "TFT Meta", url: "https://tftactics.gg/" },
    ],
    lol: [
      { label: "League of Legends", url: "https://www.leagueoflegends.com/" },
      {
        label: "Patch Notes",
        url: "https://www.leagueoflegends.com/en-us/news/tags/patch-notes/",
      },
      {
        label: "Reddit r/leagueoflegends",
        url: "https://reddit.com/r/leagueoflegends",
      },
    ],
  };

  return links[gameId] || [];
}
