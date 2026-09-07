import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** Centered, padded content width shared by header, footer, and pages. */
export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-5xl px-4 sm:px-6 ${className}`.trim()}>
      {children}
    </div>
  );
}
