import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/dashboard`, changeFrequency: "daily", priority: 0.9 },
    {
      url: `${base}/dashboard/clients`,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${base}/dashboard/projects`,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${base}/dashboard/invoices`,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${base}/dashboard/settings`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
