import { NextResponse } from "next/server";
import { isPonsRecipientConfigured, subredditFeeRecipientAddress } from "@/lib/ponsRecipient.server";

/** Returns the derived escrow address for a subreddit. Only the address — never a key or seed. */
export async function GET(request: Request) {
  if (!isPonsRecipientConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const subreddit = new URL(request.url).searchParams.get("subreddit")?.trim().toLowerCase();
  if (!subreddit) {
    return NextResponse.json({ error: "missing_subreddit" }, { status: 400 });
  }

  return NextResponse.json({ address: subredditFeeRecipientAddress(subreddit) });
}
