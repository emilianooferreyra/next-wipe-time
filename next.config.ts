import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  // Prevents MIME-type sniffing attacks
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Prevents our pages from being embedded in iframes by third parties
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Sends minimal referrer info to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Only allow HTTPS connections (1 year, include subdomains)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Disable browser-based XSS detection (superseded by CSP, but kept for old browsers)
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },

  images: {
    // Explicit allowlist — never use wildcard ("**") in production
    remotePatterns: [
      // Twitch live stream thumbnails
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net",
      },
      // YouTube video thumbnails
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      // Kick stream thumbnails
      {
        protocol: "https",
        hostname: "kick.com",
      },
      // Path of Exile CDN (game images, news headers)
      {
        protocol: "https",
        hostname: "web.poecdn.com",
      },
      // Steam CDN via Cloudflare (game header images)
      {
        protocol: "https",
        hostname: "cdn.cloudflare.steamstatic.com",
      },
      // Steam CDN via Akamai (game header images)
      {
        protocol: "https",
        hostname: "cdn.akamai.steamstatic.com",
      },
    ],
  },
};

export default nextConfig;
