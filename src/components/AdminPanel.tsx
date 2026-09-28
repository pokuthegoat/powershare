"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy, getIdentityToken } from "@privy-io/react-auth";
import { formatEther, type Hex } from "viem";
import { ADMIN_WALLET, PRIVY_APP_ID } from "@/lib/config";
import { PONS_FEE_ESCROW_ABI, PONS_FEE_ESCROW_ADDRESS, ponsPublicClient } from "@/lib/pons";

type ClaimRequest = {
  id: number;
  subreddit: string;
  reddit_username: string;
  verification_code: string;
  escrow_address: string;
  payout_wallet: string;
  status: "requested" | "paid";
  requested_at: string;
  paid_at: string | null;
  tx_hash: string | null;
  amount_eth: number | null;
};

function Gate() {
  if (!PRIVY_APP_ID) {
    return (
      <div className="box form-card">
        <h1>Admin</h1>
        <p className="t-lead">Not switched on yet.</p>
      </div>
    );
  }
  return <PrivyGate />;
}

function PrivyGate() {
  const { ready, authenticated, login, user } = usePrivy();
  const address = user?.wallet?.address?.toLowerCase();

  if (!ready) {
    return (
      <div className="box form-card">
        <h1>Admin</h1>
        <button type="button" className="btn btn-primary" disabled>
          Loading…
        </button>
      </div>
    );
  }
  if (!authenticated) {
    return (
      <div className="box form-card">
        <h1>Admin</h1>
        <p className="t-lead">Connect the admin wallet to continue.</p>
        <button type="button" className="btn btn-primary" onClick={() => login()}>
          Connect wallet
        </button>
      </div>
    );
  }
  if (!ADMIN_WALLET || address !== ADMIN_WALLET) {
    return (
      <div className="box form-card">
        <h1>Admin</h1>
        <p className="t-lead">This wallet isn&apos;t authorized to view this page.</p>
      </div>
    );
  }
  return <RequestList />;
}

function RequestList() {
  const [requests, setRequests] = useState<ClaimRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [balances, setBalances] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setError(null);
    const idToken = await getIdentityToken();
    const res = await fetch("/api/claim-requests", { headers: { Authorization: `Bearer ${idToken}` } });
    if (!res.ok) {
      setError("Couldn't load claim requests.");
      return;
    }
    const { requests } = (await res.json()) as { requests: ClaimRequest[] };
    setRequests(requests);

    const client = ponsPublicClient();
    const pendingAddresses = [...new Set(requests.filter((r) => r.status === "requested").map((r) => r.escrow_address))];
    for (const address of pendingAddresses) {
      client
        .readContract({ address: PONS_FEE_ESCROW_ADDRESS, abi: PONS_FEE_ESCROW_ABI, functionName: "balanceOf", args: [address as Hex] })
        .then((balance) => setBalances((prev) => ({ ...prev, [address]: Number(formatEther(balance)) })))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markPaid(id: number, suggestedAmount: number | undefined) {
    const amountInput = window.prompt(
      `How much ETH did you send?${suggestedAmount !== undefined ? ` (escrow currently shows ${suggestedAmount} ETH)` : ""}`,
      suggestedAmount !== undefined ? String(suggestedAmount) : "",
    );
    if (amountInput === null) return;
    const txHash = window.prompt("Optional: paste a transaction hash for the record, or leave blank.") ?? undefined;
    setPayingId(id);
    const idToken = await getIdentityToken();
    await fetch(`/api/claim-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ txHash: txHash || undefined, amountEth: amountInput ? Number(amountInput) : undefined }),
    });
    setPayingId(null);
    load();
  }

  if (error) return <p className="form-note">{error}</p>;
  if (!requests) return <p className="t-lead">Loading…</p>;

  const pending = requests.filter((r) => r.status === "requested");
  const paid = requests.filter((r) => r.status === "paid");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <div>
        <span className="t-eyebrow section-num">Pending &middot; {pending.length}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
          {pending.length === 0 && <p className="t-lead t-muted">Nothing waiting on review.</p>}
          {pending.map((r) => (
            <div className="box" key={r.id} style={{ padding: 20 }}>
              <div className="cost-table" style={{ background: "var(--white)" }}>
                <div className="cost-row">
                  <span>Subreddit</span>
                  <span>
                    <a href={`https://www.reddit.com/r/${r.subreddit}/about/moderators`} target="_blank" rel="noreferrer">
                      r/{r.subreddit} &middot; mod list
                    </a>
                  </span>
                </div>
                <div className="cost-row">
                  <span>Claims to be</span>
                  <span>u/{r.reddit_username}</span>
                </div>
                <div className="cost-row">
                  <span>Verification code</span>
                  <span>{r.verification_code}</span>
                </div>
                <div className="cost-row">
                  <span>Escrow address</span>
                  <span>{r.escrow_address}</span>
                </div>
                <div className="cost-row">
                  <span>In escrow now</span>
                  <span>{balances[r.escrow_address] !== undefined ? `${balances[r.escrow_address]} ETH` : "Reading live…"}</span>
                </div>
                <div className="cost-row">
                  <span>Payout wallet</span>
                  <span>{r.payout_wallet}</span>
                </div>
                <div className="cost-row">
                  <span>Requested</span>
                  <span>{r.requested_at}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                disabled={payingId === r.id}
                onClick={() => markPaid(r.id, balances[r.escrow_address])}
              >
                {payingId === r.id ? "Saving…" : "Mark paid"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <span className="t-eyebrow section-num">Paid &middot; {paid.length}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {paid.map((r) => (
            <div className="box" key={r.id} style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span>
                r/{r.subreddit} &middot; u/{r.reddit_username}
              </span>
              <span className="t-muted">
                {r.amount_eth !== null ? `${r.amount_eth} ETH · ` : ""}
                paid {r.paid_at}
                {r.tx_hash ? ` · ${r.tx_hash}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminPanel() {
  return <Gate />;
}
