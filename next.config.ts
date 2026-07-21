import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      // Admin image uploads go through Server Actions — default 1MB is too
      // small for high-res product/banner photography, and a banner upload
      // can post both a desktop and mobile image in one request.
      bodySizeLimit: "25mb",
    },
    // proxy.ts gates /admin/:path* behind Basic Auth, which makes Next.js
    // clone/buffer every proxied request body (silently truncated past this
    // limit) — separate from serverActions.bodySizeLimit above. Must be at
    // least as large or large uploads get truncated before reaching the
    // Server Action, surfacing as a cryptic "Unexpected end of form" error.
    proxyClientMaxBodySize: "25mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
