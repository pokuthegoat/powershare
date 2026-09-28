import { NextResponse } from "next/server";
import { db, type ClaimRequest } from "@/lib/db.server";
import { requireAdmin } from "@/lib/adminAuth.server";

type CreateBody = {
  subreddit: string;
  redditUsername: string;
  verificationCode: string;
  escrowAddress: string;
  payoutWallet: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<CreateBody> | null;
  if (!body?.subreddit || !body.redditUsername || !body.verificationCode || !body.escrowAddress || !body.payoutWallet) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const result = await db().execute({
    sql: `INSERT INTO claim_requests (subreddit, reddit_username, verification_code, escrow_address, payout_wallet)
          VALUES (?, ?, ?, ?, ?) RETURNING id`,
    args: [body.subreddit, body.redditUsername, body.verificationCode, body.escrowAddress, body.payoutWallet],
  });

  return NextResponse.json({ id: result.rows[0]?.id }, { status: 201 });
}

/** Admin only: every request, newest first. */
export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const result = await db().execute("SELECT * FROM claim_requests ORDER BY requested_at DESC");
  return NextResponse.json({ requests: result.rows as unknown as ClaimRequest[] });
}
