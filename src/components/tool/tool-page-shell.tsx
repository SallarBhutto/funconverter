import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TrustList } from "@/components/ui/trust-list";
import { getRelatedTools } from "@/lib/tools";

interface ToolPageShellProps {
  /** Route path, used to exclude this tool from the related list. */
  path: string;
  heading: string;
  intro: string;
  /** Accessible name for the converter section, e.g. "PDF to JPG converter". */
  converterLabel: string;
  /** The client island. */
  converter: ReactNode;
  /** Server-rendered supporting sections, typically ToolPageSection elements. */
  children: ReactNode;
}

/**
 * Server-rendered frame shared by every tool page: hero with the H1, intro
 * and one trust line (privacy is stated once by the note beside the
 * dropzone), the converter island, the supporting content, and
 * registry-driven related tools. Content arrives as props so each route
 * stays explicit.
 */
export function ToolPageShell({
  path,
  heading,
  intro,
  converterLabel,
  converter,
  children,
}: ToolPageShellProps) {
  const relatedTools = getRelatedTools(path);

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
          <TrustList label="What to expect" items={["Free to use", "No sign-up required"]} className="mt-6" />
        </Container>
      </section>

      <section aria-label={converterLabel} className="bg-zinc-50">
        <Container className="py-10 sm:py-14">{converter}</Container>
      </section>

      {children}

      <ToolPageSection
        id="more-tools-heading"
        title="Related tools"
        description="Other converters that run in your browser."
        tone="muted"
      >
        <ul className="mt-6 flex flex-wrap gap-3">
          {relatedTools.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={tool.path}
                className="inline-flex min-h-11 items-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
              >
                {tool.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <Link href="/" className="text-sm font-medium text-accent underline-offset-4 hover:underline">
            See all tools
          </Link>
        </p>
      </ToolPageSection>
    </>
  );
}

interface ToolPageSectionProps {
  id: string;
  title: string;
  description?: ReactNode;
  tone?: "default" | "muted";
  /** Omit the top border, for the first section directly under the converter. */
  first?: boolean;
  children?: ReactNode;
}

export function ToolPageSection({
  id,
  title,
  description,
  tone = "default",
  first = false,
  children,
}: ToolPageSectionProps) {
  const classes = [
    first ? "" : "border-t border-zinc-200",
    tone === "muted" ? "bg-zinc-50" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section aria-labelledby={id} className={classes}>
      <Container className="py-14 sm:py-16">
        <SectionHeading id={id} title={title} description={description} />
        {children}
      </Container>
    </section>
  );
}

export function HowToSteps({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="mt-6 max-w-2xl list-decimal space-y-3 pl-6 text-base leading-relaxed text-zinc-700">
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqList({ faqs }: { faqs: readonly FaqItem[] }) {
  return (
    <dl className="mt-8 max-w-3xl space-y-8">
      {faqs.map((faq) => (
        <div key={faq.question}>
          <dt className="text-base font-semibold text-zinc-900">{faq.question}</dt>
          <dd className="mt-2 leading-relaxed text-zinc-600">{faq.answer}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface PointItem {
  title: string;
  body: string;
}

export function PointGrid({ points }: { points: readonly PointItem[] }) {
  return (
    <dl className="mt-8 grid gap-6 sm:grid-cols-3">
      {points.map((point) => (
        <div key={point.title}>
          <dt className="font-semibold text-zinc-900">{point.title}</dt>
          <dd className="mt-1 text-sm leading-relaxed text-zinc-600">{point.body}</dd>
        </div>
      ))}
    </dl>
  );
}
