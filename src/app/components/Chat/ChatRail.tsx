"use client";

import { useContext, useState } from "react";
import Image from "next/image";
import { LogOut, MessageSquare, UserPlus, Users } from "lucide-react";
import { AuthContext } from "@/src/app/AuthProvider";
import PeopleList from "@/src/app/components/Users/PeopleList";
import UserAvatar from "@/src/app/components/Users/UserAvatar";
import type { Conversation } from "@/src/types/chat";
import type { User } from "@/src/types/user";
import ConversationList from "./ConversationList";
import Link from "next/link";
import MyProfilePage from "./MyProfilePage";

export type RailTab = "chats" | "people";

interface ChatRailProps {
  tab: RailTab;
  onTabChange: (tab: RailTab) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  pendingUserId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onSelectPerson: (user: User) => void;
  onNewGroup: () => void;
  onRetry: () => void;
}

export default function ChatRail({
  tab,
  onTabChange,
  conversations,
  activeConversationId,
  isLoading,
  error,
  pendingUserId,
  onSelectConversation,
  onSelectPerson,
  onNewGroup,
  onRetry,
}: ChatRailProps) {
  const { user, logOut } = useContext(AuthContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="ul-rail cw-rail">
      <Link href="/dashboard" className="ul-brand">
        <Image
          className="ul-brand-mark"
          src="/nexaChat.png"
          alt=""
          width={34}
          height={34}
          priority
        />
        <span className="ul-brand-text">
          <span className="ul-wordmark">
            Nexa<span>Chat</span>
          </span>
          <span className="ul-brand-sub">
            {tab === "chats" ? "Conversations" : "Directory"}
          </span>
        </span>
      </Link>

      <div className="cw-tabs" role="tablist" aria-label="Rail sections">
        <button
          type="button"
          role="tab"
          id="rail-tab-chats"
          aria-selected={tab === "chats"}
          aria-controls="rail-panel-chats"
          className={`cw-tab${tab === "chats" ? " is-active" : ""}`}
          onClick={() => onTabChange("chats")}
        >
          <MessageSquare size={14} />
          Chats
          {conversations.length > 0 && (
            <span className="cw-tab-count">{conversations.length}</span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          id="rail-tab-people"
          aria-selected={tab === "people"}
          aria-controls="rail-panel-people"
          className={`cw-tab${tab === "people" ? " is-active" : ""}`}
          onClick={() => onTabChange("people")}
        >
          <Users size={14} />
          People
        </button>
      </div>

      {tab === "chats" ? (
        <div
          id="rail-panel-chats"
          role="tabpanel"
          aria-labelledby="rail-tab-chats"
          style={{ display: "contents" }}
        >
          <div className="cw-rail-actions">
            <button type="button" className="cw-newgroup" onClick={onNewGroup}>
              <UserPlus size={15} />
              New group
            </button>
          </div>

          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            currentUserId={user?._id}
            isLoading={isLoading}
            error={error}
            onSelect={onSelectConversation}
            onRetry={onRetry}
            onBrowsePeople={() => onTabChange("people")}
          />
        </div>
      ) : (
        <div
          id="rail-panel-people"
          role="tabpanel"
          aria-labelledby="rail-tab-people"
          style={{ display: "contents" }}
        >
          <PeopleList onSelect={onSelectPerson} pendingUserId={pendingUserId} />
        </div>
      )}

      <div className="ul-foot">
        <div className="ul-me">
          {user && (
            <UserAvatar
              id={user._id}
              name={user.name}
              showPresence
              onPresenceClick={() => setIsProfileOpen(true)}
            />
          )}
          <span className="ul-me-body">
            <span className="ul-me-label">Signed in</span>
            <span className="ul-me-name">{user?.name ?? "NexaChat user"}</span>
          </span>
          <button
            type="button"
            className="ul-logout"
            onClick={logOut}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {isProfileOpen && <MyProfilePage onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
}
