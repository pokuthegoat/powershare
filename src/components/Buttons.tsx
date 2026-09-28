import Link from "next/link";
import type { ReactNode } from "react";

export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

export const LaunchButton = ({ variant = "primary", small }: { variant?: Variant; small?: boolean }) => (
  <LinkButton href="/launch" variant={variant} small={small}>
    Launch a coin
  </LinkButton>
);

export const ClaimButton = ({ variant = "outline", small }: { variant?: Variant; small?: boolean }) => (
  <LinkButton href="/claim" variant={variant} small={small}>
    Claim fees
  </LinkButton>
);

export const SignUpButton = ({ variant = "outline", small }: { variant?: Variant; small?: boolean }) => (
  <LinkButton href="/signup" variant={variant} small={small}>
    Create account
  </LinkButton>
);
