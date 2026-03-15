"use client";

import { useState, useRef } from "react";
import { ExternalLink, Radio, Users } from "lucide-react";
import Image from "next/image";

interface LiveStream {
  id: string;
  platform: "twitch" | "youtube" | "kick";
  channelName: string;
  channelUrl: string;
  embedUrl: string;
  title: string;
  viewerCount: number;
  thumbnailUrl: string;
  isLive: boolean;
}

interface MediaItem {
  type: "image" | "video" | "youtube";
  src: string;
  alt: string;
}

interface GalleryLiveStreamsProps {
  liveStreams?: LiveStream[];
  mediaItems?: MediaItem[];
  gameName?: string;
}

function formatViewerCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function getPlatformColor(platform: string): string {
  switch (platform) {
    case "twitch":
      return "bg-[#9146FF]";
    case "youtube":
      return "bg-[#FF0000]";
    case "kick":
      return "bg-[#53FC18]";
    default:
      return "bg-zinc-600";
  }
}

function HoverVideo({ src, className }: { src: string; className: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <video
      ref={ref}
      src={src}
      className={className}
      loop
      muted
      playsInline
      onMouseEnter={() => ref.current?.play()}
      onMouseLeave={() => { ref.current?.pause(); if (ref.current) ref.current.currentTime = 0; }}
    />
  );
}

export const GalleryLiveStreams = ({
  liveStreams = [],
  mediaItems = [],
  gameName = "Game",
}: GalleryLiveStreamsProps) => {
  const [featuredStreamIndex, setFeaturedStreamIndex] = useState(0);
  // Lazy initializer avoids a useEffect just to read window.location
  const [hostname] = useState(() =>
    typeof window !== "undefined" ? window.location.hostname.split(":")[0] : "localhost"
  );

  const getTwitchEmbedUrl = (channel: string) => {
    const params = new URLSearchParams({
      channel,
      parent: hostname,
      autoplay: "true",
      muted: "false",
      allowfullscreen: "true",
    });
    return `https://player.twitch.tv/?${params.toString()}`;
  };

  const featuredStream = liveStreams[featuredStreamIndex] || liveStreams[0];
  const carouselStreams = liveStreams.slice(0, 4);
  const masonryImages = mediaItems.slice(0, 5);

  return (
    <div className="w-full space-y-4">
      {/* Featured Stream - Large */}
      {featuredStream && (
        <div className="relative aspect-video bg-zinc-900 overflow-hidden">
          {featuredStream.platform === "twitch" && (
            <iframe
              src={getTwitchEmbedUrl(featuredStream.channelName)}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
              title={featuredStream.title}
            />
          )}
          {featuredStream.platform === "youtube" && (
            <iframe
              src={featuredStream.embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
              title={featuredStream.title}
            />
          )}
          {featuredStream.platform === "kick" && (
            <iframe
              src={featuredStream.embedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
              title={featuredStream.title}
            />
          )}

          {/* Stream Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4">
            <div className="flex items-end justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {/* LIVE Badge - More Visible */}
                  <div className="flex items-center gap-2 bg-red-600 rounded-md px-3 py-1.5 shadow-lg shadow-red-600/30">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                    </span>
                    <span className="text-sm font-bold text-white tracking-wider">LIVE</span>
                  </div>
                  
                  {/* Platform Badge */}
                  <div className={`${getPlatformColor(featuredStream.platform)} rounded-md px-3 py-1.5`}>
                    <span className="text-sm font-semibold text-white uppercase">{featuredStream.platform}</span>
                  </div>
                  
                  {/* Viewers */}
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-md px-3 py-1.5">
                    <Users className="w-4 h-4 text-zinc-300" />
                    <span className="text-sm font-semibold text-white">{formatViewerCount(featuredStream.viewerCount)}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1">{featuredStream.title}</h3>
                <p className="text-sm text-zinc-300">{featuredStream.channelName}</p>
              </div>
              
              <a
                href={featuredStream.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
              >
                <ExternalLink className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Stream Carousel - 3-4 Streams */}
      {carouselStreams.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {carouselStreams.map((stream, index) => (
            <button
              key={stream.id}
              onClick={() => setFeaturedStreamIndex(index)}
              className={`relative aspect-video bg-zinc-800 overflow-hidden group ${
                index === featuredStreamIndex ? "ring-2 ring-white" : ""
              }`}
            >
              {stream.thumbnailUrl ? (
                <Image
                  src={stream.thumbnailUrl}
                  alt={stream.title}
                  fill
                  className="object-cover group-hover:brightness-110 transition-all"
                />
              ) : (
                <div className="w-full h-full bg-zinc-700" />
              )}
              
              {/* Live indicator on thumbnail */}
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 rounded px-2 py-0.5">
                <Radio className="w-3 h-3 text-white" />
                <span className="text-xs font-bold text-white">LIVE</span>
              </div>
              
              {/* Viewers */}
              <div className="absolute bottom-2 right-2 bg-black/70 rounded px-2 py-0.5">
                <span className="text-xs text-white">{formatViewerCount(stream.viewerCount)}</span>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-xs font-semibold text-center px-2 line-clamp-2">
                  {stream.channelName}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Masonry Grid - 5 Images */}
      {masonryImages.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {masonryImages.slice(0, 2).map((item, index) => (
            <div key={index} className="relative aspect-video bg-zinc-800 overflow-hidden">
              {item.type === "image" ? (
                <Image src={item.src} alt={item.alt} fill className="object-cover" />
              ) : item.type === "video" ? (
                <HoverVideo src={item.src} className="w-full h-full object-cover" />
              ) : null}
            </div>
          ))}
          
          <div className="relative row-span-2 bg-zinc-800 overflow-hidden">
            {masonryImages[2] && (
              <Image src={masonryImages[2].src} alt={masonryImages[2].alt} fill className="object-cover" />
            )}
          </div>
          
          {masonryImages.slice(3, 5).map((item, index) => (
            <div key={index + 3} className="relative aspect-video bg-zinc-800 overflow-hidden">
              {item.type === "image" ? (
                <Image src={item.src} alt={item.alt} fill className="object-cover" />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
