import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    // Pin the workspace root so a lockfile in a parent directory is not picked up.
    root: import.meta.dirname,
  },
};

export default nextConfig;
