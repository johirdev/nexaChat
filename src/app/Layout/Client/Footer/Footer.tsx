import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import "@/src/app/components/HomeLandingPage/landing.css";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#how", label: "How it works" },
      { href: "/#groups", label: "Groups & admins" },
      { href: "/#mobile", label: "On mobile" },
    ],
  },
  {
    title: "Quick links",
    links: [
      { href: "/guide", label: "User guide" },
      { href: "/login", label: "Sign in" },
      { href: "/#vip", label: "Become a VIP" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
];

const CONTACT = [
  { Icon: Phone, label: "+880 1824 842336" },
  { Icon: Mail, label: "johirulislam574206@gmail.com" },
  { Icon: MapPin, label: "Gulshan, Dhaka, Bangladesh" },
];

/* Brand marks are drawn inline: lucide deprecated its social icons, and these
   never change shape anyway. */
const SOCIALS = [
  {
    label: "NexaChat on X",
    path: "M18.9 2H22l-7.1 8.1L23.2 22h-6.6l-5.2-6.8L5.5 22H2.4l7.6-8.7L1.2 2h6.7l4.7 6.2L18.9 2Zm-1.1 18.1h1.8L6.9 3.8H5L17.8 20.1Z",
  },
  {
    label: "NexaChat on GitHub",
    path: "M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.4-3.4-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.5 2.3 1.1 2.9.9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z",
  },
  {
    label: "NexaChat on LinkedIn",
    path: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.57-2.3 3.2V21h-4V9Z",
  },
];

export default function Footer() {
  return (
    <footer className="ln-footer">
      <div className="ln-wrap">
        <div className="ln-footer-top">
          <div className="ln-footer-about">
            <Link href="/" className="ln-brand" aria-label="NexaChat home">
              <Image src="/nexaChat.png" alt="" width={34} height={34} />
              <span>
                Nexa<em>Chat</em>
              </span>
            </Link>
            <p>
              A realtime messenger for direct chats and groups. Your people,
              your rooms, delivered live to every screen you own.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div className="ln-footer-col" key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    {link.href.startsWith("/") ? (
                      <Link href={link.href}>{link.label}</Link>
                    ) : (
                      <a href={link.href}>{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="ln-footer-col">
            <h3>Contact</h3>
            <ul>
              {CONTACT.map(({ Icon, label }) => (
                <li
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "var(--ln-body)",
                    fontSize: "0.85rem",
                  }}
                >
                  <Icon
                    size={15}
                    style={{ color: "var(--ln-brand)", flexShrink: 0 }}
                  />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ln-footer-bottom">
          <small>
            © {new Date().getFullYear()} NexaChat. Made for better
            conversations.
          </small>

          <div className="ln-socials">
            {SOCIALS.map(({ label, path }) => (
              <a key={label} href="#top" aria-label={label}>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
