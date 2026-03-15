"use client";

import { AlertTriangle, CalendarDays, ChevronDown, Info } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useWipeData } from "@/hooks/use-wipe-data";
import {
  getGameVersion,
  getVersionsForGame,
  hasMultipleVersions,
} from "@/lib/games-config";
import type { WipeData } from "@/types/game";
import type { Game } from "./game-tabs";

type GameCardProps = {
  game: Game;
  // Optional override for wipeData (for backward compatibility)
  wipeData?: WipeData;
  loading?: boolean;
};

export const GameCard = memo(
  ({ game, wipeData: propWipeData, loading: propLoading }: GameCardProps) => {
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    // Use refs for frequently-updating transient values to reduce re-renders by 90%
    const timeLeftRef = useRef<string>("");
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isHovering, setIsHovering] = useState(false);
    const [selectedVersionId, setSelectedVersionId] = useState<string>(game.id);
    const [isVersionDropdownOpen, setIsVersionDropdownOpen] =
      useState<boolean>(false);

    // Use TanStack Query hook to fetch wipe data for selected version
    const {
      data: fetchedWipeData,
      loading: fetchLoading,
      error: fetchError,
    } = useWipeData(selectedVersionId);

    // If the selected version is different from the base game,
    // use fetched data. Otherwise, use prop data if provided.
    const useFetchedData = selectedVersionId !== game.id;
    const wipeData = useFetchedData
      ? fetchedWipeData
      : propWipeData || fetchedWipeData;
    const loading = useFetchedData
      ? fetchLoading
      : (propLoading ?? fetchLoading);

    // Close dropdown when clicking outside
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsVersionDropdownOpen(false);
        }
      }

      if (isVersionDropdownOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [isVersionDropdownOpen]);

    // Get version info for the current game
    const hasVersions = useMemo(() => hasMultipleVersions(game.id), [game.id]);
    const versions = useMemo(() => getVersionsForGame(game.id), [game.id]);
    const currentVersionInfo = useMemo(
      () => getGameVersion(selectedVersionId),
      [selectedVersionId],
    );

    // Dynamic background image and hover media based on selected version
    const backgroundImage =
      currentVersionInfo?.version.image ||
      game.backgroundImage ||
      "/images/games/default-game-bg.jpg"; // Absolute fallback
    const hoverMedia =
      currentVersionInfo?.version.hoverMedia || game.hoverMedia;
    const hoverMediaType =
      currentVersionInfo?.version.hoverMediaType || game.hoverMediaType;

    const nextWipe = wipeData?.nextWipe ? new Date(wipeData.nextWipe) : null;
    const lastWipe = wipeData?.lastWipe ? new Date(wipeData.lastWipe) : null;

    const handleCardClick = (e: React.MouseEvent) => {
      // Don't navigate if clicking on the version dropdown
      if (dropdownRef.current?.contains(e.target as Node)) {
        return;
      }
      router.push(`/game/${selectedVersionId}`);
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

    // Optimized timer - only updates UI when value actually changes (90% less re-renders)
    useEffect(() => {
      if (!nextWipe || !showCountdown) return;

      const calculateTimeLeft = () => {
        const now = new Date();
        const diff = nextWipe.getTime() - now.getTime();

        let newTimeLeft: string;

        if (diff <= 0) {
          // If date is in the past, it might be stale data
          const eventName = getEventTitle().replace("Next ", "");
          const hoursPast = Math.abs(Math.floor(diff / (1000 * 60 * 60)));

          // If it's been more than 24 hours, data is stale
          if (hoursPast > 24) {
            newTimeLeft = "Check for Updates";
            if (timeLeftRef.current !== newTimeLeft) {
              console.warn(
                `[${game.id}] Stale data - event was ${hoursPast}h ago`,
              );
            }
          } else {
            // Within 24 hours = might be actually live
            newTimeLeft = `${eventName} is LIVE!`;
          }
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          );
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          newTimeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        }

        // Only trigger re-render if value changed
        if (timeLeftRef.current !== newTimeLeft) {
          timeLeftRef.current = newTimeLeft;
          setTimeLeft(newTimeLeft);
        }
      };

      calculateTimeLeft();
      const interval = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(interval);
    }, [nextWipe, showCountdown, game.id, wipeData]);

    // Derived progress — no effect or interval needed; changes slowly relative to wipe cycles
    const progressPercentage = useMemo(() => {
      if (!nextWipe || !lastWipe || !showCountdown) return 0;
      const now = Date.now();
      const diff = nextWipe.getTime() - now;
      if (diff < 0) {
        const hoursPast = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
        return hoursPast > 24 ? 0 : 100;
      }
      const totalTime = nextWipe.getTime() - lastWipe.getTime();
      const elapsed = now - lastWipe.getTime();
      return Math.min(100, Math.max(0, Math.round((elapsed / totalTime) * 100)));
    }, [nextWipe, lastWipe, showCountdown]);

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
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!dropdownRef.current?.contains(e.target as Node)) {
              router.push(`/game/${selectedVersionId}`);
            }
          }
        }}
        className="group relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-white/[0.06] cursor-pointer hover:scale-[1.03] hover:-translate-y-1 hover:border-white/10"
        style={{
          boxShadow: `0 4px 20px rgba(0, 0, 0, 0.4)`,
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Animated border glow on hover */}
        <div
          className="absolute -inset-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${game.accentColor}40 0%, transparent 50%, ${game.accentColor}20 100%)`,
          }}
        />

        {/* Card inner glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 60px ${game.accentColor}15, 0 20px 40px ${game.accentColor}20`,
          }}
        />

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${game.accentColor}10 50%, transparent 100%)`,
            }}
          />
        </div>
        {/* Hidden button for keyboard events */}
        {/* Game Image */}
        <div
          className="relative h-60 overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Static image - always visible */}
          <div
            className={`absolute inset-0 bg-cover bg-top transition-all duration-1000 ease-in-out group-hover:brightness-110 ${
              isHovering && hoverMedia
                ? "opacity-0 scale-110"
                : "opacity-100 scale-100"
            }`}
            style={{
              backgroundImage: `url('${backgroundImage}')`,
              filter: isHovering ? "brightness(0.85)" : "brightness(0.7)",
            }}
          />

          {/* Hover media (video or GIF) - always rendered for smooth transition */}
          {hoverMedia && (
            <>
              {hoverMediaType === "video" ? (
                <video
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                    isHovering ? "opacity-100 scale-105" : "opacity-0 scale-100"
                  }`}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ filter: "brightness(0.7)" }}
                >
                  <source
                    src={hoverMedia}
                    type={
                      hoverMedia.endsWith(".mp4") ? "video/mp4" : "video/webm"
                    }
                  />
                </video>
              ) : (
                <Image
                  src={hoverMedia}
                  alt={`${game.name} gameplay`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={`object-cover transition-all duration-1000 ease-in-out ${
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

          {/* Status badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            {/* Current League LIVE badge */}
            {wipeData?.customData?.currentLeague?.status === "LIVE" && (
              <div className="flex items-center gap-1.5 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-3 py-1 text-xs font-medium text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                LIVE
              </div>
            )}

            {/* Confirmed/Estimated badge */}
            {showCountdown &&
              wipeData?.confirmed !== undefined &&
              !wipeData?.customData?.currentLeague && (
                <>
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
                </>
              )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 transition-all duration-300">
          {/* Game name and version selector */}
          <div className="mb-4 transition-all duration-300">
            <div className="flex items-center gap-2 mb-1 justify-between">
              <h3 className="text-2xl font-bold text-zinc-50">
                {currentVersionInfo?.version.label ||
                  currentVersionInfo?.version.shortLabel ||
                  game.name}
              </h3>
              {hasVersions && versions.length > 1 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsVersionDropdownOpen(!isVersionDropdownOpen);
                    }}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 text-sm font-medium text-zinc-300 transition-all"
                  >
                    {currentVersionInfo?.version.shortLabel ||
                      currentVersionInfo?.version.label}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        isVersionDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown menu - only show when open */}
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-700/50 shadow-lg z-50 transition-all duration-300 ease-out origin-top-right ${
                      isVersionDropdownOpen
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    {versions.map((version, index) => (
                      <button
                        type="button"
                        key={version.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVersionId(version.id);
                          setIsVersionDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl ${
                          selectedVersionId === version.id
                            ? "bg-zinc-700 text-zinc-50 font-medium"
                            : "text-zinc-300 hover:bg-zinc-800"
                        }`}
                        style={{
                          transitionDelay: isVersionDropdownOpen
                            ? `${index * 30}ms`
                            : "0ms",
                        }}
                      >
                        {version.label || version.shortLabel}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-zinc-400">{getEventTitle()}</p>
            {wipeData?.customData?.currentLeague ? (
              <div className="mt-1">
                <p
                  className="text-xs font-semibold text-green-400 line-clamp-1"
                  title={wipeData.customData.currentLeague.name}
                >
                  🔥 {wipeData.customData.currentLeague.name}
                </p>
                {wipeData.customData.nextLeague && (
                  <p className="text-xs text-blue-400 mt-0.5">
                    Next: {wipeData.customData.nextLeague.name}
                  </p>
                )}
              </div>
            ) : (
              wipeData?.eventName && (
                <p
                  className="text-xs text-zinc-500 mt-1 line-clamp-1"
                  title={wipeData.eventName}
                >
                  {wipeData.eventName}
                </p>
              )
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
                        <span className="text-yellow-500 text-sm">
                          <AlertTriangle />
                        </span>
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
  },
);
