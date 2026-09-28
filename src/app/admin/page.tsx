import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { SceneBackground } from "@/components/SceneBackground";
import { AdminPanel } from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "Admin | SubPad",
  robots: { index: false, follow: false },
};

export default function Admin() {
  return (
    <>
      <SceneBackground dim />
      <Nav />
      <main className="form-page">
        <div className="container" style={{ maxWidth: 760 }}>
          <AdminPanel />
        </div>
      </main>
    </>
  );
}
