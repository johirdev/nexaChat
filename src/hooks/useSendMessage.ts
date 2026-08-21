"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext } from "react";
import { AuthContext } from "@/src/app/AuthProvider";
import { bumpConversation } from "@/src/lib/conversationCache";
import { getApiErrorMessage } from "@/src/lib/errors";
import {
  insertOptimisticMessage,
  markMessageFailed,
  removeMessage,
  replaceOptimisticMessage,
} from "@/src/lib/messageCache";
import { queryKeys } from "@/src/lib/queryKeys";
import { sendMessage } from "@/src/services/messages";
import { normalizeMessage, type Message } from "@/src/types/chat";

function makeClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface SendMessageInput {
  conversationId: string;
  text: string;
  /** Set when retrying — reuses the failed row instead of adding another. */
  clientId?: string;
}

/**
 * Sends over REST and lets the socket deliver to everyone else.
 *
 * Why not `message:send`? Its ack is only `{ ok: true }` — no id, no timestamp —
 * and the server does not echo `message:new` back to the sender, so a socket
 * send leaves the optimistic row with nothing to reconcile against. The REST
 * response returns the created message in full, which makes the optimistic
 * lifecycle exact.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  const mutation = useMutation({
    mutationFn: async ({ conversationId, text }: SendMessageInput) => {
      const raw = await sendMessage(conversationId, text);
      return normalizeMessage(raw);
    },

    onMutate: ({ conversationId, text, clientId }) => {
      const id = clientId ?? makeClientId();

      const optimistic: Message = {
        _id: `pending-${id}`,
        conversation: conversationId,
        sender: user?._id ?? "",
        text,
        createdAt: new Date().toISOString(),
        status: "sending",
        clientId: id,
      };

      if (clientId) {
        // A retry: the row is already on screen, just put it back in flight.
        removeMessage(queryClient, conversationId, clientId);
      }
      insertOptimisticMessage(queryClient, conversationId, optimistic);

      return { clientId: id };
    },

    onSuccess: (confirmed, variables, context) => {
      replaceOptimisticMessage(
        queryClient,
        variables.conversationId,
        context.clientId,
        confirmed,
      );

      // Refresh the sidebar preview; fall back to a refetch for a thread the
      // list has not seen yet (first message in a brand-new conversation).
      if (!bumpConversation(queryClient, confirmed)) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.conversations,
        });
      }
    },

    onError: (_error, variables, context) => {
      if (context?.clientId) {
        markMessageFailed(
          queryClient,
          variables.conversationId,
          context.clientId,
        );
      }
    },
  });

  const send = useCallback(
    (conversationId: string, text: string) => {
      const trimmed = text.trim();
      // The API happily stores "" and "   " — refuse them here.
      if (!trimmed) return;
      mutation.mutate({ conversationId, text: trimmed });
    },
    [mutation],
  );

  const retry = useCallback(
    (message: Message) => {
      if (!message.clientId) return;
      mutation.mutate({
        conversationId: message.conversation,
        text: message.text,
        clientId: message.clientId,
      });
    },
    [mutation],
  );

  const discard = useCallback(
    (message: Message) => {
      if (!message.clientId) return;
      removeMessage(queryClient, message.conversation, message.clientId);
    },
    [queryClient],
  );

  return {
    send,
    retry,
    discard,
    isSending: mutation.isPending,
    error: mutation.error ? getApiErrorMessage(mutation.error) : null,
  };
}

export default useSendMessage;
