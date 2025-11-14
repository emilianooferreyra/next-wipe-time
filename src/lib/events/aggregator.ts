import { games } from "@/components/game-tabs";
import type { GameEvent } from "./types";

export async function getUpcomingEvents(): Promise<GameEvent[]> {
  const events: GameEvent[] = [];
  const now = new Date();

  for (const game of games) {
    try {
      const baseUrl =
        typeof window === "undefined"
          ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          : "";

      const response = await fetch(`${baseUrl}/api/wipes/${game.id}`, {
        cache: "no-store",
      });

      if (!response.ok) continue;

      const data = await response.json();

      if (data.nextWipe) {
        const nextWipeDate = new Date(data.nextWipe);

        if (nextWipeDate > now) {
          const eventType =
            game.id === "poe"
              ? "wipe"
              : game.id === "diablo4"
              ? "season"
              : game.id === "lastepoch"
              ? "wipe"
              : "wipe";

          const title =
            game.id === "poe"
              ? "New League"
              : game.id === "diablo4"
              ? "New Season"
              : game.id === "lastepoch"
              ? "New Cycle"
              : game.id === "fortnite"
              ? "New Season"
              : "Wipe";

          events.push({
            id: `${game.id}-next-wipe`,
            gameId: game.id,
            gameName: game.name,
            title: title,
            type: eventType,
            startDate: nextWipeDate,
            confirmed: data.confirmed || false,
            description: data.announcement || data.frequency,
            accentColor: game.accentColor,
          });
        }
      }

      // Add last wipe as historical reference (optional)
      // This helps show cycle patterns
    } catch (error) {
      console.error(`Error fetching events for ${game.id}:`, error);
    }
  }

  // Sort events by date (earliest first)
  return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

export async function getEventsForNextDays(
  days: number = 30
): Promise<GameEvent[]> {
  const allEvents = await getUpcomingEvents();
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return allEvents.filter((event) => {
    const eventDate = event.startDate;
    return eventDate >= now && eventDate <= futureDate;
  });
}

export function groupEventsByDate(events: GameEvent[]): {
  [dateKey: string]: GameEvent[];
} {
  const grouped: { [dateKey: string]: GameEvent[] } = {};

  for (const event of events) {
    const dateKey = event.startDate.toISOString().split("T")[0]; // YYYY-MM-DD
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  }

  return grouped;
}

export async function getEventsForMonth(
  year: number,
  month: number
): Promise<GameEvent[]> {
  const allEvents = await getUpcomingEvents();

  return allEvents.filter((event) => {
    const eventDate = event.startDate;
    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
  });
}
