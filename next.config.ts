import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev server listens on 0.0.0.0, so a browser on 127.0.0.1 is treated as
  // cross-origin. Without this, Next blocks the HMR socket and client chunks,
  // and the page never hydrates.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
