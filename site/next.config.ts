import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // static export only for production builds — dev runs dynamically,
  // which avoids export-mode param strictness that doesn't affect builds
  output: process.env.BUILD_EXPORT === "1" ? "export" : undefined,
  // with output:export the static site lands IN distDir — keep it out of
  // the dev server's .next and name it as the publishable artifact
  distDir: process.env.BUILD_EXPORT === "1" ? "dist" : ".next",
  trailingSlash: true,
  images: { unoptimized: true },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
