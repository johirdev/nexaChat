"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
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
          <a href="#features" onClick={() => setOpen(false)}>
            Features
          </a>
          <a href="#why" onClick={() => setOpen(false)}>
            Why NexaChat
          </a>
          <a href="#preview" onClick={() => setOpen(false)}>
            Preview
          </a>
          <a
            className="site-nav-cta"
            href="#start"
            onClick={() => setOpen(false)}
          >
            Start chatting <span>↗</span>
          </a>
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
