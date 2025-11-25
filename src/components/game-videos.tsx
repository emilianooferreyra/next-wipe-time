"use client";

import { useEffect, useState } from "react";
import { Play, Youtube } from "lucide-react";

interface VideoData {
  id: string;
  title: string;
  channel: string;
  url: string;
  thumbnailUrl?: string;
  publishedAt: string;
  viewCount?: number;
  description?: string;
}

interface GameVideosProps {
  gameId: string;
}

export function GameVideos({ gameId }: GameVideosProps) {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        // For now, this would be integrated with the game details endpoint
        // const response = await fetch(`/api/games/${gameId}/details`);
        // For Tarkov specifically
        const response = await fetch("/api/games/tarkov/details");

        if (!response.ok) throw new Error("Failed to fetch videos");

        const data = await response.json();
        setVideos(data.videos || []);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [gameId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-zinc-800/50 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        <Youtube className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No videos found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {videos.map((video) => (
        <a
          key={video.id}
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <div className="relative overflow-hidden rounded-lg bg-zinc-800 aspect-video mb-2">
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center">
                <Youtube className="w-12 h-12 text-zinc-600" />
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all">
              <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
            </div>

            <div className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded text-white text-xs font-semibold">
              YouTube
            </div>
          </div>

          <h3 className="font-semibold text-zinc-100 line-clamp-2 group-hover:text-white transition-colors">
            {video.title}
          </h3>

          <p className="text-xs text-zinc-500 mt-1">{video.channel}</p>
        </a>
      ))}
    </div>
  );
}
