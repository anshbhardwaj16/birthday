import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't pick up the lockfile in the parent folder.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
