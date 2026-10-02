import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const cacheHeaders = [
  {
    source: "/_next/static/(.*)",
    headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
  },
  {
    source: "/uploads/(.*)",
    headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
  },
  {
    source: "/(favicon\\.ico|icon\\.png|apple-touch-icon\\.png)",
    headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Image optimization - convert to AVIF/WebP automatically.
  // No external domains configured: CDN is prohibited, all images served locally.
  images: {
    // Cap device sizes so full-bleed `sizes="100vw"` images (hero) never
    // request near-source passthrough widths (2048/3840) on mobile: the
    // largest candidate is 1920w and mobile lands on a modest ~828–1080w.
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    formats: ["image/webp"],
    minimumCacheTTL: 86400,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      ...cacheHeaders,
    ];
  },
};

export default nextConfig;
