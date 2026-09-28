import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { SceneBackground } from "@/components/SceneBackground";
import { Dashboard } from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Subreddits | SubPad",
  description: "Every coin launched, what's been paid out, and what's still sitting in escrow.",
};

export default function Subreddits() {
  return (
    <>
      <SceneBackground dim />
      <Nav />
      <main className="form-page">
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ marginBottom: 28 }}>
            <span className="t-eyebrow section-num">Subreddits</span>
            <p className="t-h1" style={{ marginTop: 10 }}>
              What SubPad has generated.
            </p>
          </div>
          <Dashboard />
        </div>
      </main>
    </>
  );
}
