import type { WipeData } from "@/schemas/wipe-data";
import {
  advanceToFuture,
  applyEnrichment,
  enrichFromBlog,
  prevCycleDate,
} from "../blog-parser";
import type { GameScraperConfig } from "../types";

// Diablo IV seasons run every ~13 weeks.
// Season 7 "Season of Witchcraft" launched January 21, 2025.
const LAST_SEASON = new Date("2025-01-21T17:00:00Z");
const CYCLE_DAYS = 91; // 13 weeks

async function scrapeDiablo4(): Promise<WipeData> {
  const now = new Date();
  const nextWipe = advanceToFuture(LAST_SEASON, CYCLE_DAYS);
  const lastWipe = prevCycleDate(nextWipe, CYCLE_DAYS);

  const baseData: WipeData = {
    nextWipe: nextWipe.toISOString(),
    lastWipe: lastWipe.toISOString(),
    frequency: "Every 13 weeks (~3 months)",
    source: "news.blizzard.com (Pattern Estimate)",
    scrapedAt: now.toISOString(),
    confirmed: false,
    confidence: 0.75,
    confidenceReason: "estimated_pattern",
    eventType: "season",
    eventName: "New Season",
    announcement:
      "Diablo IV seasons typically launch every 13 weeks with a full character reset.",
  };

  const enrichment = await enrichFromBlog({
    listingUrl: "https://news.blizzard.com/en-us/diablo4",
    linkPatterns: [
      /\[([^\]]*(?:new\s+season|season\s+\d+|patch\s+notes|upcoming)[^\]]*)\]\((https?:\/\/[^\s)"]*blizzard\.com\/[^\s)"]+)\)/i,
      /\[([^\]]*(?:season|patch|update)[^\]]*)\]\((https?:\/\/[^\s)"]*blizzard\.com\/[^\s)"]+)\)/i,
    ],
    waitFor: 5000,
  });

  return enrichment ? applyEnrichment(baseData, enrichment) : baseData;
}

export const diablo4Config: GameScraperConfig = {
  id: "diablo4",
  name: "Diablo IV",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: scrapeDiablo4,
  fallbackData: {
    frequency: "Every 13 weeks (~3 months)",
    confirmed: false,
    announcement:
      "Diablo IV seasons typically launch every 13 weeks with a full character reset.",
    eventName: "New Season",
  },
  developer: "Blizzard Entertainment",
  typicalCycle: "Every 13 weeks (~3 months)",
};
