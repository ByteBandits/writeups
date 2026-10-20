import type { NextConfig } from "next";

// The site is built to mount at a path prefix (default /writeups on the
// repo's project Pages). A future custom-domain build sets BUILD_BASE_PATH="".
const isExport = process.env.BUILD_EXPORT === "1";
const BASE_PATH = process.env.BUILD_BASE_PATH ?? "/writeups";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  basePath: isExport ? BASE_PATH : "",
  // with output:export the static site lands IN distDir — keep it out of
  // the dev server's .next and name it as the publishable artifact
  distDir: isExport ? "dist" : ".next",
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: isExport ? BASE_PATH : "",
  },
};

export default nextConfig;
