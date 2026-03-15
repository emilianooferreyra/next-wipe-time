import type { WipeData } from "@/schemas/wipe-data";
import {
  advanceToFuture,
  applyEnrichment,
  enrichFromBlog,
  prevCycleDate,
} from "../blog-parser";
import type { GameScraperConfig } from "../types";

// Fortnite Chapter 6 Season 1 launched December 1, 2024.
// Seasons last approximately 10–12 weeks.
const LAST_SEASON = new Date("2024-12-01T00:00:00Z");
const CYCLE_DAYS = 84; // 12 weeks

async function scrapeFortnite(): Promise<WipeData> {
  const now = new Date();
  const nextWipe = advanceToFuture(LAST_SEASON, CYCLE_DAYS);
  const lastWipe = prevCycleDate(nextWipe, CYCLE_DAYS);

  const baseData: WipeData = {
    nextWipe: nextWipe.toISOString(),
    lastWipe: lastWipe.toISOString(),
    frequency: "Every 10–12 weeks",
    source: "fortnite.com (Pattern Estimate)",
    scrapedAt: now.toISOString(),
    confirmed: false,
    confidence: 0.7,
    confidenceReason: "estimated_pattern",
    eventType: "season",
    eventName: "New Season",
    announcement: "Fortnite seasons typically last 10–12 weeks.",
  };

  const enrichment = await enrichFromBlog({
    listingUrl: "https://www.fortnite.com/en-US/news",
    linkPatterns: [
      /\[([^\]]*(?:new\s+season|chapter|season\s+\d+|battle\s+pass)[^\]]*)\]\((https?:\/\/(?:www\.)?fortnite\.com\/[^\s)"]+)\)/i,
      /\[([^\]]*(?:update|patch|v\d+\.\d+)[^\]]*)\]\((https?:\/\/(?:www\.)?fortnite\.com\/[^\s)"]+)\)/i,
    ],
    waitFor: 5000,
  });

  return enrichment ? applyEnrichment(baseData, enrichment) : baseData;
}

export const fortniteConfig: GameScraperConfig = {
  id: "fortnite",
  name: "Fortnite",
  eventType: "season",
  strategy: "scraped",
  scraperFunction: scrapeFortnite,
  fallbackData: {
    frequency: "Every 10–12 weeks",
    confirmed: false,
    announcement: "Fortnite seasons typically last 10–12 weeks.",
    eventName: "New Season",
  },
  developer: "Epic Games",
  typicalCycle: "Every 10–12 weeks",
};
