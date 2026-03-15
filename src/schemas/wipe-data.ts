import { z } from "zod";

export const WipeDataSchema = z.object({
  nextWipe: z.string().nullable(),
  lastWipe: z.string().nullable(),
  frequency: z.string(),
  source: z.string(),
  scrapedAt: z.string(),
  confirmed: z.boolean(),
  // Confidence score (0.0 - 1.0) indicating reliability of the data
  confidence: z.number().min(0).max(1).optional(),
  // Reason for the confidence level
  confidenceReason: z
    .enum([
      "official_announcement", // 1.0 - Post oficial del dev
      "multiple_sources_agree", // 0.9 - 3+ fuentes coinciden
      "datamined", // 0.7 - Datos del cliente
      "reputable_leaker", // 0.5 - Leaker conocido
      "community_speculation", // 0.3 - Rumores Reddit
      "estimated_pattern", // 0.1 - Basado en patrones históricos
    ])
    .optional(),
  announcement: z.string().optional(),
  eventType: z
    .enum(["league", "patch", "update", "event", "season", "wipe"])
    .optional(),
  eventName: z.string().optional(),
  isRelease: z.boolean().optional(),
  patchNotes: z.string().optional(),
  // Special events (reveals, teasers, announcements)
  specialEvents: z
    .array(
      z.object({
        name: z.string(),
        date: z.string(),
        type: z.enum([
          "reveal",
          "teaser",
          "announcement",
          "tournament",
          "beta",
        ]),
        description: z.string().optional(),
      }),
    )
    .optional(),
  // Detailed changelog with features and images
  changelog: z
    .object({
      title: z.string().optional(),
      summary: z.string().optional(),
      features: z
        .array(
          z.object({
            title: z.string(),
            description: z.string(),
            imageUrl: z.string().optional(),
            category: z.string().optional(),
          }),
        )
        .optional(),
      bugFixes: z.array(z.string()).optional(),
      balanceChanges: z.array(z.string()).optional(),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      sourceUrl: z.string().optional(),
      // Array of additional images for carousel
      images: z.array(z.string()).optional(),
    })
    .optional(),
  // Streaming events and live data
  streamingEvents: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        platform: z.enum(["twitch", "kick", "youtube"]),
        type: z.enum(["rivals", "tournament", "community_event", "subathon"]),
        streamerCount: z.number().optional(),
        prizePool: z.string().optional(),
        link: z.string(),
        imageUrl: z.string().optional(),
      }),
    )
    .optional(),
  // Video links (official announcements, trailers, etc)
  videos: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
        platform: z.enum(["youtube", "twitch"]).optional(),
        url: z.string(),
        channelName: z.string(),
        publishedAt: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        type: z
          .enum(["announcement", "trailer", "guide", "highlights"])
          .optional(),
      }),
    )
    .optional(),
  // Live streams from top streamers
  liveStreams: z
    .array(
      z.object({
        id: z.string(),
        platform: z.enum(["twitch", "youtube", "kick"]),
        channelName: z.string(),
        channelUrl: z.string(),
        embedUrl: z.string(),
        title: z.string(),
        viewerCount: z.number(),
        thumbnailUrl: z.string(),
        isLive: z.boolean(),
      }),
    )
    .optional(),
  // Custom data for additional game-specific information
  customData: z.record(z.string(), z.any()).optional(),
});

export type WipeData = z.infer<typeof WipeDataSchema>;

// ============================================
// Utility Types for WipeData
// ============================================

/**
 * Extract nested types from WipeData
 */
export type StreamingEvent = NonNullable<WipeData["streamingEvents"]>[number];
export type Video = NonNullable<WipeData["videos"]>[number];
export type LiveStream = NonNullable<WipeData["liveStreams"]>[number];
export type SpecialEvent = NonNullable<WipeData["specialEvents"]>[number];
export type ChangelogFeature = NonNullable<
  NonNullable<WipeData["changelog"]>["features"]
>[number];

/**
 * WipeData with only essential fields for previews
 */
export type WipeDataPreview = Pick<
  WipeData,
  "nextWipe" | "lastWipe" | "confirmed" | "eventType" | "eventName" | "frequency"
>;

/**
 * WipeData with required core fields
 */
export type WipeDataRequired = Required<
  Pick<WipeData, "nextWipe" | "lastWipe" | "frequency" | "source" | "scrapedAt">
>;

/**
 * WipeData with complete changelog
 */
export type WipeDataWithChangelog = WipeData & {
  changelog: NonNullable<WipeData["changelog"]>;
};

/**
 * WipeData with videos
 */
export type WipeDataWithVideos = WipeData & {
  videos: NonNullable<WipeData["videos"]>;
};

/**
 * WipeData with live streams
 */
export type WipeDataWithStreams = WipeData & {
  liveStreams: NonNullable<WipeData["liveStreams"]>;
};

/**
 * Fully populated WipeData (all optional fields present)
 */
export type CompleteWipeData = WipeDataWithChangelog &
  WipeDataWithVideos &
  WipeDataWithStreams & {
    streamingEvents: NonNullable<WipeData["streamingEvents"]>;
    specialEvents: NonNullable<WipeData["specialEvents"]>;
  };

/**
 * Partial WipeData for updates
 */
export type WipeDataUpdate = Partial<WipeData>;

/**
 * WipeData fields that can be edited
 */
export type EditableWipeData = Omit<WipeData, "scrapedAt" | "source">;

// ============================================
// Helper Functions
// ============================================

/**
 * Safely parse API responses
 */
export function parseWipeData(data: unknown): WipeData {
  return WipeDataSchema.parse(data);
}

/**
 * Helper function with error handling
 */
export function safeParseWipeData(
  data: unknown,
): { success: true; data: WipeData } | { success: false; error: z.ZodError } {
  const result = WipeDataSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Create a minimal WipeData preview
 */
export function createWipeDataPreview(data: WipeData): WipeDataPreview {
  return {
    nextWipe: data.nextWipe,
    lastWipe: data.lastWipe,
    confirmed: data.confirmed,
    eventType: data.eventType,
    eventName: data.eventName,
    frequency: data.frequency,
  };
}
