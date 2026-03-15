import type { WipeData } from "@/schemas/wipe-data";
import {
  advanceToFuture,
  applyEnrichment,
  enrichFromBlog,
  prevCycleDate,
} from "../blog-parser";
import type { GameScraperConfig } from "../types";

// Diablo III is in maintenance mode. Seasons continue but infrequently.
// Season 31 launched ~November 8, 2024. Roughly every 4–5 months now.
const LAST_SEASON = new Date("2024-11-08T17:00:00Z");
const CYCLE_DAYS = 135; // ~4.5 months average

async function scrapeDiablo3(): Promise<WipeData> {
  const now = new Date();
  const nextWipe = advanceToFuture(LAST_SEASON, CYCLE_DAYS);
  const lastWipe = prevCycleDate(nextWipe, CYCLE_DAYS);

  const baseData: WipeData = {
    nextWipe: nextWipe.toISOString(),
    lastWipe: lastWipe.toISOString(),
    frequency: "Every 4–5 months (maintenance mode)",
    source: "news.blizzard.com (Pattern Estimate)",
    scrapedAt: now.toISOString(),
    confirmed: false,
    confidence: 0.5,
    confidenceReason: "estimated_pattern",
    eventType: "season",
    eventName: "New Season",
    announcement:
      "Diablo III is in maintenance mode. Seasons still run but on a slower cadence.",
  };

  const enrichment = await enrichFromBlog({
    listingUrl: "https://news.blizzard.com/en-us/diablo3",
    linkPatterns: [
      /\[([^\]]*(?:season\s+\d+|new\s+season|patch|end\s+of\s+season)[^\]]*)\]\((https?:\/\/[^\s)"]*blizzard\.com\/[^\s)"]+)\)/i,
    ],
    waitFor: 5000,
  });

  return enrichment ? applyEnrichment(baseData, enrichment) : baseData;
}

export const diablo3Config: GameScraperConfig = {
  id: "diablo3",
  name: "Diablo III",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: scrapeDiablo3,
  fallbackData: {
    frequency: "Every 4–5 months (maintenance mode)",
    confirmed: false,
    announcement:
      "Diablo III is in maintenance mode. Seasons still run but on a slower cadence.",
    eventName: "New Season",
  },
  developer: "Blizzard Entertainment",
  typicalCycle: "Every 4–5 months",
};
