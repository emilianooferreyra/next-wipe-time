"use client";

import { useQuery } from "@tanstack/react-query";
import { parseWipeData } from "@/schemas/wipe-data";
import type { WipeData } from "@/types/game";
import type { LiveStream } from "@/lib/scrapers/stream-helpers";

type StreamApiItem = {
  platform: string;
  streamerUsername: string;
  streamerDisplayName: string;
  title: string;
  game?: string;
  viewerCount: number;
  url: string;
  thumbnailUrl: string;
};

type StreamsApiResponse = {
  twitch?: StreamApiItem[];
  kick?: StreamApiItem[];
};

function transformStreams(data: StreamsApiResponse): LiveStream[] {
  const twitch = (data.twitch || []).map((s, i) => ({
    id: `twitch-${s.streamerUsername}-${i}`,
    platform: "twitch" as const,
    channelName: s.streamerUsername,
    channelUrl: s.url,
    embedUrl: `https://player.twitch.tv/?channel=${s.streamerUsername}&parent=localhost&parent=nextwipetime.vercel.app&autoplay=true&muted=true`,
    title: s.title,
    viewerCount: s.viewerCount,
    thumbnailUrl:
      s.thumbnailUrl ||
      `https://static-cdn.jtvnw.net/previews-ttv/live_user_${s.streamerUsername}-440x248.jpg`,
    isLive: true,
  }));

  const kick = (data.kick || []).map((s, i) => ({
    id: `kick-${s.streamerUsername}-${i}`,
    platform: "kick" as const,
    channelName: s.streamerUsername,
    channelUrl: s.url,
    embedUrl: `https://player.kick.com/${s.streamerUsername}?autoplay=true&muted=true`,
    title: s.title,
    viewerCount: s.viewerCount,
    thumbnailUrl:
      s.thumbnailUrl || `https://kick.com/${s.streamerUsername}/thumbnail.jpg`,
    isLive: true,
  }));

  return [...twitch, ...kick].sort((a, b) => b.viewerCount - a.viewerCount);
}

/**
 * Fetches wipe data + live streams for the game details page.
 * Uses TanStack Query for caching and automatic stream refresh (60s interval).
 */
export function useGamePageData(gameId: string | null) {
  const wipeQuery = useQuery<WipeData | null>({
    queryKey: ["wipe", gameId],
    queryFn: async () => {
      if (!gameId) return null;
      const res = await fetch(`/api/wipes/${gameId}`);
      if (!res.ok) throw new Error(`Wipe API: HTTP ${res.status}`);
      return parseWipeData(await res.json());
    },
    enabled: !!gameId,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const streamsQuery = useQuery<LiveStream[]>({
    queryKey: ["streams", gameId],
    queryFn: async () => {
      if (!gameId) return [];
      const res = await fetch(`/api/streams/live?game=${gameId}`);
      if (!res.ok) return [];
      return transformStreams(await res.json());
    },
    enabled: !!gameId,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000, // Auto-refresh streams every 60s
    refetchOnWindowFocus: false,
  });

  return {
    wipeData: wipeQuery.data ?? null,
    wipeLoading: wipeQuery.isLoading,
    liveStreams: streamsQuery.data ?? [],
    streamsLoading: streamsQuery.isLoading,
  };
}
