"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  LogOut,
  Search,
  SearchX,
  Users as UsersIcon,
  WifiOff,
  X,
} from "lucide-react";
import { AuthContext } from "@/src/app/AuthProvider";
import useUserDirectory, { PAGE_SIZE } from "@/src/hooks/useUserDirectory";
import type { User } from "@/src/types/user";
import UserAvatar from "./UserAvatar";
import UserRow from "./UserRow";
import UserRowSkeleton, { UserListSkeleton } from "./UserRowSkeleton";
import "./userList.css";

/** How far below the fold the sentinel starts loading, in px. */
const PREFETCH_MARGIN = 240;

interface UserListPanelProps {
  /** Mobile drawer close handler — the button is hidden on desktop. */
  onClose?: () => void;
}

export default function UserListPanel({ onClose }: UserListPanelProps) {
  const { user: currentUser, logOut } = useContext(AuthContext);

  const [query, setQuery] = useState("");
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const {
    users,
    totalMatches,
    isInitialLoading,
    isSearching,
    isRevealingMore,
    hasMore,
    revealNextPage,
    error,
    refetch,
  } = useUserDirectory(query);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  // Infinite scroll. Observing against the scroll container (not the viewport)
  // is what makes this work inside a fixed-height rail.
  useEffect(() => {
    if (!sentinel || !hasMore || isInitialLoading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) revealNextPage();
      },
      { root: scrollRef.current, rootMargin: `0px 0px ${PREFETCH_MARGIN}px 0px` },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, hasMore, isInitialLoading, revealNextPage]);

  // A new search resets the window, so send the reader back to the top of it.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [query]);

  const handleSelect = useCallback((user: User) => {
    setActiveUserId(user._id);
    // Wiring point for `POST /conversations` once the chat view lands.
  }, []);

  const clearQuery = useCallback(() => setQuery(""), []);

  const trimmedQuery = query.trim();
  const showSearchSkeleton = isSearching && users.length === 0 && !error;
  const showEmptyState =
    !isInitialLoading && !showSearchSkeleton && !error && users.length === 0;

  return (
    <div className="ul-rail">
      {/* ---------------------------------------------------------- brand */}
      <div className="ul-brand">
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
          <span className="ul-brand-sub">Directory</span>
        </span>

        {onClose && (
          <button
            type="button"
            className="ul-close lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* --------------------------------------------------------- search */}
      <div className="ul-search">
        <div className="ul-field">
          <Search className="ul-field-icon" size={16} aria-hidden="true" />
          <input
            className="ul-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or phone"
            aria-label="Search people"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              className="ul-clear"
              onClick={clearQuery}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <p className="ul-meta">
          <span className="ul-count">
            {isInitialLoading ? (
              "Loading people…"
            ) : trimmedQuery ? (
              <>
                <b>{totalMatches}</b> {totalMatches === 1 ? "match" : "matches"}
              </>
            ) : (
              <>
                <b>{totalMatches}</b>{" "}
                {totalMatches === 1 ? "person" : "people"}
              </>
            )}
          </span>
          {isSearching && <span className="ul-live">Searching</span>}
        </p>
      </div>

      {/* ----------------------------------------------------------- list */}
      <div
        className="ul-scroll"
        ref={scrollRef}
        role="region"
        aria-label="People"
        aria-busy={isInitialLoading || isSearching}
      >
        {error && users.length === 0 && (
          <div className="ul-state is-error">
            <span className="ul-state-icon">
              <WifiOff size={20} />
            </span>
            <span className="ul-state-title">Couldn&apos;t load people</span>
            <span className="ul-state-text">{error}</span>
            <button type="button" className="ul-state-btn" onClick={refetch}>
              Try again
            </button>
          </div>
        )}

        {(isInitialLoading || showSearchSkeleton) && (
          <UserListSkeleton count={8} />
        )}

        {showEmptyState && (
          <div className="ul-state">
            <span className="ul-state-icon">
              {trimmedQuery ? <SearchX size={20} /> : <UsersIcon size={20} />}
            </span>
            <span className="ul-state-title">
              {trimmedQuery ? "No one found" : "Nobody here yet"}
            </span>
            <span className="ul-state-text">
              {trimmedQuery ? (
                <>
                  Nothing matches <b>&ldquo;{trimmedQuery}&rdquo;</b>. Try a
                  different name or phone number.
                </>
              ) : (
                "People who join NexaChat will show up here."
              )}
            </span>
            {trimmedQuery && (
              <button
                type="button"
                className="ul-state-btn"
                onClick={clearQuery}
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {users.length > 0 && (
          <ul className="ul-list">
            {users.map((user, index) => (
              <UserRow
                key={user._id}
                user={user}
                query={trimmedQuery}
                index={index % PAGE_SIZE}
                isActive={user._id === activeUserId}
                onSelect={handleSelect}
              />
            ))}

            {isRevealingMore &&
              Array.from({ length: 4 }, (_, i) => (
                <UserRowSkeleton key={`more-${i}`} index={i} />
              ))}
          </ul>
        )}

        {/* Sentinel: crossing it reveals the next page. */}
        {hasMore && !isInitialLoading && (
          <div ref={setSentinel} style={{ height: 1 }} aria-hidden="true" />
        )}

        {!hasMore && users.length > PAGE_SIZE && (
          <p className="ul-end">All {totalMatches} shown</p>
        )}

        <span aria-live="polite" className="ul-sr">
          {isInitialLoading
            ? "Loading people"
            : `${users.length} of ${totalMatches} people shown`}
        </span>
      </div>

      {/* ----------------------------------------------------------- foot */}
      <div className="ul-foot">
        <div className="ul-me">
          {currentUser && (
            <UserAvatar
              id={currentUser._id}
              name={currentUser.name}
              showPresence
            />
          )}
          <span className="ul-me-body">
            <span className="ul-me-label">Signed in</span>
            <span className="ul-me-name">
              {currentUser?.name ?? "NexaChat user"}
            </span>
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
    </div>
  );
}
