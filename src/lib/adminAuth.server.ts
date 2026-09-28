import "server-only";
import { PrivyClient } from "@privy-io/server-auth";
import { ADMIN_WALLET } from "./config";

let client: PrivyClient | null = null;

function privyClient() {
  if (!client) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    const appSecret = process.env.PRIVY_APP_SECRET;
    if (!appId || !appSecret) throw new Error("Privy isn't configured (NEXT_PUBLIC_PRIVY_APP_ID / PRIVY_APP_SECRET missing)");
    client = new PrivyClient(appId, appSecret);
  }
  return client;
}

/**
 * Verifies the caller is signed in as the one admin wallet, using the Privy identity token the client sends in
 * `Authorization: Bearer <token>`. Real server-side verification (not just hiding UI) — the token is checked
 * against Privy's own servers, and the wallet it resolves to is compared against ADMIN_WALLET.
 */
export async function requireAdmin(request: Request): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!ADMIN_WALLET) return { ok: false, status: 503, error: "admin_not_configured" };

  const auth = request.headers.get("authorization");
  const idToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!idToken) return { ok: false, status: 401, error: "missing_token" };

  try {
    const user = await privyClient().getUser({ idToken });
    if (user.wallet?.address?.toLowerCase() === ADMIN_WALLET) return { ok: true };
    return { ok: false, status: 403, error: "not_admin" };
  } catch {
    return { ok: false, status: 401, error: "invalid_token" };
  }
}
