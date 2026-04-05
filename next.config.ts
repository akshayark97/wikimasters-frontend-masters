import type { NextConfig } from "next";
import { dirname } from "node:path";

const nextConfig: NextConfig = {
  /** This helps Turbopack know where its root is, 
    and it can get confused if you have multiple Next.js 
    projects shoved into one repo like I do. 
    Normally Turbopack has no problem figuring this out. */
  turbopack: {
    root: dirname(__filename),
  },
};

export default nextConfig;
