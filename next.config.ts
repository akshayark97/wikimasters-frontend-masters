import { dirname } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** This helps Turbopack know where its root is, 
    and it can get confused if you have multiple Next.js 
    projects shoved into one repo like I do. 
    Normally Turbopack has no problem figuring this out. */
  turbopack: {
    root: dirname(__filename),
  },
  images: {
    remotePatterns: [new URL(`${process.env.BLOB_BASE_URL}`)]
  }
};

export default nextConfig;
