import type { WipeData } from "@/schemas/wipe-data";
import {
  advanceToFuture,
  applyEnrichment,
  enrichFromBlog,
  prevCycleDate,
} from "../blog-parser";
import type { GameScraperConfig } from "../types";

// Tarkov wipes are very irregular — roughly every 6–12 months.
// Last known wipe: July 10, 2024 (Patch 0.14.x)
const LAST_WIPE = new Date("2024-07-10T12:00:00Z");
const CYCLE_DAYS = 270; // ~9 month average

async function scrapeTarkov(): Promise<WipeData> {
  const now = new Date();
  const nextWipe = advanceToFuture(LAST_WIPE, CYCLE_DAYS);
  const lastWipe = prevCycleDate(nextWipe, CYCLE_DAYS);

  const baseData: WipeData = {
    nextWipe: nextWipe.toISOString(),
    lastWipe: lastWipe.toISOString(),
    frequency: "Every 6–12 months (irregular)",
    source: "Community estimate (r/EscapefromTarkov)",
    scrapedAt: now.toISOString(),
    confirmed: false,
    confidence: 0.3,
    confidenceReason: "community_speculation",
    eventType: "wipe",
    eventName: "Wipe",
    announcement:
      "Tarkov wipes are irregular. Battlestate Games announces them on their official channels.",
  };

  const enrichment = await enrichFromBlog({
    listingUrl: "https://www.escapefromtarkov.com/news",
    linkPatterns: [
      /\[([^\]]*(?:wipe|patch|update|season)[^\]]*)\]\((https?:\/\/(?:www\.)?escapefromtarkov\.com\/[^\s)"]+)\)/i,
      /\[([^\]]*(?:0\.\d+\.\d+)[^\]]*)\]\((https?:\/\/(?:www\.)?escapefromtarkov\.com\/[^\s)"]+)\)/i,
    ],
    waitFor: 4000,
  });

  return enrichment ? applyEnrichment(baseData, enrichment) : baseData;
}

export const tarkovConfig: GameScraperConfig = {
  id: "tarkov",
  name: "Escape from Tarkov",
  eventType: "wipe",
  strategy: "scraped",
  scraperFunction: scrapeTarkov,
  fallbackData: {
    lastWipe: LAST_WIPE.toISOString(),
    frequency: "Every 6–12 months (irregular)",
    confirmed: false,
    announcement:
      "Tarkov wipes are irregular. Battlestate Games announces them on their official channels.",
    eventName: "Wipe",
  },
  developer: "Battlestate Games",
  typicalCycle: "Every 6–12 months (irregular)",
};
