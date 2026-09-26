"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { PRIVY_APP_ID } from "@/lib/config";

type Variant = "pill" | "button";

/** Nav account button: "Sign up" (or "Log out" once signed in). A placeholder until Privy is configured. */
export function AuthButton({ as = "pill" }: { as?: Variant }) {
  if (!PRIVY_APP_ID) {
    return (
      <span className={as === "button" ? "btn btn-glass" : "pill"} aria-disabled="true">
        Sign up <span className="tag">Coming soon</span>
      </span>
    );
  }
  return <PrivyAuthButton as={as} />;
}

// Rendered only inside <PrivyProvider> (see Providers.tsx), which is what makes usePrivy safe here.
function PrivyAuthButton({ as }: { as: Variant }) {
  const { ready, authenticated, logout } = usePrivy();
  const cls = as === "button" ? "btn btn-glass" : "pill";

  if (ready && authenticated) {
    return (
      <button type="button" className={cls} onClick={() => void logout()}>
        Log out
      </button>
    );
  }
  return (
    <Link href="/signup" className={cls}>
      Sign up
    </Link>
  );
}
