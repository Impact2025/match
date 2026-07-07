import type { MetadataRoute } from "next"

const BASE = "https://vrijwilligersmatch.nl"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/(dashboard)",
          "/(organisation)",
          "/(auth)",
          "/dashboard",
          "/auth",
          "/onboarding",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
