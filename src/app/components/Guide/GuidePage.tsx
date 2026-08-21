import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  History,
  Keyboard,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  TriangleAlert,
  Wifi,
} from "lucide-react";
import Reveal from "../HomeLandingPage/Reveal";
import GuideWalkthrough, { type GuideStep } from "./GuideWalkthrough";
import "../HomeLandingPage/landing.css";
import "./guide.css";

/** Exported so the HowTo structured data is generated from the same source. */
export const STEPS: GuideStep[] = [
  {
    title: "Sign in",
    hint: "A number and a name — nothing else",
    kicker: "Step one",
    heading: "Sign in with your phone number",
    body: "NexaChat has no separate sign-up. Type your name and your phone number, press Continue, and you are in. If the number is new to us an account is created on the spot; if we already know it, you are signed straight back into your conversations.",
    notices: [
      {
        title: "No password exists",
        text: "there is nothing to forget and nothing to reset",
      },
      {
        title: "Any format works",
        text: "01824842336 and +8801824842336 are both fine",
      },
      {
        title: "Your session persists",
        text: "close the tab and come back — you stay signed in until the token expires",
      },
    ],
    image: "/images/guide-login.svg",
    alt: "The NexaChat sign-in card with a name field and a phone number field filled in",
  },
  {
    title: "Find your people",
    hint: "Search the directory by name or number",
    kicker: "Step two",
    heading: "Open the People tab and search",
    body: "The rail on the left has two tabs. Chats holds your conversations; People is the full directory. Start typing a name or a phone number and the list narrows on every keystroke, with the matching part of each name highlighted so you can see why a row appeared.",
    notices: [
      {
        title: "Search is forgiving",
        text: "case does not matter, and a partial name or a few digits of a number is enough",
      },
      {
        title: "Twenty at a time",
        text: "scroll the rail and the next twenty people load in as you reach them",
      },
      {
        title: "One tap opens the chat",
        text: "picking a person creates the conversation if it does not exist yet",
      },
    ],
    image: "/images/guide-people.svg",
    alt: "The People tab with a search term typed and matching names highlighted",
  },
  {
    title: "Send a message",
    hint: "Type, press Enter, watch it land",
    kicker: "Step three",
    heading: "Say something — it arrives live",
    body: "Type in the composer and press Enter. Your message appears immediately, marked as sending, and switches to a tick the moment the server confirms it. On the other person's screen it simply appears — no refresh, no polling, no delay you would notice.",
    notices: [
      {
        title: "Enter sends, Shift+Enter breaks the line",
        text: "the box grows as you write and scrolls once it gets tall",
      },
      {
        title: "A failed message never disappears",
        text: "it stays in place with Retry and Discard next to it",
      },
      {
        title: "Older messages load as you scroll up",
        text: "and your place in the thread is kept exactly where it was",
      },
    ],
    image: "/images/guide-send.svg",
    alt: "A NexaChat thread with one message delivered and one still sending",
  },
  {
    title: "Start a group",
    hint: "Name it, pick people, create",
    kicker: "Step four",
    heading: "Build a room for more than two",
    body: "Hit New group at the top of the Chats tab. Give the room a name, search for the people you want in it, and create. You become its first admin automatically, and everyone you added sees the group appear in their own rail straight away.",
    notices: [
      {
        title: "At least one other person",
        text: "a group of one is just a note to self, so the button waits for a second member",
      },
      {
        title: "Search inside the picker",
        text: "the same directory search, with the people you have chosen shown as chips",
      },
      {
        title: "Rename it later",
        text: "nothing about the group is fixed at creation time",
      },
    ],
    image: "/images/guide-newgroup.svg",
    alt: "The New group dialog with a name typed and three members selected",
  },
  {
    title: "Run the group",
    hint: "Members, admins, renames, leaving",
    kicker: "Step five",
    heading: "Manage members and admins",
    body: "Open any group and press the info button in its header. The panel lists every member, marks the admins, and — if you are one — gives you the controls to add people, remove them, promote someone else, or rename the room. Every change reaches all the other members live.",
    notices: [
      {
        title: "Admins see more",
        text: "add, remove, promote and rename appear only for admins; everyone can leave",
      },
      {
        title: "Promotions are permanent",
        text: "there is no demote, so hand the badge over deliberately",
      },
      {
        title: "Leaving is instant",
        text: "the group drops out of your rail and an admin has to add you back",
      },
    ],
    image: "/images/chat-groups.svg",
    alt: "A group conversation with the member and admin panel open",
  },
  {
    title: "Tidy your list",
    hint: "Select several chats, remove them together",
    kicker: "Step six",
    heading: "Clear out the chats you are done with",
    body: "Press Select at the top of the Chats tab and a tick box appears on every row. Choose as many as you like — direct chats and groups can be mixed — then press Delete and they all disappear from your rail at once.",
    notices: [
      {
        title: "All or none in one tap",
        text: "the All button ticks every visible chat, and tapping it again clears the lot",
      },
      {
        title: "This is your list, not the server",
        text: "removing a chat hides it for you; nobody else notices and no message is destroyed",
      },
      {
        title: "Restore whenever you want",
        text: "a Restore link sits under the list, and a fresh session brings everything back anyway",
      },
    ],
    image: "/images/guide-select.svg",
    alt: "Selection mode in the chat rail with two conversations ticked and a delete button ready",
  },
  {
    title: "Take it anywhere",
    hint: "Same session on every screen",
    kicker: "Step seven",
    heading: "Carry it in your pocket",
    body: "NexaChat runs in the browser you already have — nothing to install and nothing to update. On a phone you get one pane at a time, list then conversation, the way a messenger should behave. On a laptop you see both side by side, plus the group panel.",
    notices: [
      {
        title: "One account, every device",
        text: "sign in once per browser and your conversations follow",
      },
      {
        title: "Reconnects on its own",
        text: "lose signal in a lift and the app catches itself up on the way out",
      },
      {
        title: "Back arrow returns to the list",
        text: "on phones the header keeps a back button to the conversation rail",
      },
    ],
    image: "/images/chat-mobile.svg",
    alt: "NexaChat running on two phones, showing the conversation list and an open chat",
  },
];

