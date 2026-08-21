import type { Metadata } from "next";
import LoginGate from "../../components/Auth/LoginGate";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to NexaChat with your phone number — no password and no sign-up form.",
  alternates: { canonical: "/login" },
  // A form has nothing to offer a search result, and indexing it would compete
  // with the landing page for the brand query.
  robots: { index: false, follow: true, nocache: true },
};

export default function LoginPage() {
  return <LoginGate />;
}
