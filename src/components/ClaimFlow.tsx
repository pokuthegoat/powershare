"use client";

import { useEffect, useState } from "react";
import { formatEther, isAddress, type Hex } from "viem";
import { PONS_FEE_ESCROW_ABI, PONS_FEE_ESCROW_ADDRESS, ponsPublicClient } from "@/lib/pons";

type Step = "subreddit" | "verify" | "claim" | "requested";

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `SUBPAD-${code}`;
}

type Escrow = { state: "loading" } | { state: "ready"; address: Hex; balanceEth: number } | { state: "error"; message: string };
type Submit = { state: "idle" } | { state: "submitting" } | { state: "error"; message: string };

export function ClaimFlow() {
  const [step, setStep] = useState<Step>("subreddit");
  const [subreddit, setSubreddit] = useState("");
  const [redditUsername, setRedditUsername] = useState("");
  const [payoutWallet, setPayoutWallet] = useState("");
  const [code] = useState(randomCode);
  const [escrow, setEscrow] = useState<Escrow>({ state: "loading" });
  const [submit, setSubmit] = useState<Submit>({ state: "idle" });

  async function submitClaim() {
    if (escrow.state !== "ready" || !isAddress(payoutWallet)) return;
    setSubmit({ state: "submitting" });
    try {
      const res = await fetch("/api/claim-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subreddit,
          redditUsername,
          verificationCode: code,
          escrowAddress: escrow.address,
          payoutWallet,
        }),
      });
      if (!res.ok) throw new Error("Couldn't submit the claim request. Try again in a moment.");
      setStep("requested");
    } catch (err) {
      setSubmit({ state: "error", message: err instanceof Error ? err.message : "Couldn't submit the claim request." });
    }
  }

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
          We&apos;ll give you a short code to prove it. A real person checks it against the subreddit&apos;s public
          moderator list before any payout goes out — not an automated check.
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
        <div className="field">
          <label htmlFor="reddit-username">Your Reddit username</label>
          <div className="input-prefix">
            <span>u/</span>
            <input
              id="reddit-username"
              className="input"
              placeholder="username"
              value={redditUsername}
              onChange={(e) => setRedditUsername(e.target.value.replace(/^u\//i, ""))}
            />
          </div>
          <span className="field-hint">So we know which account on the moderator list to check for.</span>
        </div>
        <button type="button" className="btn btn-primary" disabled={!subreddit || !redditUsername} onClick={() => setStep("verify")}>
          Get a verification code
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
          <span>
            When you claim, it goes into a queue. Before anything is sent, someone manually checks that the code
            is there and that u/{redditUsername} is really on r/{subreddit}&apos;s public moderator list.
          </span>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setStep("claim")}>
          I&apos;ve added it — continue
        </button>
      </div>
    );
  }

  if (step === "claim") {
    const walletInvalid = payoutWallet.length > 0 && !isAddress(payoutWallet);
    return (
      <div className="box form-card">
        <span className="t-eyebrow section-num">Claim &middot; r/{subreddit}</span>
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
        <div className="field">
          <label htmlFor="payout-wallet">Wallet to receive the payout</label>
          <input
            id="payout-wallet"
            className="input"
            placeholder="0x..."
            value={payoutWallet}
            onChange={(e) => setPayoutWallet(e.target.value.trim())}
          />
          {walletInvalid && <span className="field-hint">That doesn&apos;t look like a valid address.</span>}
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={escrow.state !== "ready" || !isAddress(payoutWallet) || submit.state === "submitting"}
          onClick={submitClaim}
        >
          {submit.state === "submitting" ? "Submitting…" : "Claim"}
        </button>
        {submit.state === "error" && <p className="form-note">{submit.message}</p>}
        <p className="form-note">Someone checks u/{redditUsername} against r/{subreddit}&apos;s moderator list before sending anything — not instant.</p>
      </div>
    );
  }

  return (
    <div className="box form-card">
      <span className="auth-ok">Request received</span>
      <h1>We&apos;ll review it soon.</h1>
      <p className="t-lead">
        Your claim for r/{subreddit} (as u/{redditUsername}) is in the queue. Once someone checks the code and the
        moderator list, the ETH gets sent to {payoutWallet}.
      </p>
    </div>
  );
}
