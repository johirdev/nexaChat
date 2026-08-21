"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { AuthContext } from "@/src/app/AuthProvider";
import "@/src/app/components/HomeLandingPage/landing.css";

/**
 * Section links are written absolute (`/#features`) so they still work from
 * /guide or /login, where the target section is on another route.
 */
const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/guide", label: "Guide" },
  { href: "/#groups", label: "Groups" },
  { href: "/#faq", label: "FAQ" },
];

/** Distance scrolled before the bar earns its border. */
const STUCK_AFTER = 12;

export default function Navbar() {
  const { token, loading } = useContext(AuthContext);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsStuck(window.scrollY > STUCK_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const close = useCallback(() => setIsOpen(false), []);

  const isSignedIn = Boolean(token);
  const ctaHref = isSignedIn ? "/dashboard" : "/login";
  const ctaLabel = isSignedIn ? "Open your space" : "Start chatting free";

  return (
    <header className={`ln-nav${isStuck ? " is-stuck" : ""}`}>
      <div className="ln-wrap ln-nav-inner">
        <Link href="/" className="ln-brand" aria-label="NexaChat home">
          <Image src="/nexaChat.png" alt="" width={40} height={40} priority />
          <span>
            Nexa<em>Chat</em>
          </span>
        </Link>

        <nav className="ln-nav-links" aria-label="Primary">
          {LINKS.map((link) => {
            const isCurrent = link.href === pathname;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={isCurrent ? "is-current" : undefined}
                aria-current={isCurrent ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ln-nav-right">
          {loading ? (
            <span
              className="ln-nav-auth-skeleton"
              aria-label="Loading account actions"
              role="status"
            />
          ) : (
            <>
              {!isSignedIn && (
                <Link href="/login" className="ln-nav-signin">
                  Sign in
                </Link>
              )}

              <Link href={ctaHref} className="ln-btn ln-btn-primary ln-nav-cta">
                {ctaLabel} <ArrowRight size={15} />
              </Link>
            </>
          )}

          <button
            type="button"
            className="ln-burger"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="ln-mobile-menu"
          >
            {isOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      <div
        id="ln-mobile-menu"
        className={`ln-drawer${isOpen ? " is-open" : ""}`}
      >
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={close}
            aria-current={link.href === pathname ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
        <Link href={ctaHref} className="ln-btn ln-btn-primary" onClick={close}>
          {ctaLabel} <ArrowRight size={15} />
        </Link>
      </div>
    </header>
  );
}
