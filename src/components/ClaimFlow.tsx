"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther, type Hex } from "viem";
import { PRIVY_APP_ID } from "@/lib/config";
import { PONS_FEE_ESCROW_ABI, PONS_FEE_ESCROW_ADDRESS, ponsPublicClient } from "@/lib/pons";

type Step = "subreddit" | "verify" | "claim" | "requested";

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `SUBPAD-${code}`;
}

function ConnectGate() {
  if (!PRIVY_APP_ID) {
    return (
      <div className="box form-card">
        <h1>Claim fees</h1>
        <p className="t-lead">Claiming isn&apos;t switched on yet. Check back soon.</p>
      </div>
    );
  }
  return <PrivyConnectGate />;
}

function PrivyConnectGate() {
  const { ready, authenticated, login } = usePrivy();
  if (ready && authenticated) return <ClaimSteps />;
  return (
    <div className="box form-card">
      <h1>Claim fees</h1>
      <p className="t-lead">Connect your wallet first — a claim gets sent to this wallet once it&apos;s approved.</p>
      <button type="button" className="btn btn-primary" disabled={!ready} onClick={() => login()}>
        {ready ? "Connect wallet" : "Loading…"}
      </button>
    </div>
  );
}

export function ClaimFlow() {
  if (!PRIVY_APP_ID) return <ConnectGate />;
  return <PrivyConnectGate />;
}

type Escrow = { state: "loading" } | { state: "ready"; address: Hex; balanceEth: number } | { state: "error"; message: string };

function ClaimSteps() {
  const [step, setStep] = useState<Step>("subreddit");
  const [subreddit, setSubreddit] = useState("");
  const [code] = useState(randomCode);
  const [escrow, setEscrow] = useState<Escrow>({ state: "loading" });

  useEffect(() => {
    if (step !== "claim") return;
    setEscrow({ state: "loading" });
    (async () => {
      const res = await fetch(`/api/subreddit-recipient?subreddit=${encodeURIComponent(subreddit)}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error === "not_configured" ? "The escrow wallet isn't configured on the server yet." : "Couldn't look up r/" + subreddit + "'s escrow address.");
      }
      const { address } = (await res.json()) as { address: Hex };
      const balance = await ponsPublicClient().readContract({
        address: PONS_FEE_ESCROW_ADDRESS,
        abi: PONS_FEE_ESCROW_ABI,
        functionName: "balanceOf",
        args: [address],
      });
      return { address, balanceEth: Number(formatEther(balance)) };
    })()
      .then((result) => result && setEscrow({ state: "ready", ...result }))
      .catch((err) => setEscrow({ state: "error", message: err instanceof Error ? err.message : "Couldn't read the escrow balance." }));
  }, [step, subreddit]);

  if (step === "subreddit") {
    return (
      <div className="box form-card">
        <span className="t-eyebrow section-num">Claim</span>
        <h1 style={{ marginTop: 10 }}>Which subreddit do you moderate?</h1>
        <p className="t-lead" style={{ marginTop: 10 }}>
          We&apos;ll give you a short code to prove it, then check it against Reddit&apos;s public moderator list.
        </p>
        <div className="field" style={{ marginTop: 4 }}>
          <label htmlFor="mod-subreddit">Subreddit</label>
          <div className="input-prefix">
            <span>r/</span>
            <input
              id="mod-subreddit"
              className="input"
              placeholder="nba"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value.replace(/^r\//i, ""))}
            />
          </div>
        </div>
        <button type="button" className="btn btn-primary" disabled={!subreddit} onClick={() => setStep("verify")}>
          Generate verification code
        </button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="box form-card">
        <span className="t-eyebrow section-num">Claim &middot; r/{subreddit}</span>
        <h1 style={{ marginTop: 10 }}>Prove you moderate r/{subreddit}.</h1>
        <div className="code-box">
          <span>{code}</span>
        </div>
        <div className="auth-step">
          <b>1</b>
          <span>Add this code to r/{subreddit}&apos;s sidebar, description, or a stickied post — somewhere only a mod can edit.</span>
        </div>
        <div className="auth-step">
          <b>2</b>
          <span>We check that the code is there, and that your Reddit account is on the subreddit&apos;s public moderator list.</span>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setStep("claim")}>
          I&apos;ve added it — verify
        </button>
        <p className="form-note">Reddit verification isn&apos;t wired up yet — this preview skips straight to a verified state.</p>
      </div>
    );
  }

  if (step === "claim") {
    return (
      <div className="box form-card">
        <span className="auth-ok">Verified as a mod of r/{subreddit}</span>
        <h1>Fees waiting for r/{subreddit}.</h1>
        <div className="box progress-card" style={{ border: "1px solid var(--line)" }}>
          <div className="progress-top">
            <span className="t-eyebrow">r/{subreddit} escrow</span>
          </div>
          {escrow.state === "ready" && (
            <>
              <p className="progress-amount">{escrow.balanceEth} ETH</p>
              <div className="progress-meta">
                <span>{escrow.address}</span>
              </div>
            </>
          )}
          {escrow.state === "loading" && <p className="progress-amount">Reading live…</p>}
          {escrow.state === "error" && <p className="form-note">{escrow.message}</p>}
        </div>
        <button type="button" className="btn btn-primary" disabled={escrow.state !== "ready"} onClick={() => setStep("requested")}>
          Claim fees
        </button>
        <p className="form-note">We send claims manually the next time we&apos;re online, not instantly.</p>
      </div>
    );
  }

  return (
    <div className="box form-card">
      <span className="auth-ok">Request received</span>
      <h1>We&apos;ll send it soon.</h1>
      <p className="t-lead">
        Your claim for r/{subreddit} is in the queue. We&apos;ll send the ETH to your connected wallet the next time
        we&apos;re online.
      </p>
    </div>
  );
}
