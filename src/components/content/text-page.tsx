import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";

interface TextPageProps {
  heading: string;
  intro: string;
  /**
   * Fixed, human-readable effective date. Omitted on pages that are not
   * versioned, such as Contact.
   */
  effectiveDate?: string;
  children: ReactNode;
}

/**
 * Server-rendered frame for the site's prose pages (privacy, terms,
 * contact). It reuses the hero, type scale, borders and container of the
 * tool pages so these pages read as part of FileHush rather than as a
 * separate legal site; the body sits in one narrow column for readability.
 */
export function TextPage({ heading, intro, effectiveDate, children }: TextPageProps) {
  return (
    <>
      <section aria-labelledby="page-heading" className="border-b border-zinc-200">
        <Container className="py-12 sm:py-16">
          <h1
            id="page-heading"
            className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl"
          >
            {heading}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">{intro}</p>
          {effectiveDate ? (
            <p className="mt-6 text-sm text-zinc-500">Effective date: {effectiveDate}</p>
          ) : null}
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <div className="max-w-3xl space-y-10">{children}</div>
      </Container>
    </>
  );
}

/**
 * One block of body copy: a plain string becomes a paragraph, an array of
 * strings becomes a bullet list. Content is passed as data rather than JSX
 * so the pages stay readable and match how tool-page content is written.
 */
export type TextBlock = string | readonly string[];

interface TextSectionProps {
  id: string;
  title: string;
  /** Body copy as data. Omit it for a section built entirely from children. */
  body?: readonly TextBlock[];
  /** For the rare block that needs a link or other markup, rendered last. */
  children?: ReactNode;
}

export function TextSection({ id, title, body = [], children }: TextSectionProps) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-xl font-semibold tracking-tight text-zinc-900">
        {title}
      </h2>
      <div className="mt-3 space-y-4 text-base leading-relaxed text-zinc-600">
        {body.map((block) =>
          typeof block === "string" ? (
            <p key={block}>{block}</p>
          ) : (
            <ul key={block.join("|")} className="list-disc space-y-2 pl-6">
              {block.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ),
        )}
        {children}
      </div>
    </section>
  );
}
