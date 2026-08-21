"use client";

import { useCallback, useContext, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Crown,
  RotateCcw,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Confetti from "./Confetti";
import { AuthContext } from "../../AuthProvider";

const PERKS = [
  {
    icon: BadgeCheck,
    title: "Founding VIP badge",
    text: "sits beside your name in every conversation",
  },
  {
    icon: Zap,
    title: "First in line",
    text: "for every feature we ship, before anyone else",
  },
  {
    icon: Star,
    title: "Priority in your groups",
    text: "start unlimited rooms with whoever matters",
  },
  {
    icon: Crown,
    title: "A permanent seat",
    text: "on the Nexa founding wall — your name stays",
  },
];


export default function VipInvite() {
    const { token } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [claimed, setClaimed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fireKey, setFireKey] = useState(0);

  const claim = useCallback(
    (event: FormEvent) => {
      event.preventDefault();

      const trimmed = name.trim().replace(/\s+/g, " ");

      if (trimmed.length < 2) {
        setError("Please enter at least two characters so we can name your badge.");
        return;
      }
      if (trimmed.length > 40) {
        setError("That name is a little long — try a shorter one.");
        return;
      }

      setError(null);
      setClaimed(trimmed);
      setFireKey((key) => key + 1);
    },
    [name],
  );

  const reset = useCallback(() => {
    setClaimed(null);
    setName("");
    setError(null);
  }, []);

  const firstName = claimed?.split(" ")[0] ?? "";

  return (
    <section className="ln-vip" id="vip">
      <div className="ln-wrap">
        <div className="ln-vip-card">
          <Confetti fireKey={fireKey} />

          {!claimed ? (
            <>
              <span className="ln-eyebrow">Founding members</span>
              <h2>
                Join now and become a{" "}
                <span className="ln-brand-text">VIP Nexa person</span>.
              </h2>
              <p className="ln-sub" style={{ marginInline: "auto" }}>
                We are opening NexaChat to a first circle of people who help
                shape it. Put your name in and see what comes with the badge.
              </p>

              <form className="ln-vip-form" onSubmit={claim} noValidate>
                <input
                  className="ln-vip-input"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Your name"
                  aria-label="Your name"
                  aria-invalid={Boolean(error)}
                  maxLength={44}
                  autoComplete="given-name"
                />
                <button type="submit" className="ln-btn ln-btn-primary">
                  <Sparkles size={16} />
                  Claim VIP
                </button>
              </form>

              {error && (
                <p className="ln-vip-error" role="alert">
                  {error}
                </p>
              )}

              <p className="ln-vip-note">
                No email, no card — your name stays in this browser.
              </p>
            </>
          ) : (
            <div className="ln-vip-win">
              <span className="ln-vip-crest" aria-hidden="true">
                <Crown size={40} />
              </span>

              <span className="ln-vip-tier">
                <Sparkles size={12} /> VIP Nexa person
              </span>

              <h2>
                Congratulations,{" "}
                <span className="ln-vip-name">{firstName}</span>!
              </h2>

              <p className="ln-sub" style={{ marginInline: "auto" }}>
                You are on the founding list. Join NexaChat and this badge comes
                with you into every conversation.
              </p>

              <ul className="ln-perks">
                {PERKS.map((perk, index) => (
                  <li
                    key={perk.title}
                    style={{ animationDelay: `${260 + index * 130}ms` }}
                  >
                    <perk.icon size={17} aria-hidden="true" />
                    <span>
                      <b>{perk.title}</b> — {perk.text}
                    </span>
                  </li>
                ))}
              </ul>
              {token ? (
                <>
                  <div className="ln-vip-actions">
                    <Link href="/dashboard" className="ln-btn ln-btn-primary">
                     Open Your Space <ArrowUpRight size={16} />
                    </Link>
                   
                  </div>
                </>
              ) : (
                <>
                  <div className="ln-vip-actions">
                    <Link href="/login" className="ln-btn ln-btn-primary">
                      Claim it for real <ArrowUpRight size={16} />
                    </Link>
                    <button
                      type="button"
                      className="ln-btn ln-btn-outline"
                      onClick={reset}
                    >
                      <RotateCcw size={15} /> Use another name
                    </button>
                  </div>
                </>
              )}

              <p
                aria-live="polite"
                className="ln-sr"
              >{`Congratulations ${firstName}, you are now a VIP Nexa person.`}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
