/**
 * Central site configuration. Product copy lives here so that layout,
 * metadata, and SEO routes never hard-code it. Navigation derives from the
 * tool registry in `src/lib/tools.ts`, so it only ever points at live routes.
 *
 * "FileHush" is the public brand. The repository and package keep the
 * technical name `file-converter-web`. The production origin is not stored
 * here; it comes from `NEXT_PUBLIC_SITE_URL` via `getSiteUrl()`.
 */
export const siteConfig = {
  name: "FileHush",
  tagline: "Free file tools. No sign-up. Your files never leave your device.",
  /** Homepage and default document title. */
  title: "FileHush – Free File Converter & Compressor",
  description:
    "Convert and compress PDFs and images for free with FileHush. No sign-up or file uploads. Your files are processed locally in your browser.",
  /** Short line for the footer. */
  footerLine: "Private, browser-based file tools.",
  locale: "en_US",
  /**
   * The person who operates FileHush. It is run personally, not through a
   * registered company, so this is the only entity named on the site.
   */
  operator: "Sallar Hussain Bhutto",
  /**
   * The one public contact address, used by the Contact page and the privacy
   * and terms pages. No other address is published anywhere on the site.
   */
  contactEmail: "sallar0501@gmail.com",
  /**
   * Effective date shown on the Privacy Policy and Terms of Use. It is a
   * fixed, human-readable date, not a build timestamp: change it only when
   * the wording of those pages actually changes.
   */
  legalEffectiveDate: "September 8, 2026",
} as const;
