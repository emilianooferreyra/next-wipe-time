"use client";

import { useState, useEffect } from "react";
import { UpcomingEventsWidget } from "./upcoming-events-widget";
import type { GameEvent } from "@/lib/events/types";

export function EventsSection() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);

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
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);

        for (let i = 0; i < games.length; i++) {
          const data = results[i];
          const gameId = games[i];

          if (data && data.nextWipe) {
            const nextWipeDate = new Date(data.nextWipe);

            if (nextWipeDate >= now && nextWipeDate <= futureDate) {
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

  if (loading) {
    return null;
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex justify-center">
      <UpcomingEventsWidget events={events} maxEvents={7} />
    </div>
  );
}
