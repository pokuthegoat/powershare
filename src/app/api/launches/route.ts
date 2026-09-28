import { NextResponse } from "next/server";
import { db, type Launch } from "@/lib/db.server";

type CreateBody = {
  subreddit: string;
  name: string;
  symbol: string;
  tokenAddress: string;
  launcherWallet: string;
  creatorTaxBps: number;
  txHash: string;
};

/** Records a successful launch. Public — anyone can launch, and the launch is public on-chain anyway. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<CreateBody> | null;
  if (!body?.subreddit || !body.name || !body.symbol || !body.tokenAddress || !body.launcherWallet || !body.txHash || body.creatorTaxBps === undefined) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const result = await db().execute({
    sql: `INSERT INTO launches (subreddit, name, symbol, token_address, launcher_wallet, creator_tax_bps, tx_hash)
          VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    args: [body.subreddit, body.name, body.symbol, body.tokenAddress, body.launcherWallet, body.creatorTaxBps, body.txHash],
  });

  return NextResponse.json({ id: result.rows[0]?.id }, { status: 201 });
}

/** Every launch, newest first. Public — the dashboard reads this. */
export async function GET() {
  const result = await db().execute("SELECT * FROM launches ORDER BY launched_at DESC");
  return NextResponse.json({ launches: result.rows as unknown as Launch[] });
}
