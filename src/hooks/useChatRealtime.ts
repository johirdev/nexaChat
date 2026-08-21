"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "@/src/app/AuthProvider";
import {
  bumpConversation,
  removeConversation,
  upsertConversation,
} from "@/src/lib/conversationCache";
import { appendIncomingMessage } from "@/src/lib/messageCache";
import { useChatSocket } from "@/src/lib/providers/SocketProvider";
import { queryKeys } from "@/src/lib/queryKeys";
import {
  normalizeSocketMessage,
  type RawGroupConversation,
  type RawSocketMessage,
} from "@/src/types/chat";

interface RealtimeCallbacks {
  /** Fired when the current user is removed from, or leaves, a conversation. */
  onRemovedFrom?: (conversationId: string) => void;
}

/**
 * The single subscription point for server events. Mount this once, above the
 * chat — mounting it twice would apply every frame twice.
 *
 * Server → client events (verified live):
 *   message:new           — a message for a conversation you are in. NOT sent
 *                           back to the author, so the sender relies entirely
 *                           on its optimistic row.
 *   conversation:updated  — a group you belong to changed. Delivered to every
 *                           member including the actor, and including a member
 *                           who was just removed.
 */
export function useChatRealtime({ onRemovedFrom }: RealtimeCallbacks = {}) {
  const { socket, status } = useChatSocket();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  // Keep the latest callback without re-subscribing on every render.
  const removedRef = useRef(onRemovedFrom);
  useEffect(() => {
    removedRef.current = onRemovedFrom;
  }, [onRemovedFrom]);

  const currentUserId = user?._id;

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (payload: unknown) => {
      const raw = payload as RawSocketMessage;
      if (!raw?.id || !raw.conversation) return;

      const message = normalizeSocketMessage(raw);

      appendIncomingMessage(queryClient, message);

      // A message for a thread the sidebar has never seen means a new
      // conversation was just opened with us — pull the list.
      if (!bumpConversation(queryClient, message)) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.conversations,
        });
      }
    };

    const handleConversation = (payload: unknown) => {
      const raw = payload as RawGroupConversation;
      if (!raw?._id) return;

      const stillAMember = raw.participants?.some(
        (participant) => participant._id === currentUserId,
      );

      if (currentUserId && raw.participants && !stillAMember) {
        removeConversation(queryClient, raw._id);
        removedRef.current?.(raw._id);
        return;
      }

      upsertConversation(queryClient, raw);
    };

    socket.on("message:new", handleMessage);
    socket.on("conversation:updated", handleConversation);

    return () => {
      socket.off("message:new", handleMessage);
      socket.off("conversation:updated", handleConversation);
    };
  }, [socket, queryClient, currentUserId]);

  // Anything that happened while the socket was down was never delivered.
  // Re-sync once it comes back.
  const wasConnected = useRef(false);
  useEffect(() => {
    if (status === "connected" && wasConnected.current) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    }
    wasConnected.current = status === "connected";
  }, [status, queryClient]);
}

export default useChatRealtime;
