import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so an unrelated lockfile elsewhere on the machine
  // doesn't get inferred as the project root.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
