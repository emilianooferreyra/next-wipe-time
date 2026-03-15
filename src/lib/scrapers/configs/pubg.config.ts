import type { WipeData } from "@/schemas/wipe-data";
import {
  advanceToFuture,
  applyEnrichment,
  enrichFromBlog,
  prevCycleDate,
} from "../blog-parser";
import type { GameScraperConfig } from "../types";

// PUBG seasons run approximately every 11 weeks.
// Anchor: Season 29 started ~January 15, 2025.
const LAST_SEASON = new Date("2025-01-15T00:00:00Z");
const CYCLE_DAYS = 77; // ~11 weeks

async function scrapePubg(): Promise<WipeData> {
  const now = new Date();
  const nextWipe = advanceToFuture(LAST_SEASON, CYCLE_DAYS);
  const lastWipe = prevCycleDate(nextWipe, CYCLE_DAYS);

  const baseData: WipeData = {
    nextWipe: nextWipe.toISOString(),
    lastWipe: lastWipe.toISOString(),
    frequency: "Every ~11 weeks",
    source: "pubg.com (Pattern Estimate)",
    scrapedAt: now.toISOString(),
    confirmed: false,
    confidence: 0.65,
    confidenceReason: "estimated_pattern",
    eventType: "season",
    eventName: "New Season",
    announcement:
      "PUBG seasons and ranked resets occur approximately every 11 weeks.",
  };

  const enrichment = await enrichFromBlog({
    listingUrl: "https://pubg.com/en/news/",
    linkPatterns: [
      /\[([^\]]*(?:new\s+season|season\s+\d+|ranked|update)[^\]]*)\]\((https?:\/\/(?:www\.)?pubg\.com\/[^\s)"]+)\)/i,
      /\[([^\]]*patch[^\]]*)\]\((https?:\/\/(?:www\.)?pubg\.com\/[^\s)"]+)\)/i,
    ],
    waitFor: 4000,
  });

  return enrichment ? applyEnrichment(baseData, enrichment) : baseData;
}

export const pubgConfig: GameScraperConfig = {
  id: "pubg",
  name: "PUBG: Battlegrounds",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: scrapePubg,
  fallbackData: {
    frequency: "Every ~11 weeks",
    confirmed: false,
    announcement:
      "PUBG seasons and ranked resets occur approximately every 11 weeks.",
    eventName: "New Season",
  },
  developer: "KRAFTON",
  typicalCycle: "Every ~11 weeks",
};
