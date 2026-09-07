import { buttonClassName } from "@/components/ui/button";
import { formatFileSize } from "@/lib/files/formatting";

import type { GeneratedPdf } from "../types";

interface PdfResultProps {
  result: GeneratedPdf;
}

/** The finished PDF: one Blob, one object URL, one real download link. */
export function PdfResult({ result }: PdfResultProps) {
  const pages = `${result.pageCount} ${result.pageCount === 1 ? "page" : "pages"}`;

  return (
    <section
      aria-labelledby="result-heading"
      className="flex flex-col gap-4 rounded-lg border border-accent bg-accent-soft p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <h2 id="result-heading" className="text-base font-semibold text-zinc-900">
          Your PDF is ready
        </h2>
        <p className="mt-1 truncate text-sm text-zinc-700" title={result.filename}>
          {result.filename}
        </p>
        <p className="text-sm text-zinc-600" aria-live="polite">
          {pages} · {formatFileSize(result.size)}
        </p>
      </div>
      <a
        href={result.objectUrl}
        download={result.filename}
        className={buttonClassName("primary", "shrink-0")}
      >
        Download PDF
      </a>
    </section>
  );
}
