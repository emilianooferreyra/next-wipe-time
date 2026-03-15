import type { WipeData } from "@/schemas/wipe-data";
import {
  advanceToFuture,
  applyEnrichment,
  enrichFromBlog,
  prevCycleDate,
} from "../blog-parser";
import type { GameScraperConfig } from "../types";

// PoE 2 Early Access launched December 6, 2024.
// Seasons are TBD but estimated every ~4 months during early access.
const EA_LAUNCH = new Date("2024-12-06T17:00:00Z");
const CYCLE_DAYS = 120;

async function scrapePoe2(): Promise<WipeData> {
  const now = new Date();
  const nextWipe = advanceToFuture(EA_LAUNCH, CYCLE_DAYS);
  const lastWipe = prevCycleDate(nextWipe, CYCLE_DAYS);

  const baseData: WipeData = {
    nextWipe: nextWipe.toISOString(),
    lastWipe: lastWipe.toISOString(),
    frequency: "Every ~4 months (Early Access)",
    source: "pathofexile.com (Pattern Estimate)",
    scrapedAt: now.toISOString(),
    confirmed: false,
    confidence: 0.5,
    confidenceReason: "estimated_pattern",
    eventType: "league",
    eventName: "New League",
    announcement:
      "Path of Exile 2 is in Early Access. Leagues are expected every few months.",
  };

  const enrichment = await enrichFromBlog({
    listingUrl: "https://www.pathofexile.com/news",
    linkPatterns: [
      /\[([^\]]*(?:path\s+of\s+exile\s+2|poe\s*2|early\s+access)[^\]]*)\]\((https?:\/\/(?:www\.)?pathofexile\.com\/[^\s)"]+)\)/i,
      /\[([^\]]*(?:0\.\d+\.\d+|season|early\s+access)[^\]]*)\]\((https?:\/\/(?:www\.)?pathofexile\.com\/[^\s)"]+)\)/i,
    ],
    waitFor: 4000,
  });

  return enrichment ? applyEnrichment(baseData, enrichment) : baseData;
}

export const poe2Config: GameScraperConfig = {
  id: "poe2",
  name: "Path of Exile 2",
  eventType: "league",
  strategy: "scraped",
  scraperFunction: scrapePoe2,
  fallbackData: {
    frequency: "Every ~4 months (Early Access)",
    confirmed: false,
    announcement:
      "Path of Exile 2 is in Early Access. Leagues are expected every few months.",
    eventName: "New League",
  },
  developer: "Grinding Gear Games",
  typicalCycle: "Every ~4 months (Early Access)",
};
