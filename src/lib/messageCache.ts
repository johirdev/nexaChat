import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import type { Message } from "@/src/types/chat";

/**
 * One page of history, newest-first, exactly as the API orders it. Page 0 is
 * therefore the most recent page — new messages are prepended to it.
 */
export interface MessagePageCache {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
}

export type MessageCache = InfiniteData<MessagePageCache>;

const EMPTY_CACHE: MessageCache = {
  pages: [{ messages: [], hasMore: false, nextCursor: null }],
  pageParams: [undefined],
};

function mutatePageZero(
  cache: MessageCache | undefined,
  mutate: (messages: Message[]) => Message[],
): MessageCache {
  const base = cache ?? EMPTY_CACHE;
  const [first, ...rest] = base.pages;

  return {
    ...base,
    pages: [
      { ...first, messages: mutate(first?.messages ?? []) },
      ...rest,
    ],
  };
}

function existsAnywhere(cache: MessageCache | undefined, id: string): boolean {
  return Boolean(
    cache?.pages.some((page) => page.messages.some((m) => m._id === id)),
  );
}

/**
 * Inserts a message that arrived over the socket. Guarded against duplicates:
 * the same frame can arrive twice across a reconnect, and a second tab of the
 * same account receives its own REST send back as `message:new`.
 */
export function appendIncomingMessage(
  queryClient: QueryClient,
  message: Message,
): void {
  const key = queryKeys.messages(message.conversation);

  // Don't create a cache for a thread that was never opened — it would start
  // life holding one message and look like the entire history.
  const existing = queryClient.getQueryData<MessageCache>(key);
  if (!existing) return;
  if (existsAnywhere(existing, message._id)) return;

  queryClient.setQueryData<MessageCache>(key, (cache) =>
    mutatePageZero(cache, (messages) => [message, ...messages]),
  );
}

export function insertOptimisticMessage(
  queryClient: QueryClient,
  conversationId: string,
  message: Message,
): void {
  queryClient.setQueryData<MessageCache>(
    queryKeys.messages(conversationId),
    (cache) => mutatePageZero(cache, (messages) => [message, ...messages]),
  );
}

/** Swaps the optimistic row for the server's, keeping its position. */
export function replaceOptimisticMessage(
  queryClient: QueryClient,
  conversationId: string,
  clientId: string,
  confirmed: Message,
): void {
  queryClient.setQueryData<MessageCache>(
    queryKeys.messages(conversationId),
    (cache) => {
      // If `message:new` already delivered this id, drop the placeholder rather
      // than rendering the same text twice.
      if (existsAnywhere(cache, confirmed._id)) {
        return mutatePageZero(cache, (messages) =>
          messages.filter((m) => m.clientId !== clientId),
        );
      }

      return mutatePageZero(cache, (messages) =>
        messages.map((m) =>
          m.clientId === clientId ? { ...confirmed, clientId } : m,
        ),
      );
    },
  );
}

export function markMessageFailed(
  queryClient: QueryClient,
  conversationId: string,
  clientId: string,
): void {
  queryClient.setQueryData<MessageCache>(
    queryKeys.messages(conversationId),
    (cache) =>
      mutatePageZero(cache, (messages) =>
        messages.map((m) =>
          m.clientId === clientId ? { ...m, status: "failed" } : m,
        ),
      ),
  );
}

export function removeMessage(
  queryClient: QueryClient,
  conversationId: string,
  clientId: string,
): void {
  queryClient.setQueryData<MessageCache>(
    queryKeys.messages(conversationId),
    (cache) =>
      mutatePageZero(cache, (messages) =>
        messages.filter((m) => m.clientId !== clientId),
      ),
  );
}
