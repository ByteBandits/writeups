import type { MetadataRoute } from "next";
import { getAllWriteups, writeupUrl } from "@/lib/content";

export const dynamic = "force-static";

const BASE = "https://writeups.bytebandits.live";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE + "/", changeFrequency: "weekly" },
    { url: BASE + "/writeups/", changeFrequency: "weekly" },
    ...getAllWriteups().map((w) => ({
      url: BASE + writeupUrl(w),
      lastModified: w.updated,
    })),
  ];
}
