"use client";

import { useCallback, useContext, useMemo, useState } from "react";
import { MessagesSquare } from "lucide-react";
import { AuthContext } from "@/src/app/AuthProvider";
import useChatRealtime from "@/src/hooks/useChatRealtime";
import {
  useConversations,
  useStartDirectConversation,
} from "@/src/hooks/useConversations";
import useHiddenConversations from "@/src/hooks/useHiddenConversations";
import type { Conversation } from "@/src/types/chat";
import type { User } from "@/src/types/user";
import ChatRail, { type RailTab } from "./ChatRail";
import ChatThread from "./ChatThread";
import GroupInfoPanel from "./GroupInfoPanel";
import NewGroupDialog from "./NewGroupDialog";
import "./chat.css";

/**
 * The whole chat surface: rail, thread and details panel, plus the single
 * realtime subscription that keeps all three in sync.
 */
export default function ChatWorkspace() {
  const { user } = useContext(AuthContext);

  const [tab, setTab] = useState<RailTab>("chats");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  // Lets a freshly created 1-to-1 render immediately, before the refetched
  // conversation list has come back.
  const [provisional, setProvisional] = useState<Conversation | null>(null);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { conversations, isLoading, error, refetch } = useConversations();
  const startDirect = useStartDirectConversation();

  // Removal is a local, session-scoped decision: the API exposes no delete.
  const { hiddenIds, hiddenCount, hide, restoreAll } = useHiddenConversations(
    user?._id,
  );

  const visibleConversations = useMemo(
    () => conversations.filter((conversation) => !hiddenIds.has(conversation.id)),
    [conversations, hiddenIds],
  );

  const closeConversation = useCallback((conversationId: string) => {
    setActiveId((current) => (current === conversationId ? null : current));
    setProvisional((current) =>
      current?.id === conversationId ? null : current,
    );
  }, []);

  useChatRealtime({ onRemovedFrom: closeConversation });

  const activeConversation = useMemo(() => {
    if (!activeId) return null;
    return (
      conversations.find((conversation) => conversation.id === activeId) ??
      (provisional?.id === activeId ? provisional : null)
    );
  }, [activeId, conversations, provisional]);

  const openConversation = useCallback((conversation: Conversation) => {
    setActiveId(conversation.id);
    setIsInfoOpen(false);
  }, []);

  /* ---------------------------------------------------------- multi-select */
  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleCheck = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds((current) =>
      current.size === visibleConversations.length
        ? new Set()
        : new Set(visibleConversations.map((conversation) => conversation.id)),
    );
  }, [visibleConversations]);

  const deleteSelected = useCallback(() => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    hide(ids);
    // A removed thread must not stay open in the pane beside the list.
    setActiveId((current) => (current && ids.includes(current) ? null : current));
    exitSelection();
  }, [selectedIds, hide, exitSelection]);

  const restoreHidden = useCallback(() => {
    restoreAll();
    exitSelection();
  }, [restoreAll, exitSelection]);

  const selection = {
    selectionMode,
    selectedIds,
    hiddenCount,
    onEnterSelection: () => setSelectionMode(true),
    onExitSelection: exitSelection,
    onToggleCheck: toggleCheck,
    onSelectAll: selectAll,
    onDeleteSelected: deleteSelected,
    onRestoreHidden: restoreHidden,
  };

  // Deliberately not wrapped in useCallback: it closes over the mutation object,
  // whose identity changes every render, so memoising it would be a lie. Its
  // identity is stable across PeopleList's own re-renders, which is what the
  // memoised rows actually care about.
  const openDirectChat = async (person: User) => {
    setPendingUserId(person._id);
    try {
      const { _id } = await startDirect.mutateAsync(person._id);

      setProvisional({
        id: _id,
        type: "direct",
        title: person.name,
        avatarSeed: person._id,
        updatedAt: new Date().toISOString(),
        lastMessage: null,
        participants: [person],
        admins: [],
        otherUser: person,
        createdBy: user?._id ?? null,
      });
      setActiveId(_id);
      setIsInfoOpen(false);
      setTab("chats");
    } catch {
      // The rail keeps working; the failure shows as no navigation.
    } finally {
      setPendingUserId(null);
    }
  };

  const handleGroupCreated = useCallback((conversationId: string) => {
    setIsNewGroupOpen(false);
    setActiveId(conversationId);
    setTab("chats");
  }, []);

  const showPanel = Boolean(isInfoOpen && activeConversation);

  const workspaceClass = [
    "cw",
    showPanel ? "has-panel" : "",
    activeConversation ? "showing-thread" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={workspaceClass}>
      <ChatRail
        tab={tab}
        onTabChange={setTab}
        selection={selection}
        conversations={visibleConversations}
        activeConversationId={activeId}
        isLoading={isLoading}
        error={error}
        pendingUserId={pendingUserId}
        onSelectConversation={openConversation}
        onSelectPerson={openDirectChat}
        onNewGroup={() => setIsNewGroupOpen(true)}
        onRetry={refetch}
      />

      {activeConversation ? (
        <ChatThread
          key={activeConversation.id}
          conversation={activeConversation}
          currentUserId={user?._id}
          isInfoOpen={isInfoOpen}
          onToggleInfo={() => setIsInfoOpen((open) => !open)}
          onBack={() => setActiveId(null)}
        />
      ) : (
        <section className="cw-thread">
          <div className="cw-empty">
            <span className="cw-empty-art">
              <MessagesSquare size={32} />
            </span>
            <h2>Pick up where you left off</h2>
            <p>
              Choose a conversation on the left, or open <strong>People</strong> to
              start a new one.
            </p>
          </div>
        </section>
      )}

      {showPanel && activeConversation && (
        <GroupInfoPanel
          conversation={activeConversation}
          currentUserId={user?._id}
          onClose={() => setIsInfoOpen(false)}
          onLeft={(conversationId) => {
            setIsInfoOpen(false);
            closeConversation(conversationId);
          }}
        />
      )}

      {isNewGroupOpen && (
        <NewGroupDialog
          currentUserId={user?._id}
          onClose={() => setIsNewGroupOpen(false)}
          onCreated={handleGroupCreated}
        />
      )}
    </div>
  );
}
