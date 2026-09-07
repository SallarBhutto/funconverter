import { SYMBOL_PATH, SYMBOL_VIEW_BOX } from "@/lib/brand/symbol";

interface BrandSymbolProps {
  className?: string;
}

/**
 * Inline FileHush symbol. Decorative wherever it sits beside the visible
 * wordmark, so it is hidden from assistive technology. Fills with
 * currentColor; pass `text-accent` for the approved teal.
 */
export function BrandSymbol({ className = "" }: BrandSymbolProps) {
  return (
    <svg aria-hidden="true" viewBox={SYMBOL_VIEW_BOX} fill="currentColor" fillRule="evenodd" className={className}>
      <path d={SYMBOL_PATH} />
    </svg>
  );
}
