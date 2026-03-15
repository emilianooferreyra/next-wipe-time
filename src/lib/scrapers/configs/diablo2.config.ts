import type { WipeData } from "@/schemas/wipe-data";
import {
  advanceToFuture,
  applyEnrichment,
  enrichFromBlog,
  prevCycleDate,
} from "../blog-parser";
import type { GameScraperConfig } from "../types";

// Diablo II: Resurrected ladder resets ~every 6 months.
// Ladder Season 8 started ~October 2024.
const LAST_LADDER = new Date("2024-10-15T17:00:00Z");
const CYCLE_DAYS = 180; // ~6 months

async function scrapeDiablo2(): Promise<WipeData> {
  const now = new Date();
  const nextWipe = advanceToFuture(LAST_LADDER, CYCLE_DAYS);
  const lastWipe = prevCycleDate(nextWipe, CYCLE_DAYS);

  const baseData: WipeData = {
    nextWipe: nextWipe.toISOString(),
    lastWipe: lastWipe.toISOString(),
    frequency: "Every ~6 months",
    source: "news.blizzard.com (Pattern Estimate)",
    scrapedAt: now.toISOString(),
    confirmed: false,
    confidence: 0.5,
    confidenceReason: "estimated_pattern",
    eventType: "season",
    eventName: "New Ladder",
    announcement:
      "Diablo II: Resurrected ladder seasons reset approximately every 6 months.",
  };

  const enrichment = await enrichFromBlog({
    listingUrl: "https://news.blizzard.com/en-us/diablo2",
    linkPatterns: [
      /\[([^\]]*(?:ladder\s+reset|new\s+ladder|season|patch)[^\]]*)\]\((https?:\/\/[^\s)"]*blizzard\.com\/[^\s)"]+)\)/i,
    ],
    waitFor: 5000,
  });

  return enrichment ? applyEnrichment(baseData, enrichment) : baseData;
}

export const diablo2Config: GameScraperConfig = {
  id: "diablo2",
  name: "Diablo II: Resurrected",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: scrapeDiablo2,
  fallbackData: {
    frequency: "Every ~6 months",
    confirmed: false,
    announcement:
      "Diablo II: Resurrected ladder seasons reset approximately every 6 months.",
    eventName: "New Ladder",
  },
  developer: "Blizzard Entertainment",
  typicalCycle: "Every ~6 months",
};
