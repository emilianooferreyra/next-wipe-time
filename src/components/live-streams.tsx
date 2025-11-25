"use client";

import { useEffect, useState } from "react";
import { Radio, Twitch, MessageSquare, AlertCircle } from "lucide-react";

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

interface LiveStreamsProps {
  gameId: string;
}

export function LiveStreams({ gameId }: LiveStreamsProps) {
  const [streams, setStreams] = useState<{
    twitch: LiveStream[];
    kick: LiveStream[];
  }>({ twitch: [], kick: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/streams/live?game=${gameId}`);

        if (!response.ok) throw new Error("Failed to fetch streams");

        const data = await response.json();
        console.log("Live streams response:", data);

        setStreams({
          twitch: data.twitch || [],
          kick: data.kick || [],
        });

        if (data.debug) {
          setDebug(data.debug);
          if (data.debug.twitchError) {
            console.error("Twitch Error:", data.debug.twitchError);
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        console.error("Error fetching streams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
    // Refresh every 60 seconds
    const interval = setInterval(fetchStreams, 60000);
    return () => clearInterval(interval);
  }, [gameId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-zinc-800/50 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  const allStreams = [...streams.twitch, ...streams.kick].sort(
    (a, b) => b.viewerCount - a.viewerCount
  );

  if (allStreams.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-zinc-500">
          <Radio className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No streamers online right now</p>
        </div>

        {debug && (debug.twitchError || debug.kickError) && (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-600">
                {debug.twitchError && (
                  <p>
                    <strong>Twitch error:</strong> {debug.twitchError}
                  </p>
                )}
                {debug.kickError && (
                  <p>
                    <strong>Kick error:</strong> {debug.kickError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
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
                <img
                  src={stream.thumbnailUrl}
                  alt={stream.streamerDisplayName}
                  className="w-full h-full object-cover"
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
