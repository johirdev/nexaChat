import { api } from "@/src/lib/api";
import type { RawMessage } from "@/src/types/chat";

export const MESSAGE_PAGE_SIZE = 25;

export interface MessagePage {
  /** Newest first, as the API returns them. */
  messages: RawMessage[];
  hasMore: boolean;
  /** Pass as `before` to fetch the page above this one; null when exhausted. */
  nextCursor: string | null;
}

/**
 * GET /conversations/{id}/messages
 *
 * Verified against the live API:
 *  - `{ messages: [...], hasMore: boolean }`, messages sorted NEWEST FIRST.
 *  - `limit` is honoured here (unlike `/users/search`).
 *  - **`before` is INCLUSIVE.** Asking for the page before message X returns X
 *    again as the first item. Left alone that renders every page boundary
 *    twice, so the cursor message is stripped below.
 */
export async function getMessages(
  conversationId: string,
  options: { limit?: number; before?: string; signal?: AbortSignal } = {},
): Promise<MessagePage> {
  const { limit = MESSAGE_PAGE_SIZE, before, signal } = options;

  const { data } = await api.get<{ messages?: RawMessage[]; hasMore?: boolean }>(
    `/conversations/${conversationId}/messages`,
    {
      params: { limit, ...(before ? { before } : {}) },
      signal,
    },
  );

  const received = data?.messages ?? [];
  const messages = before
    ? received.filter((message) => message._id !== before)
    : received;

  const oldest = messages.at(-1) ?? null;

  return {
    messages,
    // The server can report `hasMore` while the only row was the repeated
    // cursor. Treat that as the end rather than looping on an empty page.
    hasMore: Boolean(data?.hasMore) && messages.length > 0,
    nextCursor: data?.hasMore && oldest ? oldest._id : null,
  };
}

/**
 * POST /messages
 *
 * Preferred over the socket's `message:send` for outgoing text: this returns the
 * created message with its real `_id` and ISO timestamp, which is what an
 * optimistic row needs to reconcile against. The socket's ack is only
 * `{ ok: true }` — no id — and the server does not echo `message:new` back to
 * the sender either way.
 */
export async function sendMessage(
  conversationId: string,
  text: string,
): Promise<RawMessage> {
  const { data } = await api.post<RawMessage>("/messages", {
    conversationId,
    text,
  });
  return data;
}
