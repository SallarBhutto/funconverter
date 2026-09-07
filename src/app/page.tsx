import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site-config";
import { getToolsByCategory, toolCategories, toolCategoryLabels } from "@/lib/tools";

export const metadata: Metadata = buildPageMetadata({
  // The root layout title template does not apply to the root segment, so the
  // homepage sets its full title explicitly.
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
});

const principles = [
  {
    title: "Local processing",
    body: "Conversion and compression run inside your browser using local processing.",
  },
  {
    title: "No file storage",
    body: "The files you select aren't uploaded to or stored by FileHush.",
  },
  {
    title: "No account required",
    body: "Open a tool, process your files, and download the result without creating an account.",
  },
];

const liveCategories = toolCategories.filter((category) => getToolsByCategory(category).length > 0);

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="hero-heading" className="border-b border-zinc-200">
        <Container className="py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Free · Private · Browser-based
          </p>
          <h1
            id="hero-heading"
            className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl"
          >
            Convert and compress files without uploading them.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600">
            PDF and image tools that run locally in your browser. No sign-up required.
          </p>
        </Container>
      </section>

      <section aria-labelledby="tools-heading" className="border-b border-zinc-200 bg-zinc-50">
        <Container className="py-14 sm:py-16">
          <SectionHeading
            id="tools-heading"
            title="Choose a tool"
            description="Convert PDFs and images, create PDFs, or reduce file size."
          />
          {liveCategories.map((category) => (
            <div key={category} className="mt-10">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {toolCategoryLabels[category]}
              </h3>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {getToolsByCategory(category).map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={tool.path}
                      className="block rounded-lg border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400"
                    >
                      <span className="block text-base font-semibold text-zinc-900">{tool.name}</span>
                      <span className="mt-1 block text-sm text-zinc-600">{tool.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Container>
      </section>

      <section aria-labelledby="privacy-heading">
        <Container className="py-14 sm:py-16">
          <SectionHeading
            id="privacy-heading"
            title="Private by design"
            description="Many file tools send documents to a server for processing. FileHush keeps the work on your device instead."
          />
          <ul className="mt-10 grid gap-8 sm:grid-cols-3">
            {principles.map((principle) => (
              <li key={principle.title}>
                <h3 className="text-base font-semibold text-zinc-900">{principle.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{principle.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
