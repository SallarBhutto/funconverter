import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/seo/site-config";
import { getToolsByCategory, toolCategories, toolCategoryLabels } from "@/lib/tools";

import { BrandSymbol } from "./brand-symbol";
import { ToolsMenu, type ToolsMenuGroup } from "./tools-menu";

/** Registry-derived groups for the tools menu; categories with no live tool are skipped. */
function buildMenuGroups(): ToolsMenuGroup[] {
  return toolCategories
    .map((category) => ({
      label: toolCategoryLabels[category],
      links: getToolsByCategory(category).map((tool) => ({ label: tool.name, href: tool.path })),
    }))
    .filter((group) => group.links.length > 0);
}

/**
 * Site header: the brand link (symbol plus wordmark) and one grouped tools
 * menu. With ten tools a flat row no longer fits at any sensible size, so
 * the same registry-driven menu serves every width; only its presentation
 * changes.
 */
export function SiteHeader() {
  return (
    <header className="relative border-b border-zinc-200 bg-white">
      <Container className="flex h-14 items-center justify-between gap-6">
        <Link
          href="/"
          className="-mx-2 inline-flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-base font-semibold tracking-tight text-zinc-900"
        >
          <BrandSymbol className="size-5 flex-none text-accent" />
          {siteConfig.name}
        </Link>
        <ToolsMenu groups={buildMenuGroups()} />
      </Container>
    </header>
  );
}
