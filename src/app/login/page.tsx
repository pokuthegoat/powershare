import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { SceneBackground } from "@/components/SceneBackground";
import { AuthPage } from "@/components/AuthPage";

export const metadata: Metadata = {
  title: "Log in | SubPad",
  description: "Log in to your SubPad account.",
};

export default function LogIn() {
  return (
    <>
      <SceneBackground dim />
      <Nav />
      <main className="auth-page">
        <AuthPage mode="login" />
      </main>
    </>
  );
}
