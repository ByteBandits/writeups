import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // static export only for production builds — dev runs dynamically,
  // which avoids export-mode param strictness that doesn't affect builds
  output: process.env.BUILD_EXPORT === "1" ? "export" : undefined,
  // keep production builds out of the dev server's cache dir
  distDir: process.env.BUILD_EXPORT === "1" ? ".next-build" : ".next",
  trailingSlash: true,
  images: { unoptimized: true },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
