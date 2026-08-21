"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/src/app/AuthProvider";
import BrandLoader from "@/src/app/components/Brand/BrandLoader";
import LoginForm from "./LoginForm";

/**
 * Keeps a signed-in visitor out of the sign-in form.
 *
 * The form is always rendered so the page's HTML is the form, not a spinner;
 * the branded screen sits over it while the session is being resolved and
 * while the redirect to /dashboard is on its way. For a visitor with no cookie
 * that check finishes in the same tick, so the overlay is never really seen.
 */
export default function LoginGate() {
  const { status } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (status === "authed") router.replace("/dashboard");
  }, [status, router]);

  return (
    <>
      <LoginForm />

      {status !== "guest" && (
        <BrandLoader
          variant="overlay"
          message={
            status === "authed" ? "Welcome back" : "Checking your session…"
          }
          note={
            status === "authed"
              ? "You are already signed in — opening your space."
              : undefined
          }
        />
      )}
    </>
  );
}
