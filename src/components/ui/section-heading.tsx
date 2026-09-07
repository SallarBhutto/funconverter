import type { ReactNode } from "react";

interface SectionHeadingProps {
  id?: string;
  title: string;
  description?: ReactNode;
}

/** H2 with optional lead paragraph, used to open homepage and tool-page sections. */
export function SectionHeading({ id, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <h2 id={id} className="text-2xl font-semibold tracking-tight text-zinc-900">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-zinc-600">{description}</p>
      ) : null}
    </div>
  );
}
