import "server-only";
import { createClient } from "@libsql/client";

let client: ReturnType<typeof createClient> | null = null;

/** Lazily-created singleton Turso client, so a build with no DB configured doesn't crash at import time. */
export function db() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url || !authToken) throw new Error("Turso isn't configured (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN missing)");
    client = createClient({ url, authToken });
  }
  return client;
}

export type ClaimRequest = {
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
};
