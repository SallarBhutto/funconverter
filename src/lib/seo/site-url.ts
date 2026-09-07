const DEVELOPMENT_SITE_URL = "http://localhost:3000";

/**
 * Normalizes a configured host or URL to a bare origin such as
 * "https://example.com". Adds "https://" when no scheme is present and drops
 * any path, query, or trailing slash. Returns null for empty or invalid input.
 */
function toOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  const withScheme = hasScheme ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Returns the public site origin without a trailing slash. This is the single
 * source for metadataBase, canonical URLs, Open Graph URLs, robots.txt and
 * sitemap.xml.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL — explicit product URL, always wins.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel production domain, when deployed
 *      there without an explicit URL.
 *   3. VERCEL_URL — Vercel deployment host.
 *   4. http://localhost:3000 — local development.
 *
 * Production sets NEXT_PUBLIC_SITE_URL to the canonical FileHush domain (see
 * docs/product.md and .env.example). It takes precedence over
 * Vercel-generated domains. None of these variables are secrets.
 */
export function getSiteUrl(): string {
  return (
    toOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    toOrigin(process.env.VERCEL_URL) ??
    DEVELOPMENT_SITE_URL
  );
}

/** Builds an absolute URL for a site-relative path such as "/pdf-to-jpg". */
export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
