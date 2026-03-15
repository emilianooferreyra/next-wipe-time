import type { WipeData } from "@/schemas/wipe-data";
import { applyEnrichment, enrichFromBlog } from "../blog-parser";
import type { GameScraperConfig } from "../types";

// ── Date Math ──────────────────────────────────────────────────────────────

/** First Thursday of a UTC month at 19:00 UTC. */
function firstThursdayUTC(year: number, month: number): Date {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (4 - first.getUTCDay() + 7) % 7;
  return new Date(Date.UTC(year, month, 1 + offset, 19, 0, 0));
}

function calcNextWipe(from: Date): Date {
  const y = from.getUTCFullYear();
  const m = from.getUTCMonth();
  const candidate = firstThursdayUTC(y, m);
  if (candidate > from) return candidate;
  return firstThursdayUTC(y, m + 1);
}

function calcPrevWipe(nextWipe: Date): Date {
  return firstThursdayUTC(
    nextWipe.getUTCFullYear(),
    nextWipe.getUTCMonth() - 1,
  );
}

// ── Scraper Function ───────────────────────────────────────────────────────

async function scrapeRust(): Promise<WipeData> {
  const now = new Date();
  const nextWipe = calcNextWipe(now);
  const lastWipe = calcPrevWipe(nextWipe);

  const baseData: WipeData = {
    nextWipe: nextWipe.toISOString(),
    lastWipe: lastWipe.toISOString(),
    frequency: "Monthly (First Thursday at 7PM UTC)",
    source: "Facepunch Studios (Official Schedule)",
    scrapedAt: now.toISOString(),
    confirmed: true,
    confidence: 0.85,
    confidenceReason: "estimated_pattern",
    eventType: "wipe",
    eventName: "Forced Wipe",
    announcement:
      "Facepunch official servers wipe on the first Thursday of each month at 19:00 UTC",
  };

  const enrichment = await enrichFromBlog({
    listingUrl: "https://rust.facepunch.com/blog",
    linkPatterns: [
      /\[([^\]]*(?:forced\s*wipe|monthly\s*update|devblog)[^\]]*)\]\((https?:\/\/rust\.facepunch\.com\/blog\/[^\s)"]+)\)/i,
      /\[([^\]]*patch[^\]]*)\]\((https?:\/\/rust\.facepunch\.com\/blog\/[^\s)"]+)\)/i,
    ],
    // Facepunch blog is server-rendered — no JS wait needed
    waitFor: 0,
  });

  return enrichment ? applyEnrichment(baseData, enrichment) : baseData;
}

// ── Config Export ──────────────────────────────────────────────────────────

export const rustConfig: GameScraperConfig = {
  id: "rust",
  name: "Rust",
  eventType: "wipe",
  strategy: "scraped",
  scraperFunction: scrapeRust,
  fallbackData: {
    frequency: "Monthly (First Thursday at 7PM UTC)",
    confirmed: true,
    announcement:
      "Facepunch official servers wipe on the first Thursday of each month at 19:00 UTC",
    eventName: "Forced Wipe",
  },
  developer: "Facepunch Studios",
  typicalCycle: "Monthly (First Thursday at 7PM UTC)",
};
