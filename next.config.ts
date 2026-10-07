import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // SOP-3V-04: 构建期日期常量（sitemap 静态条目 lastmod 用）——构建时内联一次，
  // 运行期零 new Date()，防 ISR 冷启动时间戳漂移。
  env: {
    BUILD_TIME: new Date().toISOString().slice(0, 10),
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "roblox-gui-maker.online", pathname: "/**" },
      { protocol: "https", hostname: "cdn.roblox-gui-maker.online", pathname: "/**" },
      { protocol: "https", hostname: "tr.rbxcdn.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000,
  },

  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tooltip",
      "lucide-react",
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/templates/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;