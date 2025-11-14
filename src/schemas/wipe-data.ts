import { z } from "zod";

export const WipeDataSchema = z.object({
  nextWipe: z.string().nullable(),
  lastWipe: z.string().nullable(),
  frequency: z.string(),
  source: z.string(),
  scrapedAt: z.string(),
  confirmed: z.boolean(),
  announcement: z.string().optional(),
  eventType: z.enum(["league", "patch", "update", "event", "season"]).optional(),
  eventName: z.string().optional(),
  isRelease: z.boolean().optional(),
  // Special events (reveals, teasers, announcements)
  specialEvents: z.array(z.object({
    name: z.string(),
    date: z.string(),
    type: z.enum(["reveal", "teaser", "announcement", "tournament", "beta"]),
    description: z.string().optional(),
  })).optional(),
});

export type WipeData = z.infer<typeof WipeDataSchema>;

// Helper function to safely parse API responses
export function parseWipeData(data: unknown): WipeData {
  return WipeDataSchema.parse(data);
}

// Helper function with error handling
export function safeParseWipeData(data: unknown): { success: true; data: WipeData } | { success: false; error: z.ZodError } {
  const result = WipeDataSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
