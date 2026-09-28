import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { SceneBackground } from "@/components/SceneBackground";
import { LaunchForm } from "@/components/LaunchForm";

export const metadata: Metadata = {
  title: "Launch a coin | SubPad",
  description: "Launch a coin for any subreddit. Its trading fees build up in escrow for that community.",
};

export default function Launch() {
  return (
    <>
      <SceneBackground dim />
      <Nav />
      <main className="form-page">
        <div className="container">
          <LaunchForm />
        </div>
      </main>
    </>
  );
}
