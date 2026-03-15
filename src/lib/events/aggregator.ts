import { games } from "@/components/game-tabs";
import type { GameEvent } from "./types";

export async function getUpcomingEvents(): Promise<GameEvent[]> {
  const now = new Date();
  const baseUrl =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      : "";

  // Fetch all games in parallel — was sequential (20 × latency), now bounded by slowest single request
  const results = await Promise.allSettled(
    games.map(async (game): Promise<GameEvent | null> => {
      const response = await fetch(`${baseUrl}/api/wipes/${game.id}`, {
        next: { revalidate: 300 }, // Reuse Next.js cache; refresh every 5 min
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (!data.nextWipe) return null;

      const nextWipeDate = new Date(data.nextWipe);
      if (nextWipeDate <= now) return null;

      const eventType =
        game.id === "diablo4" ? "season" : "wipe";

      const title =
        game.id === "poe" || game.id === "poe2"
          ? "New League"
          : game.id === "diablo4" || game.id === "diablo3" || game.id === "diabloimmortal"
            ? "New Season"
            : game.id === "diablo2"
              ? "New Ladder"
              : game.id === "fortnite" || game.id === "pubg" || game.id === "tarkov-arena"
                ? "New Season"
                : "Wipe";

      return {
        id: `${game.id}-next-wipe`,
        gameId: game.id,
        gameName: game.name,
        title,
        type: eventType,
        startDate: nextWipeDate,
        confirmed: data.confirmed || false,
        description: data.announcement || data.frequency,
        accentColor: game.accentColor,
      } satisfies GameEvent;
    })
  );

  const events = results
    .filter(
      (r): r is PromiseFulfilledResult<GameEvent | null> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value)
    .filter((e): e is GameEvent => e !== null);

  // Sort events by date (earliest first)
  return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

export async function getEventsForNextDays(
  days: number = 30,
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
  month: number,
): Promise<GameEvent[]> {
  const allEvents = await getUpcomingEvents();

  return allEvents.filter((event) => {
    const eventDate = event.startDate;
    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
  });
}
