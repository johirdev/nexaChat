import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  History,
  Lock,
  Mail,
  MessageSquare,
  MessagesSquare,
  Phone,
  Plus,
  Search,
  Send,
  Shield,
  Smartphone,
  Sparkles,
  UsersRound,
  Zap,
} from "lucide-react";
import HeroChatDemo from "./HeroChatDemo";
import Reveal from "./Reveal";
import VipInvite from "./VipInvite";
import "./landing.css";

const HERO_STATS = [
  { value: "12k+", label: "People already talking on NexaChat" },
  { value: "< 1s", label: "From your keyboard to their screen" },
  { value: "24/7", label: "Always-on delivery, on every device" },
];

const FEATURES = [
  {
    tone: "is-teal",
    icon: MessageSquare,
    title: "Direct messages",
    text: "One-to-one conversations that open the moment you tap a name. Nothing to set up, nobody to invite.",
  },
  {
    tone: "is-violet",
    icon: UsersRound,
    title: "Groups & admins",
    text: "Build a room, add members, hand over admin, rename it later. Everyone sees the change at once.",
  },
  {
    tone: "is-amber",
    icon: Zap,
    title: "Live delivery",
    text: "Messages travel over an open socket, so they land in the same breath you send them. No refresh.",
  },
  {
    tone: "is-blue",
    icon: Lock,
    title: "Private by default",
    text: "Only the people in a conversation can read it. Sessions expire on their own, quietly.",
  },
];

const FLOW = [
  {
    tone: "tone-1",
    title: "Sign in with your number",
    text: "One field for your phone number, one for your name. A new number becomes an account; a familiar one signs you straight in.",
  },
  {
    tone: "tone-2",
    title: "Find your people",
    text: "Search the directory by name or number. Results narrow as you type, and a single tap opens the conversation.",
  },
  {
    tone: "tone-3",
    title: "Start talking",
    text: "Say something. It reaches everyone in the room live — one friend or a group of thirty, it makes no difference.",
  },
];

const ROWS = [
  {
    tone: "is-teal",
    icon: Send,
    title: "Send without waiting",
    text: "Your message appears the instant you hit enter and confirms itself a beat later. If it fails, one tap retries.",
  },
  {
    tone: "is-violet",
    icon: UsersRound,
    title: "Keep groups in step",
    text: "A rename, a new member, a promotion — every member's screen updates together, without anyone reloading.",
  },
  {
    tone: "is-blue",
    icon: History,
    title: "Never lose the thread",
    text: "Scroll up and older messages load as you reach them, holding your place exactly where you left it.",
  },
];

const PLATFORM = [
  {
    label: "Conversations",
    title: "Direct and group, one list",
    text: "Everything you are part of sits in a single rail, newest first, with a live preview of the last thing said.",
  },
  {
    label: "People",
    title: "A directory that keeps up",
    text: "Search by name or phone number and watch results narrow with every keystroke as more load on scroll.",
  },
  {
    label: "Realtime",
    title: "One socket, every screen",
    text: "Messages and group changes are pushed the moment they happen, and the app reconnects on its own.",
  },
  {
    label: "Anywhere",
    title: "Phone, tablet, desktop",
    text: "One pane at a time on a phone, side by side on a desktop — the same conversation, shaped to the screen.",
  },
];

