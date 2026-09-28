import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { SceneBackground } from "@/components/SceneBackground";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Help | SubPad",
  description: "Frequently asked questions and risks.",
};

export default function Help() {
  return (
    <>
      <SceneBackground dim />
      <Nav />
      <main className="form-page">
        <div className="container">
          <div className="box form-card placeholder-card">
            <span className="t-eyebrow section-num">Help</span>
            <h1>A fuller help &amp; risks page is coming soon.</h1>
            <p className="t-lead">
              For now, the most common questions are answered on the <Link href="/#faq">homepage FAQ</Link>. For
              anything else, email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
