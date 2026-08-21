"use client";

import { MessageSquarePlus, WifiOff } from "lucide-react";
import { UserListSkeleton } from "@/src/app/components/Users/UserRowSkeleton";
import type { Conversation } from "@/src/types/chat";
import ConversationRow from "./ConversationRow";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  currentUserId: string | undefined;
  isLoading: boolean;
  error: string | null;
  onSelect: (conversation: Conversation) => void;
  onRetry: () => void;
  onBrowsePeople: () => void;
}

export default function ConversationList({
  conversations,
  activeId,
  currentUserId,
  isLoading,
  error,
  onSelect,
  onRetry,
  onBrowsePeople,
}: ConversationListProps) {
  return (
    <div className="ul-scroll" role="region" aria-label="Conversations" aria-busy={isLoading}>
      {isLoading && <UserListSkeleton count={7} />}

      {!isLoading && error && conversations.length === 0 && (
        <div className="ul-state is-error">
          <span className="ul-state-icon">
            <WifiOff size={20} />
          </span>
          <span className="ul-state-title">Couldn&apos;t load chats</span>
          <span className="ul-state-text">{error}</span>
          <button type="button" className="ul-state-btn" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && conversations.length === 0 && (
        <div className="ul-state">
          <span className="ul-state-icon">
            <MessageSquarePlus size={20} />
          </span>
          <span className="ul-state-title">No chats yet</span>
          <span className="ul-state-text">
            Pick someone from <b>People</b> to start your first conversation.
          </span>
          <button type="button" className="ul-state-btn" onClick={onBrowsePeople}>
            Browse people
          </button>
        </div>
      )}

      {conversations.length > 0 && (
        <ul className="ul-list">
          {conversations.map((conversation) => (
            <ConversationRow
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeId}
              currentUserId={currentUserId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
