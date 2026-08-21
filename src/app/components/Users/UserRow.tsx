"use client";

import { memo } from "react";
import { MessageCircle } from "lucide-react";
import type { User } from "@/src/types/user";
import HighlightedText from "./HighlightedText";
import UserAvatar from "./UserAvatar";

interface UserRowProps {
  user: User;
  query: string;
  isActive?: boolean;
  /** Row index within the visible window — drives the entrance stagger. */
  index?: number;
  onSelect?: (user: User) => void;
}

/**
 * Memoised: the list re-renders on every keystroke, and rows that did not change
 * should not pay for it.
 */
function UserRow({ user, query, isActive, index = 0, onSelect }: UserRowProps) {
  return (
    <li>
      <button
        type="button"
        className={`ul-row${isActive ? " is-active" : ""}`}
        onClick={() => onSelect?.(user)}
        aria-current={isActive ? "true" : undefined}
        // Cap the stagger so page 2 does not arrive in slow motion.
        style={{ animationDelay: `${Math.min(index, 12) * 22}ms` }}
      >
        <UserAvatar id={user._id} name={user.name} />

        <span className="ul-row-body">
          <span className="ul-name">
            <HighlightedText text={user.name} query={query} />
          </span>
          <span className="ul-phone">
            <HighlightedText text={user.phone} query={query} />
          </span>
        </span>

        <MessageCircle className="ul-row-action" size={16} aria-hidden="true" />
        <span className="ul-sr">Start a chat with {user.name}</span>
      </button>
    </li>
  );
}

export default memo(UserRow);
