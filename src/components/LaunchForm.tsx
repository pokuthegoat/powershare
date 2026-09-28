"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, formatEther, type Hex } from "viem";
import { PRIVY_APP_ID, DEFAULT_CREATOR_TAX, MAX_CREATOR_TAX } from "@/lib/config";
import { PONS_FACTORY_ABI, PONS_FACTORY_ADDRESS, ponsPublicClient, prepareLaunch } from "@/lib/pons";
import { robinhoodChain } from "@/lib/robinhoodChain";

const GAS_ESTIMATE_ETH = 0.0002;

function ConnectGate() {
  if (!PRIVY_APP_ID) {
    return (
      <div className="box form-card">
        <h1>Launch a coin</h1>
        <p className="t-lead">Launching isn&apos;t switched on yet. Check back soon.</p>
      </div>
    );
  }
  return <PrivyConnectGate />;
}

function PrivyConnectGate() {
  const { ready, authenticated, login } = usePrivy();
  return (
    <div className="box form-card">
      <h1>Launch a coin</h1>
      <p className="t-lead">Connect your wallet first — you&apos;ll sign the launch transaction with it.</p>
      <button type="button" className="btn btn-primary" disabled={!ready} onClick={() => login()}>
        {ready ? "Connect wallet" : "Loading…"}
      </button>
    </div>
  );
}

export function LaunchForm() {
  if (!PRIVY_APP_ID) return <ConnectGate />;
  return <Gated />;
}

function Gated() {
  const { ready, authenticated } = usePrivy();
  if (!ready || !authenticated) return <ConnectGate />;
  return <LaunchFields />;
}

type Status = { state: "idle" } | { state: "submitting" } | { state: "done"; hash: Hex } | { state: "error"; message: string };

function LaunchFields() {
  const { wallets } = useWallets();
  const wallet = wallets[0];

  const [subreddit, setSubreddit] = useState("");
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [tax, setTax] = useState(DEFAULT_CREATOR_TAX);
  const [imageName, setImageName] = useState<string | null>(null);
  const [launchFee, setLaunchFee] = useState<bigint | null>(null);
  const [status, setStatus] = useState<Status>({ state: "idle" });

  useEffect(() => {
    ponsPublicClient()
      .readContract({ address: PONS_FACTORY_ADDRESS, abi: PONS_FACTORY_ABI, functionName: "launchFee" })
      .then(setLaunchFee)
      .catch(() => setLaunchFee(null));
  }, []);

  const launchFeeEth = launchFee !== null ? Number(formatEther(launchFee)) : null;
  const total = useMemo(() => (launchFeeEth !== null ? (launchFeeEth + GAS_ESTIMATE_ETH).toFixed(5) : null), [launchFeeEth]);

  const canSubmit = Boolean(wallet && subreddit && name && ticker && launchFee !== null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wallet) return;
    setStatus({ state: "submitting" });
    try {
      const recipientRes = await fetch(`/api/subreddit-recipient?subreddit=${encodeURIComponent(subreddit)}`);
      if (!recipientRes.ok) {
        const body = (await recipientRes.json().catch(() => null)) as { error?: string } | null;
        throw new Error(
          body?.error === "not_configured"
            ? "The escrow wallet isn't configured on the server yet."
            : "Couldn't work out r/" + subreddit + "'s escrow address.",
        );
      }
      const { address: creatorFeeRecipient } = (await recipientRes.json()) as { address: Hex };

      await wallet.switchChain(robinhoodChain.id);
      const provider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        account: wallet.address as Hex,
        chain: robinhoodChain,
        transport: custom(provider),
      });

      const { params, launchConfigId, pairToken, launchFee: fee } = await prepareLaunch({
        name,
        symbol: ticker,
        description,
        creatorFeeRecipient,
        creatorTaxBps: Math.round(tax * 100),
      });

      const hash = await walletClient.writeContract({
        address: PONS_FACTORY_ADDRESS,
        abi: PONS_FACTORY_ABI,
        functionName: "launchToken",
        args: [params, launchConfigId, pairToken],
        value: fee,
      });

      setStatus({ state: "done", hash });
    } catch (err) {
      setStatus({ state: "error", message: err instanceof Error ? err.message : "The launch transaction failed." });
    }
  }

  if (status.state === "done") {
    return (
      <div className="box form-card">
        <span className="auth-ok">Launched</span>
        <h1>r/{subreddit}&apos;s coin is live.</h1>
        <p className="t-lead">
          Trading fees now build up in r/{subreddit}&apos;s escrow. Trading itself happens on Pons&apos;s own page for
          the coin.
        </p>
        <a
          className="btn btn-outline"
          href={`${robinhoodChain.blockExplorers.default.url}/tx/${status.hash}`}
          target="_blank"
          rel="noreferrer"
        >
          View transaction
        </a>
      </div>
    );
  }

  return (
    <div className="box form-card">
      <div>
        <span className="t-eyebrow section-num">Launch</span>
        <h1 style={{ marginTop: 10 }}>Launch a coin for a subreddit.</h1>
        <p className="t-lead" style={{ marginTop: 10 }}>
          You pay the launch fee and gas. Fees go into escrow for the subreddit — never to you.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div className="field">
          <label htmlFor="subreddit">Subreddit</label>
          <div className="input-prefix">
            <span>r/</span>
            <input
              id="subreddit"
              className="input"
              placeholder="nba"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value.replace(/^r\//i, ""))}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="name">Coin name</label>
            <input
              id="name"
              className="input"
              placeholder="r/nba coin"
              maxLength={32}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="ticker">Ticker</label>
            <input
              id="ticker"
              className="input"
              placeholder="NBA"
              maxLength={10}
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">
            Description <span className="field-hint">({description.length}/240)</span>
          </label>
          <textarea
            id="description"
            className="textarea"
            maxLength={240}
            placeholder="What this coin is for."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="image">Image</label>
          <label className="upload">
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageName(e.target.files?.[0]?.name ?? null)}
            />
            {imageName ?? "Square image, click to choose"}
          </label>
          <span className="field-hint">Image hosting isn&apos;t wired up yet — the coin launches without one for now.</span>
        </div>

        <div className="field">
          <div className="range-row">
            <label htmlFor="tax" style={{ margin: 0 }}>
              Creator tax
            </label>
            <span className="range-value">{tax}%</span>
          </div>
          <input
            id="tax"
            type="range"
            min={0}
            max={MAX_CREATOR_TAX}
            step={0.5}
            value={tax}
            onChange={(e) => setTax(Number(e.target.value))}
          />
          <span className="field-hint">Paid to the subreddit&apos;s escrow on every trade. Higher taxes raise more per trade, but can slow trading down.</span>
        </div>

        <div className="cost-table">
          <div className="cost-row">
            <span>Fees route to</span>
            <span>{subreddit ? `r/${subreddit}` : "—"}&apos;s escrow</span>
          </div>
          <div className="cost-row">
            <span>Launch fee</span>
            <span>{launchFeeEth !== null ? `${launchFeeEth} ETH` : "Reading live…"}</span>
          </div>
          <div className="cost-row">
            <span>Estimated gas</span>
            <span>~{GAS_ESTIMATE_ETH} ETH</span>
          </div>
          <div className="cost-row is-total">
            <span>Total</span>
            <span>{total !== null ? `~${total} ETH` : "—"}</span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={!canSubmit || status.state === "submitting"}>
          {status.state === "submitting" ? "Confirm in your wallet…" : "Launch coin"}
        </button>
        {status.state === "error" && <p className="form-note">{status.message}</p>}
      </form>
    </div>
  );
}
