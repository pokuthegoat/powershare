"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { PRIVY_APP_ID } from "@/lib/config";
import { DownloadButton } from "./Buttons";

type Mode = "signup" | "login";

const COPY = {
  signup: {
    title: "Create your PowerShare account",
    lead: "Connect your wallet to create your account. It takes a few seconds, and it's the account you'll use to sign in to the app.",
    cta: "Sign up",
    switchText: "Already have an account?",
    switchLink: { href: "/login", label: "Log in" },
  },
  login: {
    title: "Log in to PowerShare",
    lead: "Connect the same wallet you signed up with.",
    cta: "Log in",
    switchText: "New here?",
    switchLink: { href: "/signup", label: "Create an account" },
  },
} as const;

/** The sign-up / log-in card. Accounts are created by Privy; the desktop app signs in with the same account. */
export function AuthPage({ mode }: { mode: Mode }) {
  if (!PRIVY_APP_ID) {
    return (
      <div className="glass auth-card">
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
      <div className="glass auth-card">
        <span className="auth-ok">You&apos;re signed in{who ? ` as ${who}` : ""}</span>
        <h1>Your account is ready.</h1>
        <p>One more step: get the app and sign in with the same account.</p>
        <div className="auth-step">
          <b>1</b>
          <span>Download and install the PowerShare app for Windows.</span>
        </div>
        <div className="auth-step">
          <b>2</b>
          <span>Open it and sign in with {who ? `the wallet ${who}` : "the same wallet"}.</span>
        </div>
        <div className="auth-step">
          <b>3</b>
          <span>Press Start. Your GPU starts earning.</span>
        </div>
        <div className="auth-actions">
          <DownloadButton variant="white" />
          <button type="button" className="btn btn-glass" onClick={() => void logout()}>
            Log out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass auth-card">
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
