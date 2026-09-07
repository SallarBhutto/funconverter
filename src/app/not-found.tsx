import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Container className="py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-zinc-600">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Back to home
      </Link>
    </Container>
  );
}
