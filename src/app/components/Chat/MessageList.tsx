"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowDown, LoaderCircle, MessagesSquare } from "lucide-react";
import { formatDayDivider, isSameDayAs } from "@/src/lib/format";
import type { Conversation, Message } from "@/src/types/chat";
import type { User } from "@/src/types/user";
import MessageBubble from "./MessageBubble";

/** Messages closer together than this from one sender render as a run. */
const GROUP_WINDOW_MS = 5 * 60 * 1000;
/** Treat the reader as "at the bottom" within this many px. */
const BOTTOM_THRESHOLD = 120;

interface MessageListProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string | undefined;
  isLoading: boolean;
  isLoadingOlder: boolean;
  hasOlder: boolean;
  loadOlder: () => void;
  onRetry: (message: Message) => void;
  onDiscard: (message: Message) => void;
}

interface Row {
  message: Message;
  isOwn: boolean;
  sender: User | null;
  startsGroup: boolean;
  endsGroup: boolean;
  dayLabel: string | null;
}

function MessageSkeleton() {
  const rows = [
    { own: false, w: 190 },
    { own: false, w: 130 },
    { own: true, w: 160 },
    { own: false, w: 220 },
    { own: true, w: 110 },
    { own: true, w: 180 },
  ];

  return (
    <div aria-hidden="true">
      {rows.map((row, i) => (
        <div key={i} className={`cw-skel-line${row.own ? " is-own" : ""}`}>
          {!row.own && (
            <span
              className="cw-skel"
              style={{ width: 30, height: 30, borderRadius: 12, flexShrink: 0 }}
            />
          )}
          <span
            className="cw-skel cw-skel-bubble"
            style={{ width: row.w, maxWidth: "70%" }}
          />
        </div>
      ))}
    </div>
  );
}

export default function MessageList({
  conversation,
  messages,
  currentUserId,
  isLoading,
  isLoadingOlder,
  hasOlder,
  loadOlder,
  onRetry,
  onDiscard,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [topSentinel, setTopSentinel] = useState<HTMLDivElement | null>(null);
  const [showJump, setShowJump] = useState(false);

  // Scroll bookkeeping lives in refs so none of it triggers a re-render.
  const stickToBottom = useRef(true);
  const previousHeight = useRef(0);
  const previousFirstId = useRef<string | null>(null);
  const previousLastId = useRef<string | null>(null);
  const previousConversation = useRef<string | null>(null);

  const senderById = useMemo(() => {
    const map = new Map<string, User>();
    for (const participant of conversation.participants) {
      map.set(participant._id, participant);
    }
    return map;
  }, [conversation.participants]);

  const rows: Row[] = useMemo(() => {
    return messages.map((message, index) => {
      const previous = messages[index - 1];
      const next = messages[index + 1];

      const sameSenderAsPrevious =
        previous?.sender === message.sender &&
        Date.parse(message.createdAt) - Date.parse(previous.createdAt) <
          GROUP_WINDOW_MS;

      const sameSenderAsNext =
        next?.sender === message.sender &&
        Date.parse(next.createdAt) - Date.parse(message.createdAt) <
          GROUP_WINDOW_MS;

      const newDay =
        !previous || !isSameDayAs(previous.createdAt, message.createdAt);

      return {
        message,
        isOwn: message.sender === currentUserId,
        sender: senderById.get(message.sender) ?? null,
        startsGroup: newDay || !sameSenderAsPrevious,
        endsGroup: !sameSenderAsNext,
        dayLabel: newDay ? formatDayDivider(message.createdAt) : null,
      };
    });
  }, [messages, currentUserId, senderById]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior });
    stickToBottom.current = true;
  }, []);

  /* --- scroll position management -----------------------------------------
     Three distinct cases, told apart by which end of the list changed:
       1. a different conversation  -> jump to the newest message
       2. older messages prepended  -> hold the reader's place
       3. a new message appended    -> follow only if already at the bottom  */
  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const firstId = messages[0]?._id ?? null;
    const lastId = messages.at(-1)?._id ?? null;

    if (previousConversation.current !== conversation.id) {
      previousConversation.current = conversation.id;
      previousFirstId.current = firstId;
      previousLastId.current = lastId;
      previousHeight.current = node.scrollHeight;
      stickToBottom.current = true;
      node.scrollTop = node.scrollHeight;
      return;
    }

    const olderPrepended =
      firstId !== previousFirstId.current && previousFirstId.current !== null;

    if (olderPrepended) {
      // Keep the same message under the reader's eyes by absorbing the height
      // the prepended page just added.
      node.scrollTop += node.scrollHeight - previousHeight.current;
    } else if (lastId !== previousLastId.current && stickToBottom.current) {
      node.scrollTop = node.scrollHeight;
    }

    previousFirstId.current = firstId;
    previousLastId.current = lastId;
    previousHeight.current = node.scrollHeight;
  }, [messages, conversation.id]);

  const handleScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;

    const distanceFromBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight;
    const atBottom = distanceFromBottom <= BOTTOM_THRESHOLD;

    stickToBottom.current = atBottom;
    setShowJump(!atBottom && node.scrollHeight > node.clientHeight + 200);
  }, []);

  // Pull the previous page when the top of the list comes into view.
  useEffect(() => {
    if (!topSentinel || !hasOlder || isLoadingOlder || isLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadOlder();
      },
      { root: scrollRef.current, rootMargin: "180px 0px 0px 0px" },
    );

    observer.observe(topSentinel);
    return () => observer.disconnect();
  }, [topSentinel, hasOlder, isLoadingOlder, isLoading, loadOlder]);

  if (isLoading) {
    return (
      <div className="cw-scroll">
        <div className="cw-msgs">
          <MessageSkeleton />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="cw-scroll">
        <div className="cw-empty">
          <span className="cw-empty-art">
            <MessagesSquare size={30} />
          </span>
          <h2>Say hello</h2>
          <p>
            This is the beginning of your conversation with{" "}
            <strong>{conversation.title}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="cw-scroll" ref={scrollRef} onScroll={handleScroll}>
        <div className="cw-msgs">
          {hasOlder && (
            <div ref={setTopSentinel} style={{ height: 1 }} aria-hidden="true" />
          )}

          {isLoadingOlder && (
            <div className="cw-older">
              <span>
                <LoaderCircle className="animate-spin" size={13} />
                Loading earlier messages
              </span>
            </div>
          )}

          {rows.map((row) => (
            <div key={row.message._id}>
              {row.dayLabel && <div className="cw-day">{row.dayLabel}</div>}
              <MessageBubble
                message={row.message}
                isOwn={row.isOwn}
                sender={row.sender}
                showSenderName={conversation.type === "group"}
                startsGroup={row.startsGroup}
                endsGroup={row.endsGroup}
                onRetry={onRetry}
                onDiscard={onDiscard}
              />
            </div>
          ))}
        </div>
      </div>

      {showJump && (
        <button
          type="button"
          className="cw-jump"
          onClick={() => scrollToBottom("smooth")}
        >
          <ArrowDown size={14} />
          Latest
        </button>
      )}
    </>
  );
}
