"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

export interface ToolsMenuLink {
  label: string;
  href: string;
}

export interface ToolsMenuGroup {
  label: string;
  links: readonly ToolsMenuLink[];
}

interface ToolsMenuProps {
  /** Registry-derived groups; the header builds them on the server. */
  groups: readonly ToolsMenuGroup[];
}

/**
 * The site's tool navigation at every width: one labelled toggle and a
 * grouped panel. On narrow screens the panel spans the viewport below the
 * header; on wide screens it drops down under the button in columns. It
 * overlays the page, so opening it never shifts layout. Closes on link
 * selection, Escape, route change, and outside click.
 */
export function ToolsMenu({ groups }: ToolsMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Navigating anywhere closes the menu, including back/forward. Adjusting
  // state during render is React's sanctioned way to react to a prop change.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="lg:relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close tools menu" : "Open tools menu"}
        onClick={() => setOpen((value) => !value)}
        className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      >
        <span className="hidden lg:inline">Tools</span>
        <MenuIcon open={open} />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 border-b border-zinc-200 bg-white shadow-lg lg:inset-x-auto lg:right-0 lg:mt-1 lg:w-[42rem] lg:rounded-lg lg:border"
      >
        <nav aria-label="Tools" className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 lg:px-5">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Home
          </Link>
          <div className="lg:grid lg:grid-cols-3 lg:gap-4">
            {groups.map((group) => (
              <div key={group.label} className="mt-3">
                <p className="px-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {group.label}
                </p>
                <ul className="mt-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={pathname === link.href ? "page" : undefined}
                        className="flex min-h-11 items-center rounded-md px-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 aria-[current=page]:font-medium aria-[current=page]:text-zinc-900"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="size-6"
    >
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}
