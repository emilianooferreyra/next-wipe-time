/**
 * Firecrawl API Client
 *
 * Direct integration with Firecrawl API for server-side scraping
 * This runs in Next.js API routes, not MCP
 */
import { z } from "zod";

const FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v1";

// ── Zod Schemas ────────────────────────────────────────────────────────────

const MetadataSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    sourceURL: z.string().optional(),
    statusCode: z.number().optional(),
  })
  .passthrough();

const ScrapeDataSchema = z
  .object({
    markdown: z.string().optional(),
    html: z.string().optional(),
    rawHtml: z.string().optional(),
    links: z.array(z.string()).optional(),
    screenshot: z.string().optional(),
    metadata: MetadataSchema.optional(),
  })
  .passthrough();

const ScrapeResponseSchema = z.object({
  success: z.boolean(),
  data: ScrapeDataSchema.optional(),
});

const SearchItemSchema = z
  .object({
    url: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    markdown: z.string().optional(),
    html: z.string().optional(),
  })
  .passthrough();

const SearchResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(SearchItemSchema).optional(),
});

const ExtractResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
});

// ── Inferred Types ──────────────────────────────────────────────────────────

export type FirecrawlScrapeResult = z.infer<typeof ScrapeResponseSchema>;
export type FirecrawlSearchResult = z.infer<typeof SearchResponseSchema>;
export type FirecrawlExtractResult = z.infer<typeof ExtractResponseSchema>;

// ── Request Options ────────────────────────────────────────────────────────

export interface FirecrawlScrapeOptions {
  url: string;
  formats?: Array<"markdown" | "html" | "rawHtml" | "links" | "screenshot">;
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  waitFor?: number;
}

export interface FirecrawlSearchOptions {
  query: string;
  limit?: number;
  lang?: string;
  country?: string;
}

export interface FirecrawlExtractOptions {
  urls: string[];
  prompt: string;
  schema?: unknown;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function requireApiKey(): string {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY is not set");
  return key;
}

async function parseResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
  label: string
): Promise<T> {
  if (!response.ok) {
    // Don't expose raw API error text to callers — log server-side only
    const text = await response.text().catch(() => "");
    console.error(`[firecrawl] ${label} failed (${response.status}):`, text);
    throw new Error(`${label} failed: ${response.status}`);
  }

  const raw: unknown = await response.json();
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    console.error(`[firecrawl] ${label} unexpected response shape:`, parsed.error.format());
    throw new Error(`${label}: unexpected response shape from Firecrawl API`);
  }

  return parsed.data;
}

// ── Public API ─────────────────────────────────────────────────────────────

// Deduplicates concurrent calls to the same URL+options (e.g. PoE and PoE2
// both scraping pathofexile.com/news in the same cron run).
const inflightScrapes = new Map<string, Promise<FirecrawlScrapeResult>>();

/**
 * Scrape a single URL. Concurrent calls with identical options share one request.
 */
export async function firecrawlScrape(
  options: FirecrawlScrapeOptions
): Promise<FirecrawlScrapeResult> {
  const key = JSON.stringify({
    url: options.url,
    formats: options.formats ?? ["markdown"],
    onlyMainContent: options.onlyMainContent ?? true,
    waitFor: options.waitFor ?? 0,
  });

  const existing = inflightScrapes.get(key);
  if (existing) return existing;

  const apiKey = requireApiKey();

  const promise = fetch(`${FIRECRAWL_BASE_URL}/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url: options.url,
      formats: options.formats ?? ["markdown"],
      onlyMainContent: options.onlyMainContent ?? true,
      includeTags: options.includeTags,
      excludeTags: options.excludeTags,
      waitFor: options.waitFor,
    }),
  })
    .then((r) => parseResponse(r, ScrapeResponseSchema, "firecrawlScrape"))
    .finally(() => inflightScrapes.delete(key));

  inflightScrapes.set(key, promise);
  return promise;
}

/**
 * Search the web
 */
export async function firecrawlSearch(
  options: FirecrawlSearchOptions
): Promise<FirecrawlSearchResult> {
  const apiKey = requireApiKey();

  const response = await fetch(`${FIRECRAWL_BASE_URL}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: options.query,
      limit: options.limit ?? 5,
      lang: options.lang,
      country: options.country,
    }),
  });

  return parseResponse(response, SearchResponseSchema, "firecrawlSearch");
}

/**
 * Extract structured data from URLs
 */
export async function firecrawlExtract(
  options: FirecrawlExtractOptions
): Promise<FirecrawlExtractResult> {
  const apiKey = requireApiKey();

  const response = await fetch(`${FIRECRAWL_BASE_URL}/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      urls: options.urls,
      prompt: options.prompt,
      schema: options.schema,
    }),
  });

  return parseResponse(response, ExtractResponseSchema, "firecrawlExtract");
}

/**
 * Helper: Extract images from markdown
 */
export function extractImagesFromMarkdown(markdown: string): string[] {
  const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
  const images: string[] = [];
  let match: RegExpExecArray | null;

  do {
    match = imageRegex.exec(markdown);
    if (match) {
      images.push(match[1]);
    }
  } while (match !== null);

  return images;
}

/**
 * Helper: Extract links from markdown
 */
export function extractLinksFromMarkdown(markdown: string): Array<{
  text: string;
  url: string;
}> {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const links: Array<{ text: string; url: string }> = [];
  let match: RegExpExecArray | null;

  do {
    match = linkRegex.exec(markdown);
    if (match) {
      links.push({
        text: match[1],
        url: match[2],
      });
    }
  } while (match !== null);

  return links;
}

/**
 * Helper: Parse date from various formats
 */
export function parseGameDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  try {
    const cleaned = dateStr
      .replace(/(\d+)(st|nd|rd|th)/, "$1") // Remove ordinals
      .trim();

    const date = new Date(cleaned);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}
