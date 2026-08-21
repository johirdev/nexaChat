"use client";

import { memo } from "react";
import { Check, LoaderCircle, TriangleAlert } from "lucide-react";
import UserAvatar from "@/src/app/components/Users/UserAvatar";
import { formatFullTimestamp, formatMessageTime } from "@/src/lib/format";
import type { Message } from "@/src/types/chat";
import type { User } from "@/src/types/user";

export interface BubbleGrouping {
  /** First message of a run by the same sender. */
  startsGroup: boolean;
  /** Last message of that run — the one that gets the timestamp and the tail. */
  endsGroup: boolean;
}

interface MessageBubbleProps extends BubbleGrouping {
  message: Message;
  isOwn: boolean;
  sender: User | null;
  /** Group chats name the speaker; 1-to-1 chats do not need to. */
  showSenderName: boolean;
  onRetry: (message: Message) => void;
  onDiscard: (message: Message) => void;
}

function MessageBubble({
  message,
  isOwn,
  sender,
  showSenderName,
  startsGroup,
  endsGroup,
  onRetry,
  onDiscard,
}: MessageBubbleProps) {
  const failed = message.status === "failed";
  const pending = message.status === "sending";

  const lineClasses = [
    "cw-line",
    isOwn ? "is-own" : "is-them",
    startsGroup ? "starts-group" : "",
    !startsGroup && !endsGroup ? "mid-group" : "",
    endsGroup && !startsGroup ? "ends-group" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={lineClasses}>
      {!isOwn &&
        (startsGroup && sender ? (
          <UserAvatar id={sender._id} name={sender.name} />
        ) : (
          <span className="cw-line-gutter" aria-hidden="true" />
        ))}

      <div className="cw-bubble-col">
        {!isOwn && startsGroup && showSenderName && sender && (
          <span className="cw-sender">{sender.name}</span>
        )}

        <div
          className={[
            "cw-bubble",
            isOwn ? "is-own" : "is-them",
            pending ? "is-pending" : "",
            failed ? "is-failed" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          title={formatFullTimestamp(message.createdAt)}
        >
          {message.text}
       
        </div>

        {failed ? (
          <span className="cw-meta">
            <TriangleAlert size={11} aria-hidden="true" />
            Not sent
            <button
              type="button"
              className="cw-retry"
              onClick={() => onRetry(message)}
            >
              Retry
            </button>
            <button
              type="button"
              className="cw-retry is-quiet"
              onClick={() => onDiscard(message)}
            >
              Discard
            </button>
          </span>
        ) : (
          endsGroup && (
            <span className="cw-meta">
              {formatMessageTime(message.createdAt)}
              {isOwn &&
                (pending ? (
                  <LoaderCircle
                    className="animate-spin"
                    size={11}
                    aria-label="Sending"
                  />
                ) : (
                  <span className="cw-tick">
                    <Check size={12} aria-label="Sent" />
                  </span>
                ))}
            </span>
          )
        )}
      </div>
    </div>
  );
}

export default memo(MessageBubble);
