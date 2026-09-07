interface ProgressBarProps {
  /** Percentage in [0, 100]. */
  value: number;
  /** Accessible name describing what is progressing. */
  label: string;
  className?: string;
}

export function ProgressBar({ value, label, className = "" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
      className={`h-2 w-full overflow-hidden rounded-full bg-zinc-200 ${className}`.trim()}
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out motion-reduce:transition-none"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
