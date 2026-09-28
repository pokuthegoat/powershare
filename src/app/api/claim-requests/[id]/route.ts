import { NextResponse } from "next/server";
import { db } from "@/lib/db.server";
import { requireAdmin } from "@/lib/adminAuth.server";

/** Admin only: mark a request paid, with an optional reference (e.g. a tx hash). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { txHash?: string } | null;

  await db().execute({
    sql: `UPDATE claim_requests SET status = 'paid', paid_at = datetime('now'), tx_hash = ? WHERE id = ?`,
    args: [body?.txHash ?? null, id],
  });

  return NextResponse.json({ ok: true });
}
