import { NextResponse } from "next/server";
import { formatEther } from "viem";
import { db } from "@/lib/db.server";
import { PONS_FEE_ESCROW_ABI, PONS_FEE_ESCROW_ADDRESS, ponsPublicClient } from "@/lib/pons";
import { subredditFeeRecipientAddress } from "@/lib/ponsRecipient.server";

/**
 * Public, aggregate-only dashboard numbers. Deliberately separate from /api/claim-requests (admin-only, has Reddit
 * usernames and payout wallets) — this only ever returns totals and per-day sums, never a specific request's details.
 */
export async function GET() {
  const [launchStats, paidStats, dailyPaid] = await Promise.all([
    db().execute("SELECT COUNT(*) as launches, COUNT(DISTINCT subreddit) as subreddits FROM launches"),
    db().execute("SELECT COALESCE(SUM(amount_eth), 0) as total FROM claim_requests WHERE status = 'paid'"),
    db().execute("SELECT date(paid_at) as day, SUM(amount_eth) as amount FROM claim_requests WHERE status = 'paid' GROUP BY day"),
  ]);

  const subredditRows = await db().execute("SELECT DISTINCT subreddit FROM launches");
  const client = ponsPublicClient();
  const balances = await Promise.all(
    subredditRows.rows.map((row) =>
      client
        .readContract({
          address: PONS_FEE_ESCROW_ADDRESS,
          abi: PONS_FEE_ESCROW_ABI,
          functionName: "balanceOf",
          args: [subredditFeeRecipientAddress(String(row.subreddit))],
        })
        .catch(() => 0n),
    ),
  );
  const totalInEscrowEth = balances.reduce((sum, b) => sum + Number(formatEther(b)), 0);

  return NextResponse.json({
    launches: Number(launchStats.rows[0]?.launches ?? 0),
    subreddits: Number(launchStats.rows[0]?.subreddits ?? 0),
    totalPaidEth: Number(paidStats.rows[0]?.total ?? 0),
    totalInEscrowEth,
    dailyPaid: dailyPaid.rows.map((r) => ({ day: String(r.day), amountEth: Number(r.amount) })),
  });
}
