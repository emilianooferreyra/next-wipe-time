"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { EventCalendar } from "@/components/event-calendar";
import type { GameEvent } from "@/lib/events/types";

export default function CalendarPage() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);

        // Fetch data from all game APIs
        const games = [
          "rust",
          "tarkov",
          "poe",
          "fortnite",
          "diablo4",
          "lastepoch",
        ];
        const eventPromises = games.map(async (gameId) => {
          try {
            const response = await fetch(`/api/wipes/${gameId}`);
            if (!response.ok) return null;
            return await response.json();
          } catch {
            return null;
          }
        });

        const results = await Promise.all(eventPromises);
        const allEvents: GameEvent[] = [];
        const now = new Date();

        // Convert wipe data to events
        for (let i = 0; i < games.length; i++) {
          const data = results[i];
          const gameId = games[i];

          if (data && data.nextWipe) {
            const nextWipeDate = new Date(data.nextWipe);

            if (nextWipeDate > now) {
              const gameName =
                gameId === "rust"
                  ? "Rust"
                  : gameId === "tarkov"
                  ? "Escape from Tarkov"
                  : gameId === "poe"
                  ? "Path of Exile"
                  : gameId === "fortnite"
                  ? "Fortnite"
                  : gameId === "diablo4"
                  ? "Diablo 4"
                  : gameId === "lastepoch"
                  ? "Last Epoch"
                  : gameId;

              const title =
                gameId === "poe"
                  ? "New League"
                  : gameId === "diablo4"
                  ? "New Season"
                  : gameId === "lastepoch"
                  ? "New Cycle"
                  : gameId === "fortnite"
                  ? "New Season"
                  : "Wipe";

              const eventType =
                gameId === "poe"
                  ? "wipe"
                  : gameId === "diablo4"
                  ? "season"
                  : gameId === "lastepoch"
                  ? "wipe"
                  : "wipe";

              const accentColor =
                gameId === "rust"
                  ? "rgb(206, 62, 62)"
                  : gameId === "tarkov"
                  ? "rgb(205, 180, 128)"
                  : gameId === "poe"
                  ? "rgb(175, 96, 37)"
                  : gameId === "fortnite"
                  ? "rgb(0, 180, 216)"
                  : gameId === "diablo4"
                  ? "rgb(139, 0, 0)"
                  : gameId === "lastepoch"
                  ? "rgb(138, 43, 226)"
                  : "rgb(255, 255, 255)";

              allEvents.push({
                id: `${gameId}-next-wipe`,
                gameId,
                gameName,
                title,
                type: eventType as any,
                startDate: nextWipeDate,
                confirmed: data.confirmed || false,
                description: data.announcement || data.frequency,
                accentColor,
              });
            }
          }
        }

        // Sort by date
        allEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        setEvents(allEvents);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <div className="relative min-h-screen font-sans bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-zinc-50 hover:text-zinc-300 transition-colors"
            >
              NextWipeTime
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Home
              </Link>
              <span className="px-4 py-2 text-zinc-50 font-medium">
                Calendar
              </span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-50 mb-2">
            Game Events Calendar
          </h1>
          <p className="text-zinc-400">
            Track wipes, seasons, updates, and events across all your favorite
            games
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-sm text-zinc-400">Loading events...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 backdrop-blur-sm p-6">
                <div className="text-3xl font-bold text-zinc-50">
                  {events.length}
                </div>
                <div className="text-sm text-zinc-400 mt-1">
                  Upcoming Events
                </div>
              </div>

              <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 backdrop-blur-sm p-6">
                <div className="text-3xl font-bold text-green-400">
                  {events.filter((e) => e.confirmed).length}
                </div>
                <div className="text-sm text-zinc-400 mt-1">Confirmed</div>
              </div>

              <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 backdrop-blur-sm p-6">
                <div className="text-3xl font-bold text-yellow-400">
                  {events.filter((e) => !e.confirmed).length}
                </div>
                <div className="text-sm text-zinc-400 mt-1">Estimated</div>
              </div>
            </div>

            {/* Calendar */}
            <EventCalendar events={events} />

            {/* Event List Below Calendar */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-zinc-50 mb-6">
                All Upcoming Events
              </h2>

              <div className="space-y-3">
                {events.length === 0 ? (
                  <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 backdrop-blur-sm p-8 text-center">
                    <p className="text-zinc-400">
                      No upcoming events at the moment.
                    </p>
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 backdrop-blur-sm p-6 hover:bg-zinc-700/20 transition-colors"
                      style={{
                        borderLeft: `4px solid ${event.accentColor}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className="text-lg font-bold"
                              style={{ color: event.accentColor }}
                            >
                              {event.gameName}
                            </span>
                            {event.confirmed && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">
                                ✓ Confirmed
                              </span>
                            )}
                            {!event.confirmed && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-medium">
                                Estimated
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-semibold text-zinc-50 mb-1">
                            {event.title}
                          </h3>

                          {event.description && (
                            <p className="text-zinc-400 text-sm">
                              {event.description}
                            </p>
                          )}
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <div className="text-2xl font-bold text-zinc-50">
                            {event.startDate.getDate()}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {event.startDate.toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-zinc-500 mt-1">
                            {event.startDate.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-8 mt-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-zinc-400">
          Track wipe schedules and events for your favorite games
        </div>
      </footer>
    </div>
  );
}
