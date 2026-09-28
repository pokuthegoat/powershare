import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { SceneBackground } from "@/components/SceneBackground";
import { LaunchButton } from "@/components/Buttons";

export const metadata: Metadata = {
  title: "Subreddits | SubPad",
  description: "Browse subreddits with coins, ranked by fees earned.",
};

export default function Subreddits() {
  return (
    <>
      <SceneBackground dim />
      <Nav />
      <main className="form-page">
        <div className="container">
          <div className="box form-card placeholder-card">
            <span className="t-eyebrow section-num">Subreddits</span>
            <h1>Browse &amp; leaderboard, coming soon.</h1>
            <p className="t-lead">
              Every subreddit with a coin, and a leaderboard ranked by fees earned, will live here once coins start
              launching.
            </p>
            <div className="hero-cta">
              <LaunchButton />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
