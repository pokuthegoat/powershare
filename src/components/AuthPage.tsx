"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { PRIVY_APP_ID } from "@/lib/config";
import { LinkButton } from "./Buttons";

type Mode = "signup" | "login";

const COPY = {
  signup: {
    title: "Create your SubPad account",
    lead: "Connect your wallet to create your account. It takes a few seconds — no email, no password.",
    cta: "Sign up",
    switchText: "Already have an account?",
    switchLink: { href: "/login", label: "Log in" },
  },
  login: {
    title: "Log in to SubPad",
    lead: "Connect the same wallet you signed up with.",
    cta: "Log in",
    switchText: "New here?",
    switchLink: { href: "/signup", label: "Create an account" },
  },
} as const;

/** The sign-up / log-in card. Accounts are wallet-only, created and used directly through Privy. */
export function AuthPage({ mode }: { mode: Mode }) {
  if (!PRIVY_APP_ID) {
    return (
      <div className="box auth-card">
        <h1>{COPY[mode].title}</h1>
        <p>Account sign-up isn&apos;t switched on yet. Check back soon.</p>
      </div>
    );
  }
  return <PrivyAuthCard mode={mode} />;
}

// Rendered only inside <PrivyProvider> (see Providers.tsx), which is what makes usePrivy safe here.
function PrivyAuthCard({ mode }: { mode: Mode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const copy = COPY[mode];

  if (ready && authenticated) {
    const address = user?.wallet?.address;
    const who = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null;
    return (
      <div className="box auth-card">
        <span className="auth-ok">You&apos;re signed in{who ? ` as ${who}` : ""}</span>
        <h1>Your account is ready.</h1>
        <p>Launch a coin for a subreddit, or claim fees for one you moderate.</p>
        <div className="auth-step">
          <b>1</b>
          <span>Launch a coin for any subreddit, or find one that already has a coin.</span>
        </div>
        <div className="auth-step">
          <b>2</b>
          <span>Moderate a subreddit with a coin? Verify it and claim what&apos;s waiting in escrow.</span>
        </div>
        <div className="auth-actions">
          <LinkButton href="/launch" variant="primary">
            Launch a coin
          </LinkButton>
          <LinkButton href="/claim" variant="outline">
            Claim fees
          </LinkButton>
          <button type="button" className="btn btn-outline" onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="box auth-card">
      <h1>{copy.title}</h1>
      <p>{copy.lead}</p>
      <div className="auth-actions">
        <button type="button" className="btn btn-primary" disabled={!ready} onClick={() => login()}>
          {ready ? copy.cta : "Loading…"}
        </button>
      </div>
      <p className="auth-switch">
        {copy.switchText} <Link href={copy.switchLink.href}>{copy.switchLink.label}</Link>
      </p>
    </div>
  );
}
