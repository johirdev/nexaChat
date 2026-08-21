"use client";

import { useCallback, useMemo, useState } from "react";

const PREFIX = "nexachat:hidden-conversations:";

/**
 * Conversations the person has removed from their list.
 *
 * The API has no delete, hide or archive route — `DELETE /conversations/{id}`
 * answers 404 — so removal can only ever be a local decision. It is kept in
 * sessionStorage rather than localStorage on purpose: the list comes back
 * whole in a new session, which is honest about the fact that nothing was
 * deleted on the server and stops a hidden chat from vanishing forever.
 */
function storageKeyFor(userId: string | undefined): string | null {
  return userId ? `${PREFIX}${userId}` : null;
}

function readStore(key: string | null): string[] {
  if (!key || typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    // Private mode, disabled storage, or corrupt JSON — start clean.
    return [];
  }
}

export function useHiddenConversations(userId: string | undefined) {
  // The dashboard subtree only mounts once the user is known, and a sign-out
  // unmounts it, so reading the key once at mount is sufficient here.
  const storageKey = storageKeyFor(userId);
  const [hidden, setHidden] = useState<string[]>(() => readStore(storageKey));

  const persist = useCallback(
    (next: string[]) => {
      setHidden(next);
      if (!storageKey) return;
      try {
        window.sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Storage being unavailable must not break the removal itself.
      }
    },
    [storageKey],
  );

  const hide = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      persist([...new Set([...hidden, ...ids])]);
    },
    [hidden, persist],
  );

  const restore = useCallback(
    (ids: string[]) => {
      const removing = new Set(ids);
      persist(hidden.filter((id) => !removing.has(id)));
    },
    [hidden, persist],
  );

  const restoreAll = useCallback(() => persist([]), [persist]);

  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);

  return { hiddenIds: hiddenSet, hiddenCount: hidden.length, hide, restore, restoreAll };
}

export default useHiddenConversations;
