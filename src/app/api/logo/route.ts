import { NextResponse } from "next/server";
import { db } from "@/lib/db.server";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

/** Stores an uploaded coin image in Turso and returns the URL to serve it back from. */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const bytes = new Uint8Array(await file.arrayBuffer());

  await db().execute({
    sql: "INSERT INTO logos (id, content_type, data) VALUES (?, ?, ?)",
    args: [id, file.type, bytes],
  });

  return NextResponse.json({ id, url: `/api/logo/${id}` }, { status: 201 });
}
