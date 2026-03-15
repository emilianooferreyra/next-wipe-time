import type { WipeData } from "@/schemas/wipe-data";
import {
  advanceToFuture,
  applyEnrichment,
  enrichFromBlog,
  prevCycleDate,
} from "../blog-parser";
import type { GameScraperConfig } from "../types";

// Diablo Immortal has regular content seasons roughly every 2 months.
// Anchor: Season start ~January 2025.
const LAST_SEASON = new Date("2025-01-01T00:00:00Z");
const CYCLE_DAYS = 60; // ~2 months

async function scrapeDiabloImmortal(): Promise<WipeData> {
  const now = new Date();
  const nextWipe = advanceToFuture(LAST_SEASON, CYCLE_DAYS);
  const lastWipe = prevCycleDate(nextWipe, CYCLE_DAYS);

  const baseData: WipeData = {
    nextWipe: nextWipe.toISOString(),
    lastWipe: lastWipe.toISOString(),
    frequency: "Every ~2 months",
    source: "diabloimmortal.blizzard.com (Pattern Estimate)",
    scrapedAt: now.toISOString(),
    confirmed: false,
    confidence: 0.5,
    confidenceReason: "estimated_pattern",
    eventType: "update",
    eventName: "New Content Season",
    announcement:
      "Diablo Immortal receives major content updates and battle pass seasons approximately every 2 months.",
  };

  const enrichment = await enrichFromBlog({
    listingUrl: "https://diabloimmortal.blizzard.com/en-us/news",
    linkPatterns: [
      /\[([^\]]*(?:new\s+season|update|patch|content|battle\s+pass)[^\]]*)\]\((https?:\/\/[^\s)"]*(?:blizzard|diabloimmortal)\.com\/[^\s)"]+)\)/i,
    ],
    waitFor: 5000,
  });

  return enrichment ? applyEnrichment(baseData, enrichment) : baseData;
}

export const diabloImmortalConfig: GameScraperConfig = {
  id: "diabloimmortal",
  name: "Diablo Immortal",
  eventType: "update",
  strategy: "scraped",
  scraperFunction: scrapeDiabloImmortal,
  fallbackData: {
    frequency: "Every ~2 months",
    confirmed: false,
    announcement:
      "Diablo Immortal receives major content updates approximately every 2 months.",
    eventName: "New Content Season",
  },
  developer: "Blizzard Entertainment",
  typicalCycle: "Every ~2 months",
};
