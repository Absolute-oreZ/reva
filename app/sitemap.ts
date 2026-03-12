import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://reva-khaki.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "hourly",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/globe`,
            lastModified: new Date(),
            changeFrequency: "always",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/echoes`,
            lastModified: new Date(),
            changeFrequency: "always",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/echoes/new`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
    ];
}