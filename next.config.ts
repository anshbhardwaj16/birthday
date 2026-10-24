import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  images: {
    unoptimized: true,
  },
  // Pin the workspace root so Turbopack doesn't pick up the lockfile in the parent folder.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
