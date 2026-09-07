interface PrivacyNoteProps {
  className?: string;
}

/** One-line reassurance placed next to the conversion workflow. */
export function PrivacyNote({ className = "" }: PrivacyNoteProps) {
  return (
    <p className={`flex items-center gap-2 text-sm text-zinc-600 ${className}`.trim()}>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-4 shrink-0 text-accent"
      >
        <path
          fillRule="evenodd"
          d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
          clipRule="evenodd"
        />
      </svg>
      Processed locally in your browser. Your file is never uploaded.
    </p>
  );
}
