"use client";

import { GalleryLiveStreams } from "./gallery-live-streams";
import { LatestNews } from "./latest-news";

interface MediaItem {
  type: "image" | "video" | "youtube";
  src: string;
  alt: string;
}

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

interface GameDetailViewProps {
  gameId: string;
  gameName: string;
  gameImage: string;
  gameWebsite: string;
  gameDescription?: string;
  wipeData: any;
  eventType: string;
  eventTitle: string;
  timeLeft: string;
  mediaItems?: MediaItem[];
  liveStreams?: LiveStream[];
  officialLinks?: { label: string; url: string }[];
  previousSeasons?: any[];
  versions?: any[];
  currentVersionId?: string;
  baseGameId?: string;
}

export const GameDetailView = ({
  gameName,
  gameWebsite,
  gameDescription,
  wipeData,
  eventType,
  eventTitle,
  timeLeft,
  mediaItems = [],
  liveStreams = [],
  previousSeasons = [],
  versions = [],
  currentVersionId,
  baseGameId,
}: GameDetailViewProps) => {
  const gameInitial = gameName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#000000] p-8 pt-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Gallery & Live Streams Section */}
          <GalleryLiveStreams
            liveStreams={liveStreams}
            mediaItems={mediaItems}
            gameName={gameName}
          />

          {/* Latest News Section */}
          <LatestNews
            gameName={gameName}
            gameWebsite={gameWebsite}
            gameDescription={gameDescription}
            wipeData={wipeData}
            eventType={eventType}
            timeLeft={timeLeft}
            versions={versions}
            currentVersionId={currentVersionId}
            previousSeasons={previousSeasons}
            gameInitial={gameInitial}
          />
        </div>
      </div>
    </div>
  );
};
