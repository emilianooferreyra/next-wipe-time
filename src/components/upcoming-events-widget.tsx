"use client";

import Link from "next/link";
import {
  CalendarDays,
  RefreshCw,
  Gamepad2,
  PartyPopper,
  Trophy,
} from "lucide-react";
import type { GameEvent } from "@/lib/events/types";

type UpcomingEventsWidgetProps = {
  events: GameEvent[];
  maxEvents?: number;
};

export function UpcomingEventsWidget({
  events,
  maxEvents = 7,
}: UpcomingEventsWidgetProps) {
  const upcomingEvents = events.slice(0, maxEvents);

  if (upcomingEvents.length === 0) {
    return null;
  }

  const getRelativeDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `In ${weeks} week${weeks > 1 ? "s" : ""}`;
    }

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getEventIcon = (type: string, confirmed: boolean) => {
    if (!confirmed) return <CalendarDays className="w-4 h-4" />;

    switch (type) {
      case "wipe":
      case "season":
        return <RefreshCw className="w-4 h-4" />;
      case "update":
        return <Gamepad2 className="w-4 h-4" />;
      case "event":
        return <PartyPopper className="w-4 h-4" />;
      case "tournament":
        return <Trophy className="w-4 h-4" />;
      default:
        return <CalendarDays className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-zinc-50 flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Upcoming Events
          </h3>
          <Link
            href="/calendar"
            className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            View Calendar →
          </Link>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-3 rounded-md hover:bg-zinc-700/20 transition-colors"
              style={{
                borderLeft: `3px solid ${event.accentColor}`,
              }}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="text-2xl flex items-center justify-center w-8 h-8">
                  {getEventIcon(event.type, event.confirmed)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-medium"
                        style={{ color: event.accentColor }}
                      >
                        {event.gameName}
                      </span>
                      {event.confirmed && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                          ✓ Confirmed
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-200 font-medium">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-medium text-zinc-300">
                      {getRelativeDate(event.startDate)}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {event.startDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length > maxEvents && (
          <div className="mt-4 pt-4 border-t border-zinc-700/50 text-center">
            <Link
              href="/calendar"
              className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              View all {events.length} upcoming events →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
