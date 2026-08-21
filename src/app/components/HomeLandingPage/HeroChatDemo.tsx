"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Bell, Check, SendHorizonal } from "lucide-react";

/* ==========================================================================
   A playable chat, not a screenshot.
   State lives in memory only — no storage, no API — so a refresh returns the
   demo to its opening two messages, which is exactly what a marketing demo
   should do for the next visitor.
   ========================================================================== */

interface DemoMessage {
  id: string;
  author: "them" | "you";
  name: string;
  text: string;
  /** Fixed strings on the seeds so server and client render identically. */
  time: string;
}

const SEED: DemoMessage[] = [
  {
    id: "seed-1",
    author: "them",
    name: "Amelia",
    text: "That new direction feels so right ✦",
    time: "9:41",
  },
  {
    id: "seed-2",
    author: "you",
    name: "You",
    text: "Yes. Let's make it happen.",
    time: "9:42",
  },
];

/**
 * Keyword rules, first match wins. Written to answer the questions a visitor
 * actually types into a demo box rather than to fake general intelligence.
 */
const RULES: { test: RegExp; replies: string[] }[] = [
  {
    test: /\b(hi|hey|hello|salam|assalamu|yo|hola|good\s?(morning|evening))\b/i,
    replies: [
      "Hey! 👋 You're talking to a live demo — try asking about groups, speed or privacy.",
      "Hello! Nice to meet you. Everything you type here renders instantly, just like the real app.",
    ],
  },
  {
    test: /\b(group|groups|team|teams|channel|members?)\b/i,
    replies: [
      "Groups are first-class here — name one, add people, promote admins, rename it later. Everyone sees the change the moment it happens.",
      "Yes! Create a group, and every member gets messages and updates live. Admins can add, remove and promote.",
    ],
  },
  {
    test: /\b(fast|speed|quick|realtime|real-time|live|socket|instant|delay|lag)\b/i,
    replies: [
      "Messages travel over a WebSocket, so they land in the same breath you send them — no refresh, no polling. ⚡",
      "Realtime is the whole point. Sent here, on screen there. Usually well under a second.",
    ],
  },
  {
    test: /\b(secure|security|privacy|private|safe|encrypt|data)\b/i,
    replies: [
      "Your conversations stay between the people in them. Sessions are token-based and expire on their own.",
      "Privacy is a default, not a setting. Only members of a conversation can read it.",
    ],
  },
  {
    test: /\b(price|pricing|cost|free|paid|subscription|plan|taka|money)\b/i,
    replies: [
      "Free to start, and free to stay for everyday chats. No card, no trial countdown.",
      "Nothing to pay to try it — sign in with a phone number and you're in.",
    ],
  },
  {
    test: /\b(sign\s?up|signup|register|account|join|login|log\s?in|start)\b/i,
    replies: [
      "It's one step: enter a phone number and a name. New number? Account created. Known number? You're signed in.",
      "No password to forget — your phone number is the account. Hit “Open your space” whenever you're ready.",
    ],
  },
  {
    test: /\b(who|what is|what's|about|nexachat|nexa)\b/i,
    replies: [
      "NexaChat is a realtime messenger for 1-to-1 and group conversations — built to feel calm rather than noisy.",
      "We're the quiet chat app: your people, your groups, delivered live.",
    ],
  },
  {
    test: /\b(thanks|thank you|nice|cool|awesome|great|love|good)\b/i,
    replies: [
      "That's lovely to hear 💚 Tell me what else you'd want from a chat app.",
      "Thank you! Keep typing — I'm answering every one of these live.",
    ],
  },
  {
    test: /\b(bye|later|goodbye|see you)\b/i,
    replies: [
      "See you soon! Your space is waiting whenever you want it. 👋",
      "Take care — come back any time.",
    ],
  },
];

const FALLBACKS = [
  "Noted. In the real app that message would already be on your friend's screen.",
  "Got it — and that arrived live, no refresh needed. Ask me about groups or speed.",
  "Interesting! This demo answers a handful of topics; the real NexaChat carries the rest.",
  "That landed instantly. Imagine it doing the same across every device you own.",
];

function pick(list: string[], seen: number): string {
  return list[seen % list.length];
}

function replyTo(text: string, turn: number): string {
  const rule = RULES.find((entry) => entry.test.test(text));
  return rule ? pick(rule.replies, turn) : pick(FALLBACKS, turn);
}

function clockNow(): string {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HeroChatDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>(SEED);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const turn = useRef(0);
  const timers = useRef<number[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Any pending reply must not fire after the section unmounts.
  useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    },
    [],
  );

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, isTyping]);

  const send = useCallback((event: FormEvent) => {
    event.preventDefault();

    const text = draft.trim();
    if (!text || isTyping) return;

    const id = `${Date.now()}`;
    setMessages((current) => [
      ...current,
      { id: `you-${id}`, author: "you", name: "You", text, time: clockNow() },
    ]);
    setDraft("");
    setIsTyping(true);

    const answer = replyTo(text, turn.current);
    turn.current += 1;

    // Longer answers "take longer to write" — a flat delay reads as canned.
    const delay = Math.min(2000, 620 + answer.length * 11);

    timers.current.push(
      window.setTimeout(() => {
        setIsTyping(false);
        setMessages((current) => [
          ...current,
          {
            id: `amelia-${id}`,
            author: "them",
            name: "Amelia",
            text: answer,
            time: clockNow(),
          },
        ]);
      }, delay),
    );
  }, [draft, isTyping]);

  return (
    <div className="ln-demo-shell">
      <div className="ln-demo">
        <div className="ln-demo-top">
          <div className="ln-demo-top-body">
            <span className="ln-demo-title">
              <i aria-hidden="true" />
              Design circle
            </span>
            <span className="ln-demo-sub">Amelia · online now</span>
          </div>
          <span className="ln-demo-badge">Live demo</span>
          <Bell size={16} style={{ color: "var(--ln-faint)" }} aria-hidden="true" />
        </div>

        <div
          className="ln-demo-scroll"
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="Demo conversation"
        >
          {messages.map((message) => {
            const isYou = message.author === "you";
            return (
              <div
                key={message.id}
                className={`ln-msg${isYou ? " is-you" : ""}`}
              >
                <span
                  className="ln-msg-face"
                  style={{
                    background: isYou
                      ? "linear-gradient(135deg,#9678ff,#7750f5)"
                      : "linear-gradient(135deg,#2de0c4,#47bdf3)",
                    color: isYou ? "#fff" : "#04121c",
                  }}
                  aria-hidden="true"
                >
                  {isYou ? "Y" : "A"}
                </span>
                <span className="ln-msg-col">
                  <span className="ln-msg-meta">
                    {message.name} · {message.time}
                  </span>
                  <span className="ln-msg-text">{message.text}</span>
                </span>
              </div>
            );
          })}

          {isTyping && (
            <div className="ln-msg">
              <span
                className="ln-msg-face"
                style={{
                  background: "linear-gradient(135deg,#2de0c4,#47bdf3)",
                  color: "#04121c",
                }}
                aria-hidden="true"
              >
                A
              </span>
              <span className="ln-msg-col">
                <span className="ln-msg-text ln-typing" aria-label="Amelia is typing">
                  <i /> <i /> <i />
                </span>
              </span>
            </div>
          )}
        </div>

        <form className="ln-demo-form" onSubmit={send}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message…"
            aria-label="Write a message in the demo"
            maxLength={180}
            autoComplete="off"
          />
          <button
            type="submit"
            className="ln-demo-send"
            disabled={!draft.trim() || isTyping}
            aria-label="Send demo message"
          >
            <SendHorizonal size={15} />
          </button>
        </form>

        <p className="ln-demo-hint">
          Really type — replies are live. Refresh and the demo starts fresh.
        </p>
      </div>

      <div className="ln-float-note">
        <span aria-hidden="true">
          <Check size={12} />
        </span>
        Everything is in sync
      </div>
    </div>
  );
}
