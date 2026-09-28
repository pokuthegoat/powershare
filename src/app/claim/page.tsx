import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { SceneBackground } from "@/components/SceneBackground";
import { ClaimFlow } from "@/components/ClaimFlow";

export const metadata: Metadata = {
  title: "Claim fees | SubPad",
  description: "Verify you moderate a subreddit and claim the fees waiting in its escrow.",
};

export default function Claim() {
  return (
    <>
      <SceneBackground dim />
      <Nav />
      <main className="form-page">
        <div className="container">
          <ClaimFlow />
        </div>
      </main>
    </>
  );
}
