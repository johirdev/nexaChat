"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, SearchX, Users as UsersIcon, WifiOff, X } from "lucide-react";
import useUserDirectory, { PAGE_SIZE } from "@/src/hooks/useUserDirectory";
import type { User } from "@/src/types/user";
import UserRow from "./UserRow";
import UserRowSkeleton, { UserListSkeleton } from "./UserRowSkeleton";
import "./userList.css";

/** How far below the fold the sentinel starts revealing the next page. */
const PREFETCH_MARGIN = 240;

interface PeopleListProps {
  onSelect?: (user: User) => void;
  /** Id of the person whose chat is currently opening. */
  pendingUserId?: string | null;
}

/**
 * Searchable directory of everyone on NexaChat: 20 rows at a time, more as the
 * rail scrolls, skeletons while anything is in flight.
 */
export default function PeopleList({ onSelect, pendingUserId }: PeopleListProps) {
  const [query, setQuery] = useState("");

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

  // Observing against the scroll container (not the viewport) is what makes
  // infinite scroll work inside a fixed-height rail.
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [query]);

  const clearQuery = useCallback(() => setQuery(""), []);

  const trimmedQuery = query.trim();
  const showSearchSkeleton = isSearching && users.length === 0 && !error;
  const showEmptyState =
    !isInitialLoading && !showSearchSkeleton && !error && users.length === 0;

  return (
    <>
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
                <b>{totalMatches}</b> {totalMatches === 1 ? "person" : "people"}
              </>
            )}
          </span>
          {isSearching && <span className="ul-live">Searching</span>}
        </p>
      </div>

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

        {(isInitialLoading || showSearchSkeleton) && <UserListSkeleton count={8} />}

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
              <button type="button" className="ul-state-btn" onClick={clearQuery}>
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
                isActive={user._id === pendingUserId}
                onSelect={onSelect}
              />
            ))}

            {isRevealingMore &&
              Array.from({ length: 4 }, (_, i) => (
                <UserRowSkeleton key={`more-${i}`} index={i} />
              ))}
          </ul>
        )}

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
    </>
  );
}
