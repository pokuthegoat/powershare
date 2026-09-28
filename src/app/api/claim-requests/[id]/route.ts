import { NextResponse } from "next/server";
import { db } from "@/lib/db.server";
import { requireAdmin } from "@/lib/adminAuth.server";

/** Admin only: mark a request paid, with an optional reference (e.g. a tx hash). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { txHash?: string; amountEth?: number } | null;

  await db().execute({
    sql: `UPDATE claim_requests SET status = 'paid', paid_at = datetime('now'), tx_hash = ?, amount_eth = ? WHERE id = ?`,
    args: [body?.txHash ?? null, body?.amountEth ?? null, id],
  });

  return NextResponse.json({ ok: true });
}