const LEGEND = [
  {
    title: "Brand and tabs",
    text: "switch between Chats and People; the badge counts your conversations.",
  },
  {
    title: "Search",
    text: "filters whichever list is open, narrowing as you type.",
  },
  {
    title: "Conversation list",
    text: "newest activity first, with a preview of the last thing said in each room.",
  },
  {
    title: "Your account",
    text: "the card at the bottom of the rail, with sign-out beside it.",
  },
  {
    title: "Thread header",
    text: "who you are talking to, the live indicator, and the info panel toggle.",
  },
  {
    title: "Composer",
    text: "type here; Enter sends and the send button lights up when there is something to send.",
  },
];

const TIPS = [
  {
    icon: Keyboard,
    title: "Enter and Shift+Enter",
    body: "Enter sends the message. Shift+Enter drops to a new line without sending, so a longer thought stays in one bubble.",
  },
  {
    icon: RefreshCw,
    title: "Retry a failed send",
    body: "If a message cannot reach the server it stays on screen in red with Retry and Discard. Nothing you typed is ever thrown away silently.",
  },
  {
    icon: Wifi,
    title: "Watch the Live pill",
    body: "The header pill shows the realtime connection. Green means live; amber means reconnecting. You can keep sending either way.",
  },
  {
    icon: History,
    title: "Scroll up for history",
    body: "Older messages load automatically as you reach the top of a thread, and your scroll position is preserved while they arrive.",
  },
  {
    icon: ShieldCheck,
    title: "Know who is an admin",
    body: "The group panel marks every admin. If the add and remove controls are missing, you are a member rather than an admin in that room.",
  },
  {
    icon: Trash2,
    title: "Deleting is local",
    body: "Select and Delete tidy your own rail. The messages stay on the server, the other person sees nothing change, and Restore puts everything back.",
  },
  {
    icon: LogOut,
    title: "Signing out",
    body: "The button beside your name at the bottom of the rail clears the session on this device. Your conversations stay waiting for next time.",
  },
];

/** Exported so the FAQPage structured data reuses the same answers. */
export const TROUBLE = [
  {
    q: "I typed a name but nobody comes up",
    a: "Try fewer characters, or search by phone number instead. The directory only contains people who have signed in to NexaChat at least once — if your friend has never opened it, they will not appear until they do.",
  },
  {
    q: "The Live pill says reconnecting",
    a: "The realtime connection dropped, usually because the network changed. NexaChat retries on its own with a growing delay and catches up on anything it missed once it is back. You can keep sending in the meantime; messages go over the normal request path.",
  },
  {
    q: "My message is stuck on sending",
    a: "Give it a moment — a sleeping server can take a few seconds to wake. If it turns red, press Retry. If it keeps failing, check that you are still signed in by reloading the page.",
  },
  {
    q: "I cannot rename a group or add members",
    a: "Those controls belong to admins. Open the group panel and check the badges: if your name has no Admin chip, ask one of the admins listed there to make the change or promote you.",
  },
  {
    q: "I was removed from a group by mistake",
    a: "The conversation disappears from your rail the moment it happens. Only an admin of that group can add you back — message one of them directly and they can do it from the group panel.",
  },
  {
    q: "I deleted a chat — is it gone for good?",
    a: "No. Deleting from the Chats tab removes a conversation from your own list and nothing else: the messages stay on the server, the other person sees no change, and the group carries on without you noticing anything. Use the Restore link under the list to bring them straight back, and in any case a fresh session starts with the full list again. If you actually want out of a group, open its info panel and use Leave group instead.",
  },
];

