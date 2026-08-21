import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import { ArrowRight, Home } from "lucide-react";
import "./components/NotFound/notFound.css";

// The global not-found renders inside the bare root layout, which loads no
// font of its own — so this page brings its own.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page does not exist on NexaChat.",
  robots: { index: false, follow: true },
};

/**
 * Catches every route that matches nothing else — including anything under
 * /dashboard, which has no catch-all of its own.
 *
 * The "Open your space" link points at /dashboard unconditionally rather than
 * branching on the session: reading the auth cookie during render would make the
 * prerendered HTML disagree with the hydrated output, and /dashboard already
 * sends a signed-out visitor to /login behind the branded loader.
 */
export default function NotFound() {
  return (
    <div className={`${inter.variable} nf`}>
      <div className="nf-grid" aria-hidden="true" />

      <div className="nf-inner">
        <Link href="/" className="nf-brand" aria-label="NexaChat home">
          <Image src="/nexaChat.png" alt="" width={34} height={34} priority />
          <span>
            Nexa<em>Chat</em>
          </span>
        </Link>

        <p className="nf-code" aria-hidden="true">
          404
        </p>

        <h1 className="nf-title">This conversation doesn&apos;t exist</h1>

        <p className="nf-lead">
          The page you were looking for isn&apos;t here. It may have moved, or the
          link that brought you might have a typo in it.
        </p>

        <div className="nf-chat">
          <div className="nf-msg is-you">
            <span className="nf-face is-me" aria-hidden="true">
              Y
            </span>
            <span className="nf-bubble">Where did this page go?</span>
          </div>

          <div className="nf-msg">
            <span className="nf-face is-them" aria-hidden="true">
              N
            </span>
            <span className="nf-bubble">
              I checked every room — nothing here. Let&apos;s get you back. 🔎
            </span>
          </div>
        </div>

        <div className="nf-actions">
          <Link href="/dashboard" className="nf-btn nf-btn-primary">
            Open your space <ArrowRight size={16} />
          </Link>
          <Link href="/" className="nf-btn nf-btn-outline">
            <Home size={15} /> Back to home
          </Link>
        </div>

        <p className="nf-links">
          <Link href="/guide">User guide</Link>
          <span aria-hidden="true">·</span>
          <Link href="/login">Sign in</Link>
          <span aria-hidden="true">·</span>
          <Link href="/#faq">FAQ</Link>
        </p>
      </div>
    </div>
  );
}
