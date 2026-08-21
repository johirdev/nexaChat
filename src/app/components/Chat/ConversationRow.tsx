"use client";

import { memo } from "react";
import { Users } from "lucide-react";
import UserAvatar from "@/src/app/components/Users/UserAvatar";
import { formatListTimestamp } from "@/src/lib/format";
import type { Conversation } from "@/src/types/chat";

interface ConversationRowProps {
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string | undefined;
  onSelect: (conversation: Conversation) => void;
}

function previewOf(
  conversation: Conversation,
  currentUserId: string | undefined,
): React.ReactNode {
  const last = conversation.lastMessage;

  if (!last?.text?.trim()) {
    return <em>No messages yet</em>;
  }

  if (last.sender && last.sender === currentUserId) {
    return (
      <>
        <em>You: </em>
        {last.text}
      </>
    );
  }

  // In a group it matters who spoke; in a 1-to-1 there is only one other person.
  if (conversation.type === "group") {
    const speaker = conversation.participants.find((p) => p._id === last.sender);
    if (speaker) {
      return (
        <>
          <em>{speaker.name.split(" ")[0]}: </em>
          {last.text}
        </>
      );
    }
  }

  return last.text;
}

function ConversationRow({
  conversation,
  isActive,
  currentUserId,
  onSelect,
}: ConversationRowProps) {
  const isGroup = conversation.type === "group";

  return (
    <li>
      <button
        type="button"
        className={`cw-conv${isActive ? " is-active" : ""}`}
        onClick={() => onSelect(conversation)}
        aria-current={isActive ? "true" : undefined}
      >
        <span className="cw-avatar-wrap">
          <UserAvatar id={conversation.avatarSeed} name={conversation.title} />
          {isGroup && (
            <span className="cw-group-badge" aria-hidden="true">
              <Users size={9} />
            </span>
          )}
        </span>

        <span className="cw-conv-body">
          <span className="cw-conv-top">
            <span className="cw-conv-title">{conversation.title}</span>
            <span className="cw-conv-time">
              {formatListTimestamp(conversation.updatedAt)}
            </span>
          </span>
          <span className="cw-conv-preview">
            {previewOf(conversation, currentUserId)}
          </span>
        </span>
      </button>
    </li>
  );
}

export default memo(ConversationRow);
