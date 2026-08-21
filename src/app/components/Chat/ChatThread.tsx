"use client";

import { useCallback } from "react";
import { ArrowLeft, Info, Users } from "lucide-react";
import UserAvatar from "@/src/app/components/Users/UserAvatar";
import useMessages from "@/src/hooks/useMessages";
import useSendMessage from "@/src/hooks/useSendMessage";
import { useChatSocket } from "@/src/lib/providers/SocketProvider";
import type { Conversation } from "@/src/types/chat";
import MessageComposer from "./MessageComposer";
import MessageList from "./MessageList";

interface ChatThreadProps {
  conversation: Conversation;
  currentUserId: string | undefined;
  isInfoOpen: boolean;
  onToggleInfo: () => void;
  onBack: () => void;
}

function ConnectionPill({ status }: { status: string }) {
  if (status === "connected") {
    return (
      <span className="cw-conn is-connected" title="Realtime connected">
        <i /> Live
      </span>
    );
  }
  if (status === "offline") {
    return (
      <span className="cw-conn is-offline" title="Realtime disconnected">
        <i /> Offline
      </span>
    );
  }
  return (
    <span className="cw-conn is-waiting" title="Connecting to realtime">
      <i /> {status === "reconnecting" ? "Reconnecting" : "Connecting"}
    </span>
  );
}

export default function ChatThread({
  conversation,
  currentUserId,
  isInfoOpen,
  onToggleInfo,
  onBack,
}: ChatThreadProps) {
  const { status: socketStatus } = useChatSocket();
  const {
    messages,
    isLoading,
    isLoadingOlder,
    hasOlder,
    loadOlder,
    error: historyError,
  } = useMessages(conversation.id);
  const { send, retry, discard, error: sendError } = useSendMessage();

  const handleSend = useCallback(
    (text: string) => send(conversation.id, text),
    [send, conversation.id],
  );

  const isGroup = conversation.type === "group";

  const subtitle = isGroup
    ? conversation.participants
        .map((participant) =>
          participant._id === currentUserId ? "You" : participant.name.split(" ")[0],
        )
        .join(", ")
    : (conversation.otherUser?.phone ?? "");

  // Only warn about the socket once history is up; a spinner plus a warning at
  // the same time reads as broken when it is merely still connecting.
  const notice =
    sendError ??
    (historyError && messages.length > 0 ? historyError : null) ??
    (socketStatus === "offline" && !isLoading
      ? "Realtime is offline — you can still send, but new messages may be delayed."
      : null);

  return (
    <section className="cw-thread" aria-label={`Chat with ${conversation.title}`}>
      <header className="cw-head">
        <button
          type="button"
          className="cw-icon-btn cw-back"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeft size={18} />
        </button>

        <span className="cw-avatar-wrap">
          <UserAvatar id={conversation.avatarSeed} name={conversation.title} />
          {isGroup && (
            <span className="cw-group-badge" aria-hidden="true">
              <Users size={9} />
            </span>
          )}
        </span>

        <div className="cw-head-body">
          <span className="cw-head-title">{conversation.title}</span>
          <span className="cw-head-sub">{subtitle}</span>
        </div>

        <ConnectionPill status={socketStatus} />

        <button
          type="button"
          className={`cw-icon-btn${isInfoOpen ? " is-on" : ""}`}
          onClick={onToggleInfo}
          aria-label={isGroup ? "Group info" : "Contact info"}
          aria-pressed={isInfoOpen}
        >
          <Info size={18} />
        </button>
      </header>

      <div className="cw-thread-main">
        {historyError && messages.length === 0 && !isLoading ? (
          <div className="cw-empty">
            <span className="cw-empty-art">
              <Info size={28} />
            </span>
            <h2>Couldn&apos;t load messages</h2>
            <p>{historyError}</p>
          </div>
        ) : (
          <MessageList
            conversation={conversation}
            messages={messages}
            currentUserId={currentUserId}
            isLoading={isLoading}
            isLoadingOlder={isLoadingOlder}
            hasOlder={hasOlder}
            loadOlder={loadOlder}
            onRetry={retry}
            onDiscard={discard}
          />
        )}
      </div>

      <MessageComposer
        conversationId={conversation.id}
        recipientName={conversation.title}
        notice={notice}
        onSend={handleSend}
      />
    </section>
  );
}
