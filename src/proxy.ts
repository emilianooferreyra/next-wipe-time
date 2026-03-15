import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lazily initialized — only created when a request arrives and env vars are present
let wipeRatelimit: Ratelimit | null = null;
let streamRatelimit: Ratelimit | null = null;

function getRatelimit(type: "wipe" | "stream"): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null; // Redis not configured — skip rate limiting
  }

  if (type === "stream") {
    streamRatelimit ??= new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: true,
      prefix: "wipepunch:streams",
    });
    return streamRatelimit;
  }

  wipeRatelimit ??= new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
    prefix: "wipepunch:wipes",
  });
  return wipeRatelimit;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cron routes are already protected by Bearer auth — skip rate limiting
  if (pathname.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  const ratelimit = getRatelimit(pathname.startsWith("/api/streams") ? "stream" : "wipe");

  // Redis not configured — fail open so local dev keeps working
  if (!ratelimit) {
    return NextResponse.next();
  }

  try {
    const ip = getClientIp(request);
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(limit));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  } catch {
    // Rate limiter failure should never block users — fail open
    console.error("[proxy] Rate limit check failed — failing open");
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
