import Link from "next/link";
import type { ReactNode } from "react";
import { DOWNLOAD_URL } from "@/lib/config";

export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v8m0 0-3.5-3.5M8 10l3.5-3.5M2.5 13h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type Variant = "primary" | "outline";

export function LinkButton({
  href,
  variant = "primary",
  small = false,
  arrow = true,
  children,
}: {
  href: string;
  variant?: Variant;
  small?: boolean;
  arrow?: boolean;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`btn btn-${variant}${small ? " btn-sm" : ""}`}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

/** Download for Windows. The build isn't published yet, so by default this scrolls to the app section. */
export function DownloadButton({ variant = "primary", small }: { variant?: Variant; small?: boolean }) {
  return (
    <Link href={DOWNLOAD_URL} className={`btn btn-${variant}${small ? " btn-sm" : ""}`}>
      Download for Windows
      <DownloadIcon />
    </Link>
  );
}

export const SignUpButton = ({ variant = "outline", small }: { variant?: Variant; small?: boolean }) => (
  <LinkButton href="/signup" variant={variant} small={small}>
    Create account
  </LinkButton>
);
