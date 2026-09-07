import type { Metadata } from "next";

import { siteConfig } from "./site-config";

/**
 * The single Open Graph card for the whole site, rendered by
 * `src/app/opengraph-image.tsx`, which reads its `alt`, `size` and
 * `contentType` from here so the picture and the tags describing it cannot
 * drift apart.
 *
 * The URL is deliberately relative. Next resolves it against `metadataBase`
 * in the root layout, which comes from `getSiteUrl()`, so no origin is
 * hard-coded and each environment emits its own absolute URL.
 */
export const ogImage = {
  // ?v=N busts social-network image caches, which key on the URL. Increment it
  // whenever the card is materially redesigned.
  url: "/opengraph-image?v=1",
  type: "image/png",
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} – ${siteConfig.tagline}`,
} as const;

/** Large-image card, matching the 1200×630 Open Graph image. */
export const twitterCard = "summary_large_image" as const;

interface PageMetadataInput {
  title: string;
  description: string;
  /** Site-relative path used for the canonical URL, e.g. "/pdf-to-jpg". */
  path: string;
}

/**
 * Builds per-page metadata with a canonical URL and Open Graph fields.
 * Relative URLs resolve against `metadataBase` set in the root layout.
 *
 * A page that declares `openGraph` replaces the parent's object wholesale,
 * which drops the image the `opengraph-image` file convention would
 * otherwise contribute. Every page therefore restates the shared card here,
 * for Open Graph and for Twitter alike; only the title, description and URL
 * differ per page.
 */
export function buildPageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      type: "website",
      locale: siteConfig.locale,
      images: [ogImage],
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: [ogImage],
    },
  };
}
