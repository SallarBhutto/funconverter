export interface SitePageDefinition {
  slug: string;
  path: `/${string}`;
  /** Full page name, used for the H1 and metadata title. */
  name: string;
  /** Short label used in the footer, where space is tight. */
  shortName: string;
}

/**
 * Registry of the public trust pages: privacy, terms and contact. These are
 * not tools, so they are deliberately kept out of `src/lib/tools.ts` and out
 * of the tools menu. The footer and the sitemap both read this list, so the
 * three routes cannot drift apart.
 */
export const sitePages: readonly SitePageDefinition[] = [
  {
    slug: "privacy",
    path: "/privacy",
    name: "Privacy Policy",
    shortName: "Privacy",
  },
  {
    slug: "terms",
    path: "/terms",
    name: "Terms of Use",
    shortName: "Terms",
  },
  {
    slug: "contact",
    path: "/contact",
    name: "Contact",
    shortName: "Contact",
  },
];
