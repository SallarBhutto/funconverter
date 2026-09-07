interface TrustListProps {
  items: readonly string[];
  /** Accessible name for the list, e.g. "What you can expect". */
  label: string;
  className?: string;
}

/**
 * Compact inline row of short reassurances, each with a decorative check
 * mark. The text carries the meaning; the icon is hidden from assistive
 * technology. Wraps onto several lines on narrow screens.
 */
export function TrustList({ items, label, className = "" }: TrustListProps) {
  return (
    <ul aria-label={label} className={`flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-700 ${className}`.trim()}>
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 shrink-0 text-accent"
          >
            <path d="M4 10.5l4 4 8-9" />
          </svg>
          {item}
        </li>
      ))}
    </ul>
  );
}
