"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import { AuthContext } from "@/src/app/AuthProvider";
import { getApiErrorMessage } from "@/src/lib/errors";
import { queryKeys } from "@/src/lib/queryKeys";
import {
  createGroup,
  listConversations,
  startDirectConversation,
} from "@/src/services/conversations";
import {
  normalizeConversation,
  type Conversation,
  type RawConversation,
} from "@/src/types/chat";

/** Newest activity first — the API already sorts this way; we keep it true locally. */
export function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
}

export function useConversations() {
  const { user } = useContext(AuthContext);

  const query = useQuery({
    queryKey: queryKeys.conversations,
    queryFn: ({ signal }) => listConversations(signal),
    staleTime: 15_000,
  });

  const conversations = useMemo(() => {
    const raw = (query.data ?? []) as RawConversation[];
    return sortConversations(
      raw.map((item) => normalizeConversation(item, user?._id)),
    );
  }, [query.data, user?._id]);

  return {
    conversations,
    isLoading: query.isPending,
    isRefetching: query.isFetching && !query.isPending,
    error: query.error ? getApiErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}

/**
 * Opens a 1-to-1 chat. The endpoint is idempotent, so clicking a person who is
 * already in the list simply returns that conversation.
 */
export function useStartDirectConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => startDirectConversation(userId),
    onSuccess: () => {
      // The POST response is a different, unpopulated shape — refetch instead of
      // trying to splice it into the list.
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      participantIds,
    }: {
      name: string;
      participantIds: string[];
    }) => createGroup(name, participantIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}
