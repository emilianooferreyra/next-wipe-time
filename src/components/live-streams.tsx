"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useMemo } from "react";
import { Radio, Twitch, MessageSquare } from "lucide-react";

interface LiveStream {
  platform: "twitch" | "kick";
  streamerUsername: string;
  streamerDisplayName: string;
  title: string;
  game: string;
  viewerCount: number;
  url: string;
  thumbnailUrl: string;
}

interface StreamsResponse {
  twitch: LiveStream[];
  kick: LiveStream[];
}

interface LiveStreamsProps {
  gameId: string;
}

async function fetchStreams(gameId: string): Promise<StreamsResponse> {
  const response = await fetch(`/api/streams/live?game=${gameId}`);
  if (!response.ok) throw new Error("Failed to fetch streams");
  return response.json();
}

export function LiveStreams({ gameId }: LiveStreamsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["live-streams", gameId],
    queryFn: () => fetchStreams(gameId),
    refetchInterval: 60_000, // replaces the manual setInterval
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {["a", "b", "c"].map((k) => (
          <div
            key={k}
            className="h-20 bg-zinc-800/50 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  const allStreams = useMemo(
    () =>
      [...(data?.twitch ?? []), ...(data?.kick ?? [])].sort(
        (a, b) => b.viewerCount - a.viewerCount,
      ),
    [data],
  );

  if (allStreams.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <Radio className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No streamers online right now</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allStreams.map((stream) => (
        <a
          key={`${stream.platform}-${stream.streamerUsername}`}
          href={stream.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden hover:border-zinc-600 transition-all hover:bg-zinc-800"
        >
          <div className="flex gap-3 p-3">
            {stream.thumbnailUrl && (
              <div className="relative w-24 h-16 bg-zinc-700 rounded flex-shrink-0">
                <Image
                  src={stream.thumbnailUrl}
                  alt={stream.streamerDisplayName}
                  fill
                  sizes="96px"
                  className="object-cover rounded"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                  <div className="flex items-center gap-1 text-red-500 text-xs font-bold">
                    <Radio className="w-3 h-3 fill-current" />
                    LIVE
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1">
                  <h4 className="font-semibold text-zinc-100 truncate group-hover:text-white">
                    {stream.streamerDisplayName}
                  </h4>
                  <p className="text-xs text-zinc-400">{stream.game}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-400 flex-shrink-0">
                  {stream.platform === "twitch" ? (
                    <Twitch className="w-3 h-3" />
                  ) : (
                    <MessageSquare className="w-3 h-3" />
                  )}
                  <span className="font-semibold">
                    {(stream.viewerCount / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 line-clamp-2">
                {stream.title}
              </p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
