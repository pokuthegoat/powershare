import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { SceneBackground } from "@/components/SceneBackground";
import { db, type Launch } from "@/lib/db.server";
import { robinhoodChain } from "@/lib/robinhoodChain";

export const metadata: Metadata = {
  title: "Launched coins | SubPad",
  description: "Every coin launched on SubPad, newest first.",
};

const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

async function launches(): Promise<Launch[]> {
  try {
    const result = await db().execute("SELECT * FROM launches ORDER BY launched_at DESC");
    return result.rows as unknown as Launch[];
  } catch {
    return [];
  }
}

export default async function Coins() {
  const rows = await launches();
  return (
    <>
      <SceneBackground dim />
      <Nav />
      <main className="form-page">
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ marginBottom: 28 }}>
            <span className="t-eyebrow section-num">Launched coins</span>
            <p className="t-h1" style={{ marginTop: 10 }}>
              Every coin launched on SubPad.
            </p>
          </div>
          {rows.length === 0 ? (
            <p className="t-lead t-muted">No coins launched yet.</p>
          ) : (
            <div className="launch-list">
              <div className="launch-row is-head">
                <span>Subreddit</span>
                <span>Coin</span>
                <span>Launched by</span>
                <span>When</span>
              </div>
              {rows.map((l) => (
                <div className="launch-row" key={l.id}>
                  <span>r/{l.subreddit}</span>
                  <span>
                    {l.name} &middot; ${l.symbol}
                  </span>
                  <span>{short(l.launcher_wallet)}</span>
                  <span>
                    <a href={`${robinhoodChain.blockExplorers.default.url}/tx/${l.tx_hash}`} target="_blank" rel="noreferrer">
                      {l.launched_at}
                    </a>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
