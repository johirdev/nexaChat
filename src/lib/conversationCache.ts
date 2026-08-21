import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import type {
  Message,
  RawConversation,
  RawGroupConversation,
} from "@/src/types/chat";

type ConversationCache = RawConversation[];

function sortByActivity(list: ConversationCache): ConversationCache {
  return [...list].sort(
    (a, b) => Date.parse(b.updatedAt ?? "") - Date.parse(a.updatedAt ?? ""),
  );
}

/**
 * Moves a conversation to the top of the list and refreshes its preview after a
 * message lands. Patching locally keeps the sidebar in sync without a refetch
 * on every single message.
 *
 * Returns false when the conversation is not in the cache yet — the caller
 * should invalidate, because a brand-new thread has to come from the server.
 */
export function bumpConversation(
  queryClient: QueryClient,
  message: Message,
): boolean {
  const existing = queryClient.getQueryData<ConversationCache>(
    queryKeys.conversations,
  );

  if (!existing?.some((item) => item._id === message.conversation)) {
    return false;
  }

  queryClient.setQueryData<ConversationCache>(queryKeys.conversations, (list) =>
    sortByActivity(
      (list ?? []).map((item) =>
        item._id === message.conversation
          ? {
              ...item,
              updatedAt: message.createdAt,
              lastMessage: {
                text: message.text,
                sender: message.sender,
                createdAt: message.createdAt,
              },
            }
          : item,
      ),
    ),
  );

  return true;
}

/**
 * Applies a `conversation:updated` frame, or the response of a group mutation.
 *
 * Those payloads carry no `lastMessage`/`updatedAt`, so both are preserved from
 * the cached copy — otherwise renaming a group would blank its preview and
 * throw it to the bottom of the list.
 */
export function upsertConversation(
  queryClient: QueryClient,
  incoming: RawGroupConversation,
): void {
  queryClient.setQueryData<ConversationCache>(queryKeys.conversations, (list) => {
    if (!list) return list;

    const index = list.findIndex((item) => item._id === incoming._id);
    if (index === -1) {
      return sortByActivity([...list, incoming]);
    }

    const previous = list[index];
    const merged: RawGroupConversation = {
      ...incoming,
      lastMessage: incoming.lastMessage ?? previous.lastMessage,
      updatedAt: incoming.updatedAt ?? previous.updatedAt,
    };

    const next = [...list];
    next[index] = merged;
    return sortByActivity(next);
  });
}

/** Drops a conversation the current user is no longer part of. */
export function removeConversation(
  queryClient: QueryClient,
  conversationId: string,
): void {
  queryClient.setQueryData<ConversationCache>(queryKeys.conversations, (list) =>
    (list ?? []).filter((item) => item._id !== conversationId),
  );
  queryClient.removeQueries({ queryKey: queryKeys.messages(conversationId) });
}
