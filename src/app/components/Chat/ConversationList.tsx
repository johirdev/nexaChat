"use client";

import {
  CheckSquare,
  MessageSquarePlus,
  RotateCcw,
  Trash2,
  WifiOff,
  X,
} from "lucide-react";
import { UserListSkeleton } from "@/src/app/components/Users/UserRowSkeleton";
import type { Conversation } from "@/src/types/chat";
import ConversationRow from "./ConversationRow";

/** Everything the list needs to run multi-select, owned by ChatWorkspace. */
export interface ConversationSelection {
  selectionMode: boolean;
  selectedIds: Set<string>;
  hiddenCount: number;
  onEnterSelection: () => void;
  onExitSelection: () => void;
  onToggleCheck: (id: string) => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onRestoreHidden: () => void;
}

interface ConversationListProps extends ConversationSelection {
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
  selectionMode,
  selectedIds,
  hiddenCount,
  onEnterSelection,
  onExitSelection,
  onToggleCheck,
  onSelectAll,
  onDeleteSelected,
  onRestoreHidden,
}: ConversationListProps) {
  const selectedCount = selectedIds.size;
  const allChecked =
    conversations.length > 0 && selectedCount === conversations.length;

  return (
    <>
      {/* --------------------------------------------------------- toolbar */}
      {!isLoading && conversations.length > 0 && (
        <div className={`cw-listbar${selectionMode ? " is-picking" : ""}`}>
          {selectionMode ? (
            <>
              <button
                type="button"
                className="cw-listbar-btn"
                onClick={onExitSelection}
                aria-label="Cancel selection"
              >
                <X size={15} />
              </button>

              <span className="cw-listbar-count">
                {selectedCount} selected
              </span>

              <button
                type="button"
                className="cw-listbar-btn is-text"
                onClick={onSelectAll}
              >
                {allChecked ? "None" : "All"}
              </button>

              <button
                type="button"
                className="cw-listbar-btn is-danger"
                onClick={onDeleteSelected}
                disabled={selectedCount === 0}
                aria-label={`Delete ${selectedCount} conversations`}
              >
                <Trash2 size={15} />
                Delete
              </button>
            </>
          ) : (
            <>
              <span className="cw-listbar-count">
                {conversations.length} chat{conversations.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                className="cw-listbar-btn is-text"
                onClick={onEnterSelection}
              >
                <CheckSquare size={14} /> Select
              </button>
            </>
          )}
        </div>
      )}

      <div
        className="ul-scroll"
        role="region"
        aria-label="Conversations"
        aria-busy={isLoading}
      >
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
            <span className="ul-state-title">
              {hiddenCount > 0 ? "Nothing left here" : "No chats yet"}
            </span>
            <span className="ul-state-text">
              {hiddenCount > 0 ? (
                <>
                  You removed every chat from this list. They are still on the
                  server — bring them back any time.
                </>
              ) : (
                <>
                  Pick someone from <b>People</b> to start your first
                  conversation.
                </>
              )}
            </span>
            <button
              type="button"
              className="ul-state-btn"
              onClick={hiddenCount > 0 ? onRestoreHidden : onBrowsePeople}
            >
              {hiddenCount > 0 ? "Restore removed chats" : "Browse people"}
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
                selectionMode={selectionMode}
                isChecked={selectedIds.has(conversation.id)}
                onToggleCheck={onToggleCheck}
              />
            ))}
          </ul>
        )}

        {/* Removal is local and reversible — always offer the way back. */}
        {hiddenCount > 0 && conversations.length > 0 && (
          <p className="cw-hidden-note">
            <span>
              {hiddenCount} removed from this list
            </span>
            <button type="button" onClick={onRestoreHidden}>
              <RotateCcw size={12} /> Restore
            </button>
          </p>
        )}
      </div>
    </>
  );
}
