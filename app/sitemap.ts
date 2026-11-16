import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";

// A single page; the books are part of it, so there is one entry.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl().href, changeFrequency: "monthly", priority: 1 }];
}
