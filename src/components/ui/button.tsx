import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-teal-800",
  secondary: "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50",
  ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
};

/** Shared classes so links can be styled as buttons without becoming buttons. */
export function buttonClassName(variant: ButtonVariant = "primary", className = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${className}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}
