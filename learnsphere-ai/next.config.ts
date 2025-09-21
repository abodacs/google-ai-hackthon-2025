import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Netlify deployment
  output: "export",

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes are handled consistently
  trailingSlash: true,

  // Configure asset prefix for static export
  assetPrefix: process.env.NODE_ENV === "production" ? "" : "",

  // Turbopack configuration (replaces experimental.turbo)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
