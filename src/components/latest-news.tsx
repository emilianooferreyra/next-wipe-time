import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  MaximizeIcon,
  MoveLeft,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LatestNewsProps {
  gameName?: string;
  gameWebsite?: string;
  gameDescription?: string;
  wipeData?: any;
  eventType?: string;
  timeLeft?: string;
  versions?: any[];
  currentVersionId?: string;
  previousSeasons?: any[];
  gameInitial?: string;
}

export function LatestNews({
  gameName,
  gameWebsite,
  gameDescription,
  wipeData,
  eventType,
  timeLeft,
  versions = [],
  currentVersionId,
  previousSeasons = [],
  gameInitial,
}: LatestNewsProps) {
  const router = useRouter();
  const [currentItem, setCurrentItem] = useState(0);
  const [isInternalDesignEnabled, setIsInternalDesignEnabled] = useState(false);
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
  const versionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        versionDropdownRef.current &&
        !versionDropdownRef.current.contains(event.target as Node)
      ) {
        setIsVersionDropdownOpen(false);
      }
    };

    if (isVersionDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isVersionDropdownOpen]);

  return (
    <div className="w-full min-h-screen bg-[#242938] p-8">
      <div className="flex items-center justify-between mb-8">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="h-10 px-4 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 gap-2"
        >
          <MoveLeft className="w-5 h-5 text-black" />
          <span className="text-sm font-medium text-black">Home</span>
        </Link>

        {/* Version Dropdown - Only show if game has multiple versions */}
        {versions.length > 1 && (
          <div className="relative" ref={versionDropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVersionDropdownOpen(!isVersionDropdownOpen);
              }}
              className="h-10 px-4 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 gap-2 text-sm font-medium text-black"
            >
              {versions.find((v) => v.id === currentVersionId)?.shortLabel ||
                versions.find((v) => v.id === currentVersionId)?.label ||
                "Version"}
              <ChevronDown
                className={`w-4 h-4 text-black transition-transform ${
                  isVersionDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu */}
            {isVersionDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-gray-200 shadow-lg z-50">
                {versions.map((version, index) => (
                  <button
                    key={version.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/game/${version.id}`);
                      setIsVersionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm text-black transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl ${
                      currentVersionId === version.id
                        ? "bg-gray-100 font-medium"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {version.label || version.shortLabel}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="bg-[#242938] rounded-3xl p-8 shadow-sm">
            <h1 className="text-4xl font-bold mb-8 leading-tight">
              {gameName || "Game"}
              <br />
              {eventType || "Season"}
            </h1>

            {/* Portfolio Cards */}
            <div className="space-y-4 mb-8">
              {/* Current Season/Wipe Card */}
              {wipeData?.eventName && (
                <div className="">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold mb-1">
                        Current {eventType}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-md font-medium">
                          {wipeData.eventName}
                        </span>
                      </div>
                    </div>
                  </div>
                  {wipeData.changelog?.imageUrl && (
                    <img
                      src={wipeData.changelog.imageUrl}
                      alt={wipeData.eventName}
                      width={800}
                      height={128}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  )}
                </div>
              )}

              {/* Next Season/Wipe Card */}
              {wipeData?.nextWipe && (
                <div className="">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-1">Next {eventType}</p>
                      <div className="text-3xl font-bold  mb-2">
                        {timeLeft || "Loading..."}
                      </div>
                    </div>
                  </div>
                  {(wipeData?.customData?.nextLeague?.imageUrl ||
                    wipeData.changelog?.images?.[1]) && (
                    <img
                      src={
                        wipeData?.customData?.nextLeague?.imageUrl ||
                        wipeData.changelog?.images?.[1]
                      }
                      alt="Next wipe"
                      width={800}
                      height={128}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  )}
                </div>
              )}

              {/* Next League Image Preview */}
              {(wipeData?.customData?.nextLeague?.imageUrl ||
                wipeData?.changelog?.images?.[1]) && (
                <div className="border border-gray-200 p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Next {eventType} Preview
                  </p>
                  <img
                    src={
                      wipeData?.customData?.nextLeague?.imageUrl ||
                      wipeData?.changelog?.images?.[1]
                    }
                    alt="Next league preview"
                    width={800}
                    height={160}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Previous Seasons Preview */}
              {previousSeasons && previousSeasons.length > 0 && (
                <div className="border border-gray-200 p-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Previous {eventType}s
                  </p>
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                    <div className="flex gap-2 ml-auto">
                      {previousSeasons
                        .slice(0, 2)
                        .map((season: any, idx: number) => (
                          <img
                            key={idx}
                            src={
                              season.imageUrl ||
                              `https://images.unsplash.com/photo-160060768792${idx}-4e2a09cf159d?w=80&h=60&fit=crop`
                            }
                            alt={season.name || `Season ${idx + 1}`}
                            width={64}
                            height={48}
                            className="w-16 h-12 object-cover rounded-lg"
                          />
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 px-6 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                View more {eventType}s
              </button>
              <button className="flex-1 py-3 px-6 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                Official Site
              </button>
            </div>
          </div>

          <div className="bg-[#242938] rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6">Latest Updates</h2>

            <p className="text-sm text-gray-600 mb-8 leading-relaxed">
              {gameDescription ||
                "Stay updated with the latest season information, features, and upcoming changes for this game."}
            </p>

            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden mb-6 group">
              <img
                src={wipeData?.changelog?.imageUrl}
                alt={wipeData?.eventName || "Game showcase"}
                width={800}
                height={256}
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                {wipeData?.eventName || gameName}
                <span className="text-gray-500">{eventType}</span>
              </div>
              <button className="absolute top-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                +
              </button>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
              {wipeData?.changelog?.features &&
              wipeData.changelog.features.length > 0 ? (
                wipeData.changelog.features
                  .slice(0, 3)
                  .map((feature: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 text-xs">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">
                          {feature.title || `Feature ${idx + 1}`}
                        </h4>
                        <p className="text-sm">
                          {feature.description || "New feature coming soon"}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Track {eventType}s</h4>
                      <p className="text-sm">
                        Never miss a wipe or season start
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Live Updates</h4>
                      <p className="text-sm">
                        Real-time information and countdowns
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Feature Highlights</h4>
                      <p className="text-sm ">
                        Discover what's new each season
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
