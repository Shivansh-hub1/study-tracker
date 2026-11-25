/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3", "@libsql/client"],
    optimizePackageImports: ["lucide-react", "recharts", "jose"],
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === "edge") {
      // Stub Node-only optional/local-dev deps out of edge bundles so esbuild in next-on-pages never sees them
      config.resolve.alias = {
        ...config.resolve.alias,
        fs: false,
        path: false,
        "better-sqlite3": false,
        "@libsql/client$": false,
        nodemailer: false,
        "web-push": false,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        http: false,
        https: false,
        net: false,
        tls: false,
        stream: false,
        zlib: false,
      };
    }
    return config;
  },
  async redirects() {
    return [
      { source: "/focus-timer", destination: "/timer", permanent: true },
      { source: "/pomodoro", destination: "/timer", permanent: true },
      { source: "/focus", destination: "/timer", permanent: true },
      { source: "/stopwatch", destination: "/timer", permanent: true },
      { source: "/planner", destination: "/revision", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*.svg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*.webp",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*.woff2",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400" },
          { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400" },
          { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400" },
          { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/opengraph-image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400" },
          { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/llms.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400" },
          { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/about",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/privacy",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/terms",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/blog/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/dsa-tracker",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/webdev-tracker",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/study-tracker",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
          { key: "Vercel-CDN-Cache-Control", value: "public, max-age=86400, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