/** Exported so the page's FAQPage structured data cannot drift from the copy. */
export const FAQ = [
  {
    q: "Do I need a password?",
    a: "No. Your phone number is the account. Enter it along with your name and you are in — a number we have not seen before simply becomes a new account, with nothing else to fill in.",
  },
  {
    q: "How fast is “realtime”, really?",
    a: "Messages are pushed over a WebSocket rather than polled, so they usually appear on the other screen in well under a second. If your connection drops, NexaChat reconnects on its own and catches up on what it missed.",
  },
  {
    q: "Can I chat with more than one person?",
    a: "Yes. Create a group, name it, and add whoever you like. The creator starts as an admin and can add or remove members, promote other admins, or rename the room. Any member can leave whenever they want.",
  },
  {
    q: "Does it work on my phone?",
    a: "NexaChat is built for every screen. On a phone you see the list and the conversation one at a time, the way a messenger should behave; on a larger screen you get both side by side, plus the group panel.",
  },
  {
    q: "Who can read my messages?",
    a: "Only the people in the conversation. Group content stays inside the group, direct messages stay between the two of you, and your session token expires on its own schedule.",
  },
  {
    q: "What does it cost?",
    a: "Nothing to start and nothing for everyday conversations. There is no card to enter, no trial countdown, and no feature held back behind a plan.",
  },
];

