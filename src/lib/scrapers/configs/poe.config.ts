import type { WipeData } from "@/schemas/wipe-data";
import {
  advanceToFuture,
  applyEnrichment,
  enrichFromBlog,
  prevCycleDate,
} from "../blog-parser";
import type { GameScraperConfig } from "../types";

// PoE leagues release every ~13 weeks (91 days).
// Anchor: Settlers of Kalguur launched August 2, 2024.
const LAST_LEAGUE = new Date("2024-08-02T17:00:00Z");
const CYCLE_DAYS = 91;

async function scrapePoe(): Promise<WipeData> {
  const now = new Date();
  const nextWipe = advanceToFuture(LAST_LEAGUE, CYCLE_DAYS);
  const lastWipe = prevCycleDate(nextWipe, CYCLE_DAYS);

  const baseData: WipeData = {
    nextWipe: nextWipe.toISOString(),
    lastWipe: lastWipe.toISOString(),
    frequency: "Every 13 weeks (~3 months)",
    source: "pathofexile.com (Pattern Estimate)",
    scrapedAt: now.toISOString(),
    confirmed: false,
    confidence: 0.75,
    confidenceReason: "estimated_pattern",
    eventType: "league",
    eventName: "New League",
    announcement: "Path of Exile leagues typically release every 13 weeks.",
  };

  const enrichment = await enrichFromBlog({
    listingUrl: "https://www.pathofexile.com/news",
    linkPatterns: [
      /\[([^\]]*(?:announcing|new\s+league|league\s+reveal|expansion|patch\s+notes)[^\]]*)\]\((https?:\/\/(?:www\.)?pathofexile\.com\/[^\s)"]+)\)/i,
      /\[([^\]]*(?:3\.\d+|league)[^\]]*)\]\((https?:\/\/(?:www\.)?pathofexile\.com\/[^\s)"]+)\)/i,
    ],
    waitFor: 4000,
  });

  return enrichment ? applyEnrichment(baseData, enrichment) : baseData;
}

export const poeConfig: GameScraperConfig = {
  id: "poe",
  name: "Path of Exile",
  eventType: "league",
  strategy: "scraped",
  scraperFunction: scrapePoe,
  fallbackData: {
    frequency: "Every 13 weeks (~3 months)",
    confirmed: false,
    announcement: "Path of Exile leagues typically release every 13 weeks.",
    eventName: "New League",
  },
  developer: "Grinding Gear Games",
  typicalCycle: "Every 13 weeks (~3 months)",
};
