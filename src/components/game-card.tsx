"use client";

import { useState, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, Info } from "lucide-react";
import type { Game } from "./game-tabs";
import type { WipeData } from "@/types/game";

type GameCardProps = {
  game: Game;
  wipeData?: WipeData;
  loading?: boolean;
};

export const GameCard = memo(
  ({ game, wipeData, loading }: GameCardProps) => {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [progressPercentage, setProgressPercentage] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    const nextWipe = wipeData?.nextWipe ? new Date(wipeData.nextWipe) : null;
    const lastWipe = wipeData?.lastWipe ? new Date(wipeData.lastWipe) : null;

    const handleCardClick = () => {
      router.push(`/game/${game.id}`);
    };

    // Determine if countdown should show
    const shouldShowCountdown = () => {
      if (!nextWipe) return false;

      // Only these games can have unconfirmed dates that shouldn't show countdown
      const gamesWithConfirmationCheck = [
        "poe",
        "tarkov",
        "diablo4",
        "lastepoch",
      ];

      if (gamesWithConfirmationCheck.includes(game.id)) {
        if (wipeData?.confirmed === false) {
          return false;
        }
      }

      return true;
    };

    const showCountdown = shouldShowCountdown();

    // Calculate time left
    useEffect(() => {
      if (!nextWipe || !showCountdown) return;

      const calculateTimeLeft = () => {
        const now = new Date();
        const diff = nextWipe.getTime() - now.getTime();

        if (diff <= 0) {
          // If date is in the past, it might be stale data
          const eventName = getEventTitle().replace("Next ", "");
          const hoursPast = Math.abs(Math.floor(diff / (1000 * 60 * 60)));

          // If it's been more than 24 hours, data is stale
          if (hoursPast > 24) {
            setTimeLeft("Check for Updates");
            console.warn(
              `[${game.id}] Stale data - event was ${hoursPast}h ago`
            );
          } else {
            // Within 24 hours = might be actually live
            setTimeLeft(`${eventName} is LIVE!`);
          }
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(interval);
    }, [nextWipe, showCountdown, game.id, wipeData]);

    // Calculate progress
    useEffect(() => {
      if (!nextWipe || !lastWipe || !showCountdown) {
        setProgressPercentage(0);
        return;
      }

      const calculateProgress = () => {
        const now = Date.now();
        const diff = nextWipe.getTime() - now;

        // If date is stale (more than 24 hours in past), reset progress
        if (diff < 0) {
          const hoursPast = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
          if (hoursPast > 24) {
            setProgressPercentage(0);
            console.warn(`[${game.id}] Stale data - resetting progress bar`);
            return;
          }
          // Within 24 hours = actually live, show 100%
          setProgressPercentage(100);
          return;
        }

        const totalTime = nextWipe.getTime() - lastWipe.getTime();
        const elapsed = now - lastWipe.getTime();

        const progress = Math.min(
          100,
          Math.max(0, Math.round((elapsed / totalTime) * 100))
        );
        setProgressPercentage(progress);
      };

      calculateProgress();
      const interval = setInterval(calculateProgress, 60000);
      return () => clearInterval(interval);
    }, [nextWipe, lastWipe, showCountdown, game.id]);

    const getEventTitle = () => {
      // PoE2 uses dynamic event types
      if (game.id === "poe2" && wipeData?.eventType) {
        switch (wipeData.eventType) {
          case "league":
            return "Next League";
          case "patch":
            return "Next Patch";
          case "update":
            return "Next Update";
          case "event":
            return "Next Event";
          default:
            return "Next Patch";
        }
      }

      // PoE also can have dynamic event types (league, patch, or special event)
      if (game.id === "poe" && wipeData?.eventType) {
        if (wipeData.eventType === "event") {
          return "Active Event";
        }
        if (wipeData.eventType === "patch") {
          return "Latest Patch";
        }
        return "Next League";
      }

      // Other games use static titles
      if (game.id === "poe") return "Next League";
      if (game.id === "diablo4") return "Next Season";
      if (game.id === "lastepoch") return "Next Cycle";
      if (game.id === "fortnite") return "Next Season";
      if (game.id === "valorant") return "Next Act";
      if (game.id === "lol") return "Next Season";
      if (game.id === "tft") return "Next Set";
      if (game.id === "overwatch2") return "Next Season";
      if (game.id === "destiny2") return "Next Season";
      if (game.id === "r6siege") return "Next Season";
      if (game.id === "warframe") return "Next Update";
      if (wipeData?.isRelease) return "Release";
      return "Next Wipe";
    };

    const isRiotGame = ["valorant", "lol", "tft"].includes(game.id);

    return (
      <div
        onClick={handleCardClick}
        className="group relative rounded-xl overflow-hidden bg-[#242938] border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
        style={{
          boxShadow: `0 4px 20px ${game.accentColor}10`,
        }}
      >
        {/* Game Image */}
        <div
          className="relative h-48 overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Static image - always visible */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out ${
              isHovering && game.hoverMedia
                ? "opacity-0 scale-110"
                : "opacity-100 scale-100"
            }`}
            style={{
              backgroundImage: `url('${game.backgroundImage}')`,
              filter: "brightness(0.7)",
            }}
          />

          {/* Hover media (video or GIF) - always rendered for smooth transition */}
          {game.hoverMedia && (
            <>
              {game.hoverMediaType === "video" ? (
                <video
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                    isHovering ? "opacity-100 scale-105" : "opacity-0 scale-100"
                  }`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ filter: "brightness(0.7)" }}
                >
                  <source
                    src={game.hoverMedia}
                    type={
                      game.hoverMedia.endsWith(".mp4")
                        ? "video/mp4"
                        : "video/webm"
                    }
                  />
                </video>
              ) : (
                <img
                  src={game.hoverMedia}
                  alt={`${game.name} gameplay`}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                    isHovering ? "opacity-100 scale-105" : "opacity-0 scale-100"
                  }`}
                  style={{ filter: "brightness(0.7)" }}
                />
              )}
            </>
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, transparent 0%, ${game.accentColor}20 50%, #242938 100%)`,
            }}
          />

          {/* Status badge */}
          {showCountdown && wipeData?.confirmed !== undefined && (
            <div className="absolute top-3 right-3">
              {wipeData.confirmed ? (
                <div className="flex items-center gap-1.5 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-3 py-1 text-xs font-medium text-green-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  CONFIRMED
                </div>
              ) : (
                <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full px-3 py-1 text-xs font-medium text-yellow-400">
                  ESTIMATED
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Game name and event type */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-zinc-50">{game.name}</h3>
            </div>
            <p className="text-sm text-zinc-400">{getEventTitle()}</p>
            {wipeData?.eventName && (
              <p
                className="text-xs text-zinc-500 mt-1 line-clamp-1"
                title={wipeData.eventName}
              >
                {wipeData.eventName}
              </p>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div
                role="status"
                className="h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
              />
            </div>
          )}

          {!loading && showCountdown && nextWipe && (
            <>
              {/* Countdown */}
              <div className="mb-4">
                <div
                  className="text-4xl font-bold mb-2 transition-colors"
                  style={{ color: game.accentColor }}
                >
                  {timeLeft || "Calculating..."}
                </div>
                <div className="text-xs text-zinc-500">
                  {nextWipe.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-2.5 bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-700/50">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercentage}%`,
                      backgroundColor: game.accentColor,
                      boxShadow: `0 0 10px ${game.accentColor}50`,
                    }}
                  />
                </div>
                <div className="text-xs text-zinc-500 mt-1.5 flex justify-between">
                  <span>Progress</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
              </div>

              {/* Last wipe info and frequency */}
              <div className="space-y-1">
                {lastWipe && (
                  <div className="text-xs text-zinc-500">
                    Last:{" "}
                    {lastWipe.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                )}
                {wipeData?.frequency && (
                  <div className="text-xs text-zinc-500">
                    Frequency: {wipeData.frequency}
                  </div>
                )}
              </div>

              {/* Announcement section */}
              {wipeData?.announcement && (
                <div
                  className={`mt-4 p-3 rounded-lg ${
                    wipeData.confirmed
                      ? "bg-blue-500/5 border border-blue-500/20"
                      : "bg-yellow-500/5 border border-yellow-500/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`text-sm ${
                        wipeData.confirmed ? "text-blue-400" : "text-yellow-500"
                      }`}
                    >
                      {wipeData.confirmed ? <Info /> : <AlertTriangle />}
                    </span>
                    <div className="flex-1">
                      <p
                        className={`text-xs font-medium mb-1 ${
                          wipeData.confirmed
                            ? "text-blue-400/90"
                            : "text-yellow-500/90"
                        }`}
                      >
                        {wipeData.confirmed
                          ? "Latest Info"
                          : "Estimated Date Info"}
                      </p>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {wipeData.announcement}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !showCountdown && (
            <div className="py-6">
              {isRiotGame ? (
                <div className="text-center">
                  <div className="text-4xl mb-3">🚀</div>
                  <p className="text-sm font-semibold text-zinc-300 mb-1">
                    Coming Soon
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Season tracking coming soon
                  </p>
                </div>
              ) : wipeData?.nextWipe && wipeData?.confirmed === false ? (
                // Has estimated data but not confirmed
                <>
                  <div className="text-center mb-4">
                    <div className="flex justify-center mb-2">
                      <CalendarDays className="w-10 h-10 text-zinc-400" />
                    </div>
                    <p className="text-sm text-zinc-400 mb-1">Estimated Date</p>
                    <p className="text-lg font-semibold text-zinc-300">
                      {new Date(wipeData.nextWipe).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Frequency */}
                  {wipeData?.frequency && (
                    <div className="text-xs text-zinc-500 text-center mb-3">
                      Frequency: {wipeData.frequency}
                    </div>
                  )}

                  {/* Last wipe */}
                  {wipeData?.lastWipe && (
                    <div className="text-xs text-zinc-500 text-center mb-4">
                      Last:{" "}
                      {new Date(wipeData.lastWipe).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  )}

                  {/* Announcement */}
                  {wipeData?.announcement && (
                    <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-500 text-sm">⚠️</span>
                        <div className="flex-1">
                          <p className="text-xs text-yellow-500/90 font-medium mb-1">
                            Estimated Date Info
                          </p>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {wipeData.announcement}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // No data at all
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <CalendarDays className="w-10 h-10 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-400">No official date yet</p>
                  <p className="text-xs text-zinc-600 mt-1">Check back soon</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for optimal memoization
    return (
      prevProps.game.id === nextProps.game.id &&
      prevProps.wipeData?.nextWipe === nextProps.wipeData?.nextWipe &&
      prevProps.wipeData?.confirmed === nextProps.wipeData?.confirmed &&
      prevProps.loading === nextProps.loading
    );
  }
);
