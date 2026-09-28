import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { SceneBackground } from "@/components/SceneBackground";
import { AuthPage } from "@/components/AuthPage";

export const metadata: Metadata = {
  title: "Sign up | SubPad",
  description: "Create your SubPad account by connecting your wallet.",
};

export default function SignUp() {
  return (
    <>
      <SceneBackground dim />
      <Nav />
      <main className="auth-page">
        <AuthPage mode="signup" />
      </main>
    </>
  );
}
