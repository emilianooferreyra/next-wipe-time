"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { games } from "@/components/game-tabs";
import { MoveLeft, MoveRight } from "lucide-react";

export default function GameDetailsPage() {
  const params = useParams();
  const gameId = params.id as string;

  const [wipeData, setWipeData] = useState<any>(null);
  const [, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>("");

  const game = games.find((g) => g.id === gameId);

  useEffect(() => {
    if (!game) return;

    fetch(`/api/wipes/${gameId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log(`[${gameId}] Fetched data:`, data);
        setWipeData(data);
      })
      .catch((err) => {
        console.error(`Error fetching ${gameId}:`, err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [gameId, game]);

  // Update countdown every second
  useEffect(() => {
    if (!wipeData?.nextWipe) return;

    const updateCountdown = () => {
      const nextWipe = new Date(wipeData.nextWipe);
      setTimeLeft(calculateTimeLeft(nextWipe, game?.id, wipeData));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [wipeData]);

  if (!game) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
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

  const nextWipe = wipeData?.nextWipe ? new Date(wipeData.nextWipe) : null;
  const lastWipe = wipeData?.lastWipe ? new Date(wipeData.lastWipe) : null;

  console.log(`[${gameId}] wipeData:`, wipeData);
  console.log(`[${gameId}] nextWipe:`, nextWipe);
  console.log(`[${gameId}] confirmed:`, wipeData?.confirmed);

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
      {/* Hero section with game background */}
      <div className="relative h-[400px] overflow-hidden">
        {/* Background image/video */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${game.backgroundImage}')`,
            filter: "brightness(0.4)",
          }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, #1a1f2e 100%)`,
          }}
        />

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-300 transition-colors mb-8 w-fit"
          >
            <MoveLeft /> Back to all games
          </Link>

          <div className="flex items-end gap-4">
            <h1 className="text-5xl font-bold text-zinc-50">{game.name}</h1>
            {game.id === "deadlock" && (
              <span className="inline-flex items-center px-3 py-1 rounded text-sm font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-2">
                BETA
              </span>
            )}
          </div>

          {wipeData?.confirmed !== undefined && (
            <div className="mt-4 inline-flex w-fit">
              {wipeData.confirmed ? (
                <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-2 text-sm font-medium text-green-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  CONFIRMED
                </div>
              ) : (
                <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full px-4 py-2 text-sm font-medium text-yellow-400">
                  ESTIMATED
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Main info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Countdown section */}
            {nextWipe && (
              <div className="bg-[#242938]/50 border border-white/5 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-zinc-50 mb-6">
                  {getEventTitle(game.id, wipeData)}
                </h2>

                <div
                  className="text-6xl font-bold mb-4"
                  style={{ color: game.accentColor }}
                >
                  {timeLeft || "Calculating..."}
                </div>

                <div className="text-zinc-400 mb-6">
                  {nextWipe.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                {lastWipe && (
                  <div className="pt-4 border-t border-white/5">
                    <span className="text-sm text-zinc-500">
                      Last event:{" "}
                      {lastWipe.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Special Events section */}
            {wipeData?.specialEvents && wipeData.specialEvents.length > 0 && (
              <div className="bg-[#242938]/50 border border-white/5 rounded-xl p-8">
                <h2 className="text-xl font-bold text-zinc-50 mb-4">
                  Upcoming Events
                </h2>
                <div className="space-y-4">
                  {wipeData.specialEvents.map((event: any, idx: number) => {
                    const eventDate = new Date(event.date);
                    const now = new Date();
                    const isPast = eventDate < now;
                    const isToday =
                      eventDate.toDateString() === now.toDateString();

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-4 p-4 rounded-lg border ${
                          isPast
                            ? "bg-zinc-800/30 border-zinc-700/50"
                            : isToday
                            ? "bg-green-500/10 border-green-500/30"
                            : "bg-blue-500/10 border-blue-500/30"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {event.type === "reveal" && (
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                              🎭
                            </div>
                          )}
                          {event.type === "beta" && (
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                              🧪
                            </div>
                          )}
                          {event.type === "tournament" && (
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                              🏆
                            </div>
                          )}
                          {event.type === "announcement" && (
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                              📢
                            </div>
                          )}
                          {event.type === "teaser" && (
                            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
                              👀
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-zinc-200 mb-1">
                            {event.name}
                          </h3>
                          {event.description && (
                            <p className="text-sm text-zinc-400 mb-2">
                              {event.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">
                              {eventDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isToday && (
                              <span className="text-xs font-semibold text-green-400">
                                • TODAY
                              </span>
                            )}
                            {isPast && (
                              <span className="text-xs text-zinc-600">
                                • Past
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {wipeData?.announcement && (
              <div className="bg-[#242938]/50 border border-white/5 rounded-xl p-8">
                <h2 className="text-xl font-bold text-zinc-50 mb-4">
                  Latest Update
                </h2>
                <p className="text-zinc-300 leading-relaxed">
                  {wipeData.announcement}
                </p>
              </div>
            )}

            <div className="bg-[#242938]/50 border border-white/5 rounded-xl p-8">
              <h2 className="text-xl font-bold text-zinc-50 mb-4">
                What's Coming
              </h2>
              <div className="text-zinc-400 space-y-4">
                <p>
                  Detailed patch notes and season information will be displayed
                  here once available from official sources.
                </p>
                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-sm font-semibold text-zinc-300 mb-2">
                    Check official sources:
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {getOfficialLinks(game.id).map((link) => (
                      <li key={link.url}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FA5D29] hover:text-[#FA5D29]/80 transition-colors inline-flex items-center gap-1"
                        >
                          {link.label}
                          <MoveRight className="w-4 h-4" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#242938]/50 border border-white/5 rounded-xl p-6">
              <h3 className="text-lg font-bold text-zinc-50 mb-4">
                Quick Info
              </h3>
              <dl className="space-y-3 text-sm">
                {wipeData?.frequency && (
                  <>
                    <dt className="text-zinc-500">Frequency</dt>
                    <dd className="text-zinc-300 font-medium">
                      {wipeData.frequency}
                    </dd>
                  </>
                )}
                {wipeData?.source && (
                  <>
                    <dt className="text-zinc-500 mt-3">Source</dt>
                    <dd className="text-zinc-300 font-medium">
                      {wipeData.source}
                    </dd>
                  </>
                )}
                {wipeData?.scrapedAt && (
                  <>
                    <dt className="text-zinc-500 mt-3">Last Updated</dt>
                    <dd className="text-zinc-300 font-medium">
                      {new Date(wipeData.scrapedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </dd>
                  </>
                )}
              </dl>
            </div>

            <div className="bg-[#242938]/50 border border-white/5 rounded-xl overflow-hidden">
              <img
                src={game.backgroundImage}
                alt={game.name}
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateTimeLeft(
  targetDate: Date,
  gameId?: string,
  wipeData?: any
): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    const eventType =
      gameId === "poe"
        ? wipeData?.eventType === "event"
          ? "Event"
          : wipeData?.eventType === "patch"
          ? "Patch"
          : "League"
        : gameId === "poe2"
        ? wipeData?.eventType === "league"
          ? "League"
          : wipeData?.eventType === "patch"
          ? "Patch"
          : "Update"
        : gameId === "diablo4"
        ? "Season"
        : gameId === "lastepoch"
        ? "Cycle"
        : gameId === "fortnite"
        ? "Season"
        : gameId === "valorant"
        ? "Act"
        : gameId === "lol"
        ? "Season"
        : gameId === "tft"
        ? "Set"
        : gameId === "overwatch2"
        ? "Season"
        : gameId === "destiny2"
        ? "Season"
        : gameId === "r6siege"
        ? "Season"
        : gameId === "warframe"
        ? "Update"
        : gameId === "deadlock"
        ? "Patch"
        : "Wipe";

    return `${eventType} is LIVE!`;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
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

  if (gameId === "poe") return "Next League";
  if (gameId === "diablo4") return "Next Season";
  if (gameId === "lastepoch") return "Next Cycle";
  if (gameId === "deadlock") return "Next Patch";
  if (gameId === "fortnite") return "Next Season";
  if (gameId === "lol") return "Next Season";
  if (gameId === "valorant") return "Next Act";
  if (wipeData?.isRelease) return "Release Date";
  return "Next Wipe";
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
      { label: "Official Website", url: "https://diablo4.blizzard.com/" },
      {
        label: "Official News",
        url: "https://news.blizzard.com/en-us/diablo4",
      },
      { label: "Reddit r/diablo4", url: "https://reddit.com/r/diablo4" },
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
