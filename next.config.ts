import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Next.js blocks cross-origin requests to dev-only assets/endpoints by
  // default — loading the dev server from a phone on the LAN (e.g.
  // http://192.168.0.103:3000) renders the initial HTML fine, but every JS
  // asset request that follows gets silently blocked because it doesn't
  // come from "localhost", so the page never hydrates and nothing is
  // clickable. This only relaxes that check in development; it has no
  // effect on a production build.
  allowedDevOrigins: ["192.168.0.103", "*.local"],
  experimental: {
    serverActions: {
      // Admin image uploads go through Server Actions — default 1MB is too
      // small for high-res product/banner photography, and a banner upload
      // can post both a desktop and mobile image in one request.
      bodySizeLimit: "25mb",
    },
    // proxy.ts matches /admin/:path*, which makes Next.js clone/buffer every
    // proxied request body (silently truncated past this limit) regardless
    // of what the proxy itself does — separate from serverActions.bodySizeLimit
    // above. Must be at least as large or large uploads get truncated before
    // reaching the Server Action, surfacing as a cryptic "Unexpected end of
    // form" error.
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
  async headers() {
    const commonHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    // CSP is production-only: Turbopack's dev runtime relies on patterns
    // (eval-based HMR, inline bootstrap) that a strict policy would break,
    // and dev builds never see real traffic anyway. `unsafe-inline` on
    // script-src is a known relaxation for Next's own inline bootstrap data —
    // tighten with nonces in a later hardening pass.
    if (process.env.NODE_ENV !== "production") {
      return [{ source: "/:path*", headers: commonHeaders }];
    }

    const csp = [
      "default-src 'self'",
      // vercel.live: Vercel auto-injects its preview-deployment toolbar
      // script on every preview URL — harmless, but blocked (and noisy in
      // the console) without this. Has no effect on the eventual production
      // domain, where Vercel doesn't inject it.
      "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://www.google.com https://apis.google.com https://checkout.razorpay.com https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://res.cloudinary.com https://www.gstatic.com https://www.google.com https://*.razorpay.com",
      "font-src 'self' data:",
      // www.google.com/www.gstatic.com: Firebase Phone Auth's invisible
      // reCAPTCHA makes its actual verification calls to these — script-src
      // trusts them enough to load the reCAPTCHA script, but without them
      // here too the script loads and then every network call it makes gets
      // silently blocked, which is what broke phone login in production
      // (CSP is dev-disabled, so this never surfaced locally).
      "connect-src 'self' https://*.googleapis.com https://*.razorpay.com https://www.google.com https://www.gstatic.com",
      "frame-src 'self' https://www.google.com https://*.firebaseapp.com https://api.razorpay.com https://checkout.razorpay.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          ...commonHeaders,
          { key: "Content-Security-Policy", value: csp },
          // Browsers ignore this over plain HTTP, so it's harmless in any
          // non-HTTPS environment — kept here rather than in commonHeaders
          // purely because it's meaningless outside of production anyway.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
