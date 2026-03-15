import { useQuery } from "@tanstack/react-query";
import type { GameEvent, EventType } from "@/lib/events/types";

// Static metadata avoids re-creating these maps on every render
const GAME_IDS = [
  "rust",
  "tarkov",
  "tarkov-arena",
  "poe",
  "poe2",
  "fortnite",
  "diablo4",
  "diablo3",
  "diablo2",
  "diabloimmortal",
  "pubg",
] as const;

const GAME_META: Record<
  string,
  { name: string; title: string; type: EventType; accentColor: string }
> = {
  rust: {
    name: "Rust",
    title: "Wipe",
    type: "wipe",
    accentColor: "rgb(206, 62, 62)",
  },
  tarkov: {
    name: "Escape from Tarkov",
    title: "Wipe",
    type: "wipe",
    accentColor: "rgb(205, 180, 128)",
  },
  "tarkov-arena": {
    name: "Tarkov Arena",
    title: "Season",
    type: "season",
    accentColor: "rgb(205, 180, 128)",
  },
  poe: {
    name: "Path of Exile",
    title: "New League",
    type: "wipe",
    accentColor: "rgb(175, 96, 37)",
  },
  poe2: {
    name: "Path of Exile 2",
    title: "New League",
    type: "wipe",
    accentColor: "rgb(175, 96, 37)",
  },
  fortnite: {
    name: "Fortnite",
    title: "New Season",
    type: "season",
    accentColor: "rgb(0, 180, 216)",
  },
  diablo4: {
    name: "Diablo IV",
    title: "New Season",
    type: "season",
    accentColor: "rgb(139, 0, 0)",
  },
  diablo3: {
    name: "Diablo III",
    title: "New Season",
    type: "season",
    accentColor: "rgb(139, 0, 0)",
  },
  diablo2: {
    name: "Diablo II: Resurrected",
    title: "New Ladder",
    type: "wipe",
    accentColor: "rgb(139, 0, 0)",
  },
  diabloimmortal: {
    name: "Diablo Immortal",
    title: "New Season",
    type: "season",
    accentColor: "rgb(139, 0, 0)",
  },
  pubg: {
    name: "PUBG: Battlegrounds",
    title: "New Season",
    type: "season",
    accentColor: "rgb(244, 125, 0)",
  },
};

async function fetchWipeEvents(): Promise<GameEvent[]> {
  const now = new Date();

  const results = await Promise.allSettled(
    GAME_IDS.map(async (gameId) => {
      const response = await fetch(`/api/wipes/${gameId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return { gameId, data };
    })
  );

  const events: GameEvent[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled" || !result.value) continue;

    const { gameId, data } = result.value;
    if (!data?.nextWipe) continue;

    const nextWipeDate = new Date(data.nextWipe);
    if (nextWipeDate <= now) continue;

    const meta = GAME_META[gameId];
    if (!meta) continue;

    events.push({
      id: `${gameId}-next-wipe`,
      gameId,
      gameName: meta.name,
      title: meta.title,
      type: meta.type,
      startDate: nextWipeDate,
      confirmed: data.confirmed ?? false,
      description: data.announcement || data.frequency,
      accentColor: meta.accentColor,
    });
  }

  return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

/**
 * Fetches upcoming wipe/season events for the main tracked games.
 *
 * Shared query key ["wipe-events"] means calendar page and events section
 * both hit this hook — only one network request, cache shared between them.
 */
export function useWipeEvents() {
  return useQuery({
    queryKey: ["wipe-events"],
    queryFn: fetchWipeEvents,
    staleTime: 5 * 60 * 1000, // treat as fresh for 5 min
  });
}