export default function GuidePage() {
  return (
    <div className="gd" id="top">
      {/* ============================================================ HERO */}
      <section className="gd-hero">
        <div className="gd-hero-grid" aria-hidden="true" />

        <div className="ln-wrap gd-hero-inner">
          <span className="ln-pill">
            <BookOpen size={14} aria-hidden="true" />
            User guide
          </span>

          <h1>
            Your first five minutes with{" "}
            <span className="ln-brand-text">NexaChat</span>.
          </h1>

          <p className="ln-sub" style={{ marginInline: "auto" }}>
            Seven short steps from an empty screen to a live group conversation.
            Follow along here, then do the same thing for real — it takes about as
            long as reading this page.
          </p>

          <div className="gd-meta">
            <span>
              <Sparkles size={14} aria-hidden="true" /> {STEPS.length} steps
            </span>
            <span>
              <Clock size={14} aria-hidden="true" /> About 5 minutes
            </span>
            <span>
              <ShieldCheck size={14} aria-hidden="true" /> No setup needed
            </span>
          </div>

          <div className="ln-hero-actions" style={{ justifyContent: "center" }}>
            <a href="#walkthrough" className="ln-btn ln-btn-primary">
              Start the walkthrough <ArrowRight size={16} />
            </a>
            <Link href="/login" className="ln-btn ln-btn-outline">
              Skip and sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================== WALKTHROUGH */}
      <GuideWalkthrough steps={STEPS} />

      {/* ========================================================== LEGEND */}
      <section className="ln-section" id="workspace">
        <div className="ln-wrap">
          <Reveal className="ln-head is-center">
            <span className="ln-eyebrow">Know your workspace</span>
            <h2 className="ln-h2" style={{ maxWidth: "none" }}>
              What everything on screen does.
            </h2>
            <p className="ln-sub">
              One window, six regions. Once you can name them, everything else in
              NexaChat is obvious.
            </p>
          </Reveal>

          <div className="gd-legend">
            <Reveal>
              <div className="ln-shot">
                <Image
                  src="/images/chat-app.svg"
                  alt="The NexaChat workspace: conversation rail on the left, open thread on the right"
                  width={1200}
                  height={750}
                  unoptimized
                />
              </div>
            </Reveal>

            <Reveal delay={120}>
              <ul className="gd-legend-list">
                {LEGEND.map((item, index) => (
                  <li key={item.title}>
                    <span className="gd-pin" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div>
                      <b>{item.title}</b>
                      <span>{item.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================ TIPS */}
      <section className="ln-section is-soft" id="tips">
        <div className="ln-wrap">
          <Reveal className="ln-head">
            <span className="ln-eyebrow">Handy to know</span>
            <h2 className="ln-h2">Small things that make it faster.</h2>
            <p className="ln-sub">
              None of these are required. They are the shortcuts and behaviours
              that regular users end up relying on.
            </p>
          </Reveal>

          <div className="gd-tips">
            {TIPS.map((tip, index) => (
              <Reveal
                as="article"
                className="gd-tip"
                key={tip.title}
                delay={index * 70}
              >
                <span className="ln-chip is-teal" style={{ marginBottom: 0 }}>
                  <tip.icon size={19} />
                </span>
                <h3>{tip.title}</h3>
                <p>{tip.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== TROUBLESHOOTING */}
      <section className="ln-section" id="troubleshooting">
        <div className="ln-wrap">
          <Reveal className="ln-head is-center">
            <span className="ln-eyebrow">If something looks off</span>
            <h2 className="ln-h2" style={{ maxWidth: "none" }}>
              Troubleshooting.
            </h2>
            <p className="ln-sub">
              The handful of things people actually run into, and what to do about
              each one.
            </p>
          </Reveal>

          <div className="ln-faq" style={{ maxWidth: 820, marginInline: "auto" }}>
            {TROUBLE.map((item, index) => (
              <Reveal as="div" key={item.q} delay={index * 60}>
                <details className="ln-q">
                  <summary>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <TriangleAlert
                        size={15}
                        aria-hidden="true"
                        style={{ color: "var(--ln-amber)", flexShrink: 0 }}
                      />
                      {item.q}
                    </span>
                    <Plus size={17} aria-hidden="true" />
                  </summary>
                  <p className="ln-q-body">{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================= CTA */}
      <section className="ln-cta">
        <div className="ln-wrap">
          <Reveal>
            <div className="ln-cta-inner">
              <span className="ln-eyebrow">You are ready</span>
              <h2>
                That is the whole guide.
                <br />
                Go and say hello.
              </h2>
              <p>
                Everything you just read takes about a minute to do for real. Sign
                in with your number and start your first conversation.
              </p>

              <div className="ln-cta-actions">
                <Link href="/dashboard" className="ln-btn ln-btn-primary">
                  Open NexaChat <ArrowRight size={16} />
                </Link>
                <a href="#walkthrough" className="ln-btn ln-btn-outline">
                  Read the steps again
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
