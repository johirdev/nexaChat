"use client";

import { AuthContext } from "@/src/app/AuthProvider";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContext, useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, token, logOut } = useContext(AuthContext);
  console.log(user, token, "sdfsdfkj");
  return (
    <header className="site-nav">
      <div className="max-width site-nav-inner">
        <Link href="/" className="site-brand" aria-label="NexaChat home">
          <Image width={60} height={60} src="/nexaChat.png" alt="NexaChat" />{" "}
          <span>
            Nexa<span>Chat</span>
          </span>
        </Link>
        <nav className={open ? "site-nav-links is-open" : "site-nav-links"}>
          <Link href="#features" onClick={() => setOpen(false)}>
            Features
          </Link>
          <Link href="#why" onClick={() => setOpen(false)}>
            Why NexaChat
          </Link>
          <Link href="#preview" onClick={() => setOpen(false)}>
            Preview
          </Link>
          {token ? (
            <>
              <Link
                className="site-nav-cta"
                href="/dashboard"
                onClick={() => setOpen(false)}
              >
                Start chatting <span>↗</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                className="site-nav-cta"
                href="/login"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            </>
          )}
        </nav>
        <button
          className="site-menu"
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
