"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getApiErrorMessage } from "@/src/lib/errors";
import type { MessagePageCache } from "@/src/lib/messageCache";
import { queryKeys } from "@/src/lib/queryKeys";
import { getMessages, MESSAGE_PAGE_SIZE } from "@/src/services/messages";
import { normalizeMessage, type Message } from "@/src/types/chat";

/**
 * Message history for one conversation.
 *
 * The cache stores pages newest-first (the API's own order) so incoming
 * messages prepend to page 0 in O(1). The flat list handed to the view is
 * reversed into reading order — oldest at the top, newest at the bottom.
 */
export function useMessages(conversationId: string | null) {
  const query = useInfiniteQuery<MessagePageCache>({
    queryKey: queryKeys.messages(conversationId ?? "none"),
    enabled: Boolean(conversationId),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam, signal }) => {
      const page = await getMessages(conversationId as string, {
        limit: MESSAGE_PAGE_SIZE,
        before: pageParam as string | undefined,
        signal,
      });

      return {
        messages: page.messages.map(normalizeMessage),
        hasMore: page.hasMore,
        nextCursor: page.nextCursor,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // History is immutable and realtime keeps it fresh, so never refetch it out
    // from under the reader — that would fight the scroll position.
    staleTime: Infinity,
    refetchOnMount: false,
  });

  const messages: Message[] = useMemo(() => {
    const newestFirst = (query.data?.pages ?? []).flatMap(
      (page) => page.messages,
    );
    return newestFirst.slice().reverse();
  }, [query.data]);

  return {
    messages,
    isLoading: query.isPending && Boolean(conversationId),
    isLoadingOlder: query.isFetchingNextPage,
    hasOlder: Boolean(query.hasNextPage),
    loadOlder: query.fetchNextPage,
    error: query.error ? getApiErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}

export default useMessages;
