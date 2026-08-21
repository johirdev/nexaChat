import { api } from "@/src/lib/api";
import type { RawConversation, RawGroupConversation } from "@/src/types/chat";

/**
 * GET /conversations
 *
 * Returns `{ data: [...] }`, already sorted by `updatedAt` descending. The array
 * mixes two shapes — see `types/chat.ts`.
 */
export async function listConversations(
  signal?: AbortSignal,
): Promise<RawConversation[]> {
  const { data } = await api.get<{ data?: RawConversation[] } | RawConversation[]>(
    "/conversations",
    { signal },
  );

  if (Array.isArray(data)) return data;
  return data?.data ?? [];
}

/**
 * POST /conversations — start (or reopen) a 1-to-1 chat.
 *
 * Idempotent: calling it twice for the same pair returns the same `_id`. The
 * response is a THIRD shape — `{ _id, participants: [ids], createdAt }` with no
 * `type` and unpopulated participants — so only the id is worth reading here.
 * Refetch the list to get a renderable conversation.
 */
export async function startDirectConversation(
  userId: string,
): Promise<{ _id: string }> {
  const { data } = await api.post<{ _id: string }>("/conversations", { userId });
  return data;
}

/** POST /conversations/group — the creator becomes the first admin. */
export async function createGroup(
  name: string,
  participantIds: string[],
): Promise<RawGroupConversation> {
  const { data } = await api.post<RawGroupConversation>("/conversations/group", {
    name,
    participantIds,
  });
  return data;
}

/* --------------------------------------------------------------------------
   Every mutation below returns the FULL updated group conversation, so the
   cache can be patched from the response without a follow-up fetch.
   -------------------------------------------------------------------------- */

/** PATCH /conversations/{id} — admins only. */
export async function renameGroup(
  conversationId: string,
  name: string,
): Promise<RawGroupConversation> {
  const { data } = await api.patch<RawGroupConversation>(
    `/conversations/${conversationId}`,
    { name },
  );
  return data;
}

/** POST /conversations/{id}/participants — admins only. */
export async function addParticipants(
  conversationId: string,
  userIds: string[],
): Promise<RawGroupConversation> {
  const { data } = await api.post<RawGroupConversation>(
    `/conversations/${conversationId}/participants`,
    { userIds },
  );
  return data;
}

/**
 * DELETE /conversations/{id}/participants/{userId}
 * Admins remove anyone; passing your own id is how you leave.
 */
export async function removeParticipant(
  conversationId: string,
  userId: string,
): Promise<RawGroupConversation> {
  const { data } = await api.delete<RawGroupConversation>(
    `/conversations/${conversationId}/participants/${userId}`,
  );
  return data;
}

/** POST /conversations/{id}/admins — admins only. */
export async function promoteToAdmin(
  conversationId: string,
  userId: string,
): Promise<RawGroupConversation> {
  const { data } = await api.post<RawGroupConversation>(
    `/conversations/${conversationId}/admins`,
    { userId },
  );
  return data;
}
