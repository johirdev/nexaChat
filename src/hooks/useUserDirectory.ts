"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "@/src/app/AuthProvider";
import { getApiErrorMessage } from "@/src/lib/errors";
import { queryKeys } from "@/src/lib/queryKeys";
import { searchUsers } from "@/src/services/users";
import type { User } from "@/src/types/user";
import useDebouncedValue from "./useDebouncedValue";

/** How many people are revealed per page. */
export const PAGE_SIZE = 20;

/**
 * The API has no cursor pagination (see `services/users.ts`), so page two comes
 * out of memory and would otherwise snap in with no perceptible load. Holding
 * the skeleton for a beat keeps the reveal readable and keeps this component's
 * contract identical to the one it will have the day `/users/search` grows a
 * real cursor — at which point `revealNextPage` becomes `fetchNextPage` and
 * this constant goes away.
 */
const PAGE_REVEAL_MS = 320;

const SEARCH_DEBOUNCE_MS = 300;

function normalisePhone(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Case-insensitive substring match on the name, plus a digits-only match on the
 * phone number so "1700" finds "+8801700000001". The server can only do a
 * case-sensitive prefix match, so this is what makes search feel correct.
 */
function matches(user: User, needle: string): boolean {
  if (user.name.toLowerCase().includes(needle.toLowerCase())) return true;

  const digits = normalisePhone(needle);
  return digits.length > 0 && normalisePhone(user.phone).includes(digits);
}

export interface UserDirectory {
  /** The slice currently on screen. */
  users: User[];
  /** Everything that matched, before windowing. */
  totalMatches: number;
  isInitialLoading: boolean;
  /** A search is in flight and the list on screen belongs to the previous term. */
  isSearching: boolean;
  isRevealingMore: boolean;
  hasMore: boolean;
  revealNextPage: () => void;
  error: string | null;
  refetch: () => void;
}

export function useUserDirectory(rawQuery: string): UserDirectory {
  const { user: currentUser } = useContext(AuthContext);
  const query = rawQuery.trim();
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  // The directory, cached once. Doubles as the corpus for client-side filtering.
  const directory = useQuery({
    queryKey: queryKeys.userDirectory,
    queryFn: ({ signal }) => searchUsers("", signal),
    staleTime: 60_000,
  });

  // The server's own prefix match. It can surface people who fall outside the
  // 50-record directory page, so it is merged in rather than replaced.
  const remoteMatches = useQuery({
    queryKey: queryKeys.userSearch(debouncedQuery),
    queryFn: ({ signal }) => searchUsers(debouncedQuery, signal),
    enabled: debouncedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  const results = useMemo(() => {
    const byId = new Map<string, User>();
    for (const user of directory.data ?? []) byId.set(user._id, user);
    for (const user of remoteMatches.data ?? []) byId.set(user._id, user);

    const list = [...byId.values()].filter(
      (user) => user._id !== currentUser?._id,
    );

    const filtered = debouncedQuery
      ? list.filter((user) => matches(user, debouncedQuery))
      : list;

    return filtered.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [directory.data, remoteMatches.data, debouncedQuery, currentUser?._id]);

  // ---- windowing -----------------------------------------------------------
  // The window is tagged with the term it belongs to and read back derived, so a
  // new search falls back to page one on its own. No reset effect, and a timer
  // that resolves after the term changed lands harmlessly on a stale tag.
  const [pageWindow, setPageWindow] = useState({
    query: "",
    count: PAGE_SIZE,
    revealing: false,
  });
  const revealTimer = useRef<number | null>(null);

  const isCurrentWindow = pageWindow.query === debouncedQuery;
  const visibleCount = isCurrentWindow ? pageWindow.count : PAGE_SIZE;
  const hasMore = visibleCount < results.length;

  useEffect(
    () => () => {
      if (revealTimer.current !== null) {
        window.clearTimeout(revealTimer.current);
      }
    },
    [],
  );

  const revealNextPage = useCallback(() => {
    if (revealTimer.current !== null) return;

    const term = debouncedQuery;

    setPageWindow((prev) => ({
      query: term,
      count: prev.query === term ? prev.count : PAGE_SIZE,
      revealing: true,
    }));

    revealTimer.current = window.setTimeout(() => {
      revealTimer.current = null;
      setPageWindow((prev) =>
        prev.query === term
          ? { ...prev, count: prev.count + PAGE_SIZE, revealing: false }
          : { ...prev, revealing: false },
      );
    }, PAGE_REVEAL_MS);
  }, [debouncedQuery]);

  const users = useMemo(
    () => results.slice(0, visibleCount),
    [results, visibleCount],
  );

  const failure = directory.error ?? remoteMatches.error;

  return {
    users,
    totalMatches: results.length,
    isInitialLoading: directory.isPending,
    isSearching:
      remoteMatches.isFetching || (query !== debouncedQuery && query.length > 0),
    isRevealingMore: isCurrentWindow && pageWindow.revealing && hasMore,
    hasMore,
    revealNextPage,
    error: failure ? getApiErrorMessage(failure) : null,
    refetch: () => {
      void directory.refetch();
      if (debouncedQuery) void remoteMatches.refetch();
    },
  };
}

export default useUserDirectory;
