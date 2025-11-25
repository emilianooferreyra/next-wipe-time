import { z } from "zod";

export const WipeDataSchema = z.object({
  nextWipe: z.string().nullable(),
  lastWipe: z.string().nullable(),
  frequency: z.string(),
  source: z.string(),
  scrapedAt: z.string(),
  confirmed: z.boolean(),
  announcement: z.string().optional(),
  eventType: z
    .enum(["league", "patch", "update", "event", "season"])
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
          })
        )
        .optional(),
      bugFixes: z.array(z.string()).optional(),
      balanceChanges: z.array(z.string()).optional(),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      sourceUrl: z.string().optional(),
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
      })
    )
    .optional(),
  // Video links (official announcements, trailers, etc)
  videos: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        platform: z.enum(["youtube", "twitch"]),
        url: z.string(),
        channelName: z.string(),
        publishedAt: z.string(),
        thumbnailUrl: z.string().optional(),
        type: z.enum(["announcement", "trailer", "guide", "highlights"]),
      })
    )
    .optional(),
});

export type WipeData = z.infer<typeof WipeDataSchema>;

// Helper function to safely parse API responses
export function parseWipeData(data: unknown): WipeData {
  return WipeDataSchema.parse(data);
}

// Helper function with error handling
export function safeParseWipeData(
  data: unknown,
): { success: true; data: WipeData } | { success: false; error: z.ZodError } {
  const result = WipeDataSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
