import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/seo/site-config";
import { sitePages } from "@/lib/site-pages";

/**
 * Minimal footer: wordmark, one descriptive line, and the trust pages. The
 * links come from the trust-page registry, so the footer can only point at
 * routes that exist. Tools are reached from the header menu, not from here.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <Container className="py-8 text-sm text-zinc-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-semibold tracking-tight text-zinc-900">{siteConfig.name}</p>
            <p className="mt-1">{siteConfig.footerLine}</p>
          </div>
          <nav aria-label="Legal and contact">
            <ul className="-mx-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              {sitePages.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={page.path}
                    className="inline-flex min-h-11 items-center rounded-sm px-2 underline-offset-4 hover:text-zinc-900 hover:underline"
                  >
                    {page.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
