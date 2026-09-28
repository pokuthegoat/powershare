import { db } from "@/lib/db.server";

/** Serves a stored coin image back out, publicly and cacheably — this is what the `logo` URL on-chain points at. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await db().execute({ sql: "SELECT content_type, data FROM logos WHERE id = ?", args: [id] });
  const row = result.rows[0];
  if (!row) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(row.data as ArrayBuffer), {
    headers: {
      "Content-Type": String(row.content_type),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
