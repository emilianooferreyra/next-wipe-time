/**
 * Shared blog/news parsing utilities for all game scraper configs.
 *
 * Pattern: estimate next event date mathematically, then try to enrich
 * from an official blog/news page via Firecrawl.
 */

import type { WipeData } from "@/schemas/wipe-data";
import {
  extractImagesFromMarkdown,
  firecrawlScrape,
} from "@/lib/firecrawl-client";

// ── Date Helpers ───────────────────────────────────────────────────────────

/**
 * Advance `anchor` by `cycleDays` until the result is in the future.
 * Safe to call even when anchor is far in the past.
 */
export function advanceToFuture(anchor: Date, cycleDays: number): Date {
  const now = new Date();
  const result = new Date(anchor);
  while (result <= now) {
    result.setDate(result.getDate() + cycleDays);
  }
  return result;
}

/**
 * Step back one cycle from a future date to get the previous event.
 */
export function prevCycleDate(nextDate: Date, cycleDays: number): Date {
  const prev = new Date(nextDate);
  prev.setDate(prev.getDate() - cycleDays);
  return prev;
}

// ── Markdown Parsing ───────────────────────────────────────────────────────

/** First plain paragraph (not heading / image / empty). */
export function extractSummary(markdown: string): string {
  for (const line of markdown.split("\n")) {
    const t = line.trim();
    if (t && !t.startsWith("#") && !t.startsWith("!") && !t.startsWith("[")) {
      return t.slice(0, 300);
    }
  }
  return "";
}

/**
 * Parse `##` sections into feature objects (title + first paragraph + first image).
 * Capped at 8 features.
 */
export function parseFeatures(
  markdown: string,
): NonNullable<NonNullable<WipeData["changelog"]>["features"]> {
  return markdown
    .split(/^##\s+/m)
    .slice(1, 9) // drop preamble, cap at 8 features
    .map((section) => {
      const lines = section.split("\n");
      const title = lines[0]?.trim() ?? "";
      let description = "";
      for (const line of lines.slice(1)) {
        const t = line.trim();
        if (t && !t.startsWith("!") && !t.startsWith("#")) {
          description = t.slice(0, 200);
          break;
        }
      }
      const imgMatch = section.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
      return { title, description, imageUrl: imgMatch?.[1] };
    })
    .filter((f) => f.title && f.description);
}

/** Extract bullet-point bug fixes from a "Bug Fixes" or "Fixes" section. */
export function parseBugFixes(markdown: string): string[] {
  const m = markdown.match(
    /##\s+(?:Bug\s+)?Fixes([\s\S]*?)(?=\n##|\n#[^#]|$)/i,
  );
  if (!m) return [];
  return m[1]
    .split("\n")
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter((l) => l.length > 4 && l.length < 200)
    .slice(0, 20);
}

/**
 * Try to parse an explicit event start date from announcement text.
 * Returns null if nothing found.
 */
export function extractEventDateFromText(text: string): Date | null {
  const patterns = [
    /(?:season|league|wipe|ladder|update)\s+(?:begins?|starts?|launches?|goes?\s+live)[^.]*?(\w+ \d{1,2}(?:st|nd|rd|th)?,?\s*\d{4})/i,
    /(?:starts?|launches?|begins?|goes?\s+live)[^.]*?on\s+(\w+ \d{1,2}(?:st|nd|rd|th)?,?\s*\d{4})/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const cleaned = m[1].replace(/(\d+)(st|nd|rd|th)/i, "$1");
      const parsed = new Date(cleaned);
      if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2024) {
        return parsed;
      }
    }
  }
  return null;
}

// ── Blog Enrichment ────────────────────────────────────────────────────────

export interface BlogEnrichment {
  nextWipe?: string;
  confirmed: boolean;
  confidence: number;
  confidenceReason: "official_announcement";
  source: string;
  changelog: NonNullable<WipeData["changelog"]>;
}

/**
 * Turn a scraped blog post into enrichment data.
 */
export function parseBlogPost(
  postMarkdown: string,
  postTitle: string,
  postUrl: string,
): BlogEnrichment {
  const images = extractImagesFromMarkdown(postMarkdown);
  const features = parseFeatures(postMarkdown);
  const bugFixes = parseBugFixes(postMarkdown);
  const summary = extractSummary(postMarkdown);
  const explicitDate = extractEventDateFromText(postMarkdown);

  return {
    nextWipe: explicitDate?.toISOString(),
    confirmed: true,
    confidence: 1.0,
    confidenceReason: "official_announcement",
    source: `Official Blog (${postTitle})`,
    changelog: {
      title: postTitle,
      summary: summary || undefined,
      features: features.length ? features : undefined,
      bugFixes: bugFixes.length ? bugFixes : undefined,
      images: images.slice(0, 8),
      imageUrl: images[0],
      sourceUrl: postUrl,
    },
  };
}

export interface BlogFindConfig {
  /** Blog/news listing URL to scrape first. */
  listingUrl: string;
  /**
   * Each regex must have:
   *   group 1 = post title
   *   group 2 = post URL
   * Applied against the listing page markdown to find the most recent relevant post.
   */
  linkPatterns: RegExp[];
  /** ms to wait for JS to render the listing page (default 0 — fine for SSR sites). */
  waitFor?: number;
}

/**
 * Merge enrichment data onto baseData. Preserves baseData.nextWipe if the
 * blog post didn't mention an explicit date.
 */
export function applyEnrichment(
  baseData: WipeData,
  enrichment: BlogEnrichment,
): WipeData {
  return {
    ...baseData,
    nextWipe: enrichment.nextWipe ?? baseData.nextWipe,
    confirmed: enrichment.confirmed,
    confidence: enrichment.confidence,
    confidenceReason: enrichment.confidenceReason,
    source: enrichment.source,
    changelog: enrichment.changelog,
  };
}

/**
 * Scrape a listing page, find the most recent relevant post, scrape it,
 * and return enrichment data. Returns null on any failure.
 */
export async function enrichFromBlog(
  cfg: BlogFindConfig,
): Promise<BlogEnrichment | null> {
  try {
    const listingResult = await firecrawlScrape({
      url: cfg.listingUrl,
      formats: ["markdown"],
      onlyMainContent: true,
      waitFor: cfg.waitFor ?? 0,
    });

    if (!listingResult.success || !listingResult.data?.markdown) return null;

    const markdown = listingResult.data.markdown;
    let postUrl: string | null = null;
    let postTitle: string | null = null;

    for (const pattern of cfg.linkPatterns) {
      const m = pattern.exec(markdown);
      if (m) {
        postTitle = m[1].trim();
        postUrl = m[2];
        break;
      }
    }

    if (!postUrl || !postTitle) return null;

    console.log(`[blog-parser] "${postTitle}" → ${postUrl}`);

    const postResult = await firecrawlScrape({
      url: postUrl,
      formats: ["markdown"],
      onlyMainContent: true,
    });

    if (!postResult.success || !postResult.data?.markdown) return null;

    return parseBlogPost(postResult.data.markdown, postTitle, postUrl);
  } catch (err) {
    console.error("[blog-parser] enrichFromBlog failed:", err);
    return null;
  }
}
