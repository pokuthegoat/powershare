import "server-only";
import { createHmac } from "crypto";
import { privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";

/**
 * Derives a unique wallet per subreddit from one master seed, instead of using a single shared recipient for every
 * coin. This matters because Pons v2's fee escrow pools balances by (recipient, asset), not by token — if every
 * subreddit shared one recipient, there would be no way to tell which subreddit earned what. A distinct address per
 * subreddit means `balanceOf(that address)` on the escrow is exactly that subreddit's own balance.
 *
 * Server-only: the master seed must never reach the browser. Client code gets an address from
 * `/api/subreddit-recipient`, never the seed or a private key.
 */
function masterSeed(): Hex {
  const seed = process.env.PONS_MASTER_SEED;
  if (!seed) throw new Error("PONS_MASTER_SEED is not configured");
  return seed as Hex;
}

/** HMAC-SHA256(seed, "subpad-v1:<subreddit>") as the child private key. Deterministic — no index or database needed. */
function deriveSubredditPrivateKey(subreddit: string): Hex {
  const label = `subpad-v1:${subreddit.toLowerCase()}`;
  const digest = createHmac("sha256", Buffer.from(masterSeed().slice(2), "hex")).update(label).digest("hex");
  return `0x${digest}` as Hex;
}

export function isPonsRecipientConfigured() {
  return Boolean(process.env.PONS_MASTER_SEED);
}

/** The address to set as `creatorFeeRecipient` when launching a coin for this subreddit. Safe to expose to the client. */
export function subredditFeeRecipientAddress(subreddit: string): Hex {
  return privateKeyToAccount(deriveSubredditPrivateKey(subreddit)).address;
}

/** The signing key for this subreddit's escrow address — only for server-side claim/payout code. Never sent to the client. */
export function subredditFeeRecipientPrivateKey(subreddit: string): Hex {
  return deriveSubredditPrivateKey(subreddit);
}
