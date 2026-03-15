"use client";

import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { useWipeEvents } from "@/hooks/use-wipe-events";
import { EventCalendar } from "@/components/event-calendar";

export default function CalendarPage() {
  const { data: events = [], isLoading } = useWipeEvents();

  return (
    <div className="relative min-h-screen font-sans bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
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

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-sm text-zinc-400">Loading events...</p>
          </div>
        ) : (
          <>
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

            <EventCalendar events={events} />

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
                      style={{ borderLeft: `4px solid ${event.accentColor}` }}
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
                            {event.confirmed ? (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 font-medium">
                                <CalendarCheck />
                              </span>
                            ) : (
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

      <footer className="relative border-t border-white/10 py-8 mt-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-zinc-400">
          Track wipe schedules and events for your favorite games
        </div>
      </footer>
    </div>
  );
}