export default function HomeLandingPage() {
  return (
    <div className="ln" id="top">
      {/* ============================================================ HERO */}
      <section className="ln-hero">
        <div className="ln-hero-grid" aria-hidden="true" />

        <div className="ln-wrap ln-hero-inner">
          <Reveal className="ln-hero-copy">
            <span className="ln-pill">
              <Sparkles size={14} aria-hidden="true" />
              Realtime chat for your people
            </span>

            <h1>
              Modern and secure{" "}
              <span className="ln-brand-text">realtime chat</span> for everyone
              you know.
            </h1>

            <p className="ln-hero-lead">
              NexaChat brings your people, ideas and everyday moments into one
              beautifully simple place — and delivers every word of it live, on
              whatever screen you happen to be holding.
            </p>

            <div className="ln-hero-actions">
              <Link href="/login" className="ln-btn ln-btn-primary">
                Start chatting free <ArrowRight size={16} />
              </Link>
              <a href="#how" className="ln-btn ln-btn-outline">
                See how it works
              </a>
            </div>

            <div className="ln-hero-stats">
              {HERO_STATS.map((stat) => (
                <div className="ln-hero-stat" key={stat.value}>
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <HeroChatDemo />
          </Reveal>
        </div>
      </section>

      {/* ======================================================== FEATURES */}
      <section className="ln-section is-soft" id="features">
        <div className="ln-wrap">
          <Reveal className="ln-head">
            <span className="ln-eyebrow">Core features</span>
            <h2 className="ln-h2">Everything a conversation needs.</h2>
            <p className="ln-sub">
              Direct chats, groups, live delivery and privacy — the four things
              a messenger has to get right, and the four things NexaChat is
              built around.
            </p>
          </Reveal>

          <div className="ln-cards-4">
            {FEATURES.map((feature, index) => (
              <Reveal
                as="article"
                className="ln-card"
                key={feature.title}
                delay={index * 90}
              >
                <span className={`ln-chip ${feature.tone}`}>
                  <feature.icon size={20} />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== SHOWCASE */}
      <section className="ln-section">
        <div className="ln-wrap">
          <Reveal className="ln-head is-center">
            <span className="ln-eyebrow">The whole thing</span>
            <h2 className="ln-h2" style={{ maxWidth: "none" }}>
              Your conversations, in one clear window.
            </h2>
            <p className="ln-sub">
              Every chat you are part of on the left, the one you are reading on
              the right, and a composer that never makes you wait.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="ln-shot">
              <Image
                src="/images/chat-app.svg"
                alt="The NexaChat workspace: a list of conversations on the left and an open chat with Amelia Chen on the right"
                width={1200}
                height={750}
                unoptimized
                priority
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ FLOW */}
      <section className="ln-section is-soft" id="how">
        <div className="ln-wrap">
          <Reveal className="ln-head">
            <span className="ln-eyebrow">How it works</span>
            <h2 className="ln-h2">A smoother flow from hello to habit.</h2>
            <p className="ln-sub">
              No onboarding maze, no invitation codes. The path from opening
              NexaChat to talking with someone is about a minute long.
            </p>
          </Reveal>

          <div className="ln-flow">
            {FLOW.map((step, index) => (
              <Reveal
                as="article"
                className={`ln-flow-card ${step.tone}`}
                key={step.title}
                delay={index * 100}
              >
                <span className="ln-flow-num">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================== SPLIT */}
      <section className="ln-section">
        <div className="ln-wrap ln-split">
          <Reveal className="ln-panel">
            <span className="ln-eyebrow">Everyday use</span>
            <h2
              className="ln-h2"
              style={{ fontSize: "clamp(1.7rem,3.2vw,2.4rem)" }}
            >
              Talk better every day.
            </h2>
            <p className="ln-sub">
              The small things are what make a chat app feel good. NexaChat
              spends its effort on the parts you touch a hundred times a day.
            </p>

            <ul className="ln-checks">
              <li>
                <Check size={17} aria-hidden="true" />
                <span>
                  <b>Optimistic sending</b> — your words are on screen before
                  the server answers.
                </span>
              </li>
              <li>
                <Check size={17} aria-hidden="true" />
                <span>
                  <b>Live group updates</b> — renames and new members appear for
                  everyone together.
                </span>
              </li>
              <li>
                <Check size={17} aria-hidden="true" />
                <span>
                  <b>Search that keeps up</b> — the directory narrows with every
                  keystroke you type.
                </span>
              </li>
            </ul>
          </Reveal>

          <div className="ln-rows">
            {ROWS.map((row, index) => (
              <Reveal
                as="article"
                className="ln-row"
                key={row.title}
                delay={index * 100}
              >
                <span
                  className={`ln-chip ${row.tone}`}
                  style={{ marginBottom: 0 }}
                >
                  <row.icon size={19} />
                </span>
                <div className="ln-row-body">
                  <h3>{row.title}</h3>
                  <p>{row.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== PLATFORM */}
      <section className="ln-section is-soft" id="platform">
        <div className="ln-wrap">
          <Reveal>
            <div className="ln-platform">
              <div>
                <span className="ln-eyebrow">Connected platform</span>
                <h2
                  className="ln-h2"
                  style={{ fontSize: "clamp(1.7rem,3.4vw,2.5rem)" }}
                >
                  Run every conversation from one place.
                </h2>
                <p className="ln-sub">
                  People, direct chats, groups and live updates share a single
                  source of truth — so what you see is what everyone else sees,
                  at the same moment.
                </p>
              </div>

              <div className="ln-platform-grid">
                {PLATFORM.map((item) => (
                  <div className="ln-platform-item" key={item.title}>
                    <span className="ln-platform-label">{item.label}</span>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================================== TEAMS */}
      <section className="ln-section" id="groups">
        <div className="ln-wrap ln-split is-flip">
          <Reveal>
            <div className="ln-shot">
              <Image
                src="/images/chat-groups.svg"
                alt="A NexaChat group conversation with the member and admin panel open"
                width={900}
                height={640}
                unoptimized
              />
            </div>
          </Reveal>

          <Reveal delay={120} className="ln-panel">
            <span className="ln-eyebrow">For teams &amp; circles</span>
            <h2
              className="ln-h2"
              style={{ fontSize: "clamp(1.7rem,3.2vw,2.4rem)" }}
            >
              Groups that run themselves.
            </h2>
            <p className="ln-sub">
              Start a room for a project, a family or a launch. Admins add and
              remove people, promote others, and rename the group — and everyone
              watches it happen live.
            </p>

            <div className="ln-tags">
              <span className="ln-tag">Add members</span>
              <span className="ln-tag">Promote admins</span>
              <span className="ln-tag">Rename anytime</span>
              <span className="ln-tag">Leave freely</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========================================================== MOBILE */}
      <section className="ln-section is-soft" id="mobile">
        <div className="ln-wrap ln-split">
          <Reveal className="ln-panel">
            <span className="ln-eyebrow">On every screen</span>
            <h2
              className="ln-h2"
              style={{ fontSize: "clamp(1.7rem,3.2vw,2.4rem)" }}
            >
              Chat anywhere, from any device.
            </h2>
            <p className="ln-sub">
              NexaChat runs in the browser you already have. Open it on a phone
              between stops, on a laptop at your desk, and pick the conversation
              up exactly where you left it.
            </p>

            <ul className="ln-checks">
              <li>
                <Smartphone size={17} aria-hidden="true" />
                <span>
                  <b>Phone-first layout</b> — one pane at a time, the way a
                  messenger should behave.
                </span>
              </li>
              <li>
                <Clock size={17} aria-hidden="true" />
                <span>
                  <b>Nothing to install</b> — no store, no update prompts, no
                  waiting for a download.
                </span>
              </li>
              <li>
                <Shield size={17} aria-hidden="true" />
                <span>
                  <b>Same session everywhere</b> — sign in once and your chats
                  follow you.
                </span>
              </li>
            </ul>

            <div className="ln-hero-actions" style={{ marginTop: 28 }}>
              <Link href="/dashboard" className="ln-btn ln-btn-primary">
                Open NexaChat <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="ln-shot is-plain">
              <Image
                src="/images/chat-mobile.svg"
                alt="NexaChat on two phones, showing the conversation list and an open chat"
                width={760}
                height={640}
                unoptimized
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================================================= VIP */}
      <VipInvite />

      {/* ============================================================= FAQ */}
      <section className="ln-section" id="faq">
        <div className="ln-wrap">
          <Reveal className="ln-head">
            <span className="ln-eyebrow">FAQ</span>
            <h2 className="ln-h2">Frequently asked questions.</h2>
            <p className="ln-sub">
              Straight answers for anyone deciding whether NexaChat is the right
              home for their conversations.
            </p>
          </Reveal>

          <div className="ln-faq-split">
            <div className="ln-faq">
              {FAQ.map((item, index) => (
                <Reveal as="div" key={item.q} delay={index * 60}>
                  <details className="ln-q">
                    <summary>
                      {item.q}
                      <Plus size={17} aria-hidden="true" />
                    </summary>
                    <p className="ln-q-body">{item.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>

            <Reveal delay={140}>
              <div className="ln-contact">
                <h3>Talk to the NexaChat team</h3>
                <p>
                  Still deciding, or building something similar? Tell us what
                  you need and we will get back to you.
                </p>

                <ul className="ln-contact-list">
                  <li>
                    <Phone size={17} aria-hidden="true" />
                    <div>
                      <span>Phone</span>
                      <b>+880 1824 842336</b>
                    </div>
                  </li>
                  <li>
                    <Mail size={17} aria-hidden="true" />
                    <div>
                      <span>Email</span>
                      <b>johirulislam574206@gmail.com</b>
                    </div>
                  </li>
                  <li>
                    <Search size={17} aria-hidden="true" />
                    <Link href="/docs" className="ln-contact-docs ">
                      <span>Docs</span>
                      <b className="hover:underline">Read the User Guide</b>
                    </Link>
                  </li>
                </ul>

                <Link href="/login" className="ln-btn ln-btn-primary">
                  Create your account <ArrowRight size={16} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================= CTA */}
      <section className="ln-cta" id="start">
        <div className="ln-wrap">
          <Reveal>
            <div className="ln-cta-inner">
              <span className="ln-eyebrow">Your next conversation</span>
              <h2>
                Good things start
                <br />
                with a message.
              </h2>
              <p>
                Bring your people together in a space that feels like yours. It
                takes a phone number and about a minute.
              </p>

              <div className="ln-cta-actions">
                <Link href="/login" className="ln-btn ln-btn-primary">
                  Start chatting free <ArrowRight size={16} />
                </Link>
                <a href="#vip" className="ln-btn ln-btn-outline">
                  <MessagesSquare size={16} /> Claim VIP first
                </a>
              </div>

              <p className="ln-cta-note">
                Free to start · No card · No password to remember
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
