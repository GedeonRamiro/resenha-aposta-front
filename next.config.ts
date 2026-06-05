import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  allowedDevOrigins,
  async rewrites() {
    return isDevelopment
      ? [
          {
            source: "/backend/:path*",
            destination: "http://localhost:8000/:path*",
          },
        ]
      : [];
  },
};

export default nextConfig;
