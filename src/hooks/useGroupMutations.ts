"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "@/src/app/AuthProvider";
import {
  removeConversation,
  upsertConversation,
} from "@/src/lib/conversationCache";
import { getApiErrorMessage } from "@/src/lib/errors";
import {
  addParticipants,
  promoteToAdmin,
  removeParticipant,
  renameGroup,
} from "@/src/services/conversations";
import type { RawGroupConversation } from "@/src/types/chat";

/**
 * Group admin actions. Every endpoint returns the full updated conversation, so
 * each one patches the cache from its own response — the matching
 * `conversation:updated` broadcast then arrives and lands on identical data.
 */
export function useGroupMutations(conversationId: string | null) {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  const applyResult = (result: RawGroupConversation) => {
    upsertConversation(queryClient, result);
  };

  const rename = useMutation({
    mutationFn: (name: string) => renameGroup(conversationId as string, name),
    onSuccess: applyResult,
  });

  const addMembers = useMutation({
    mutationFn: (userIds: string[]) =>
      addParticipants(conversationId as string, userIds),
    onSuccess: applyResult,
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) =>
      removeParticipant(conversationId as string, userId),
    onSuccess: applyResult,
  });

  const promote = useMutation({
    mutationFn: (userId: string) =>
      promoteToAdmin(conversationId as string, userId),
    onSuccess: applyResult,
  });

  // Leaving is the same endpoint pointed at yourself. The conversation then
  // disappears from this account entirely.
  const leave = useMutation({
    mutationFn: () =>
      removeParticipant(conversationId as string, user?._id as string),
    onSuccess: () => {
      if (conversationId) removeConversation(queryClient, conversationId);
    },
  });

  const firstError =
    rename.error ??
    addMembers.error ??
    removeMember.error ??
    promote.error ??
    leave.error;

  return {
    rename,
    addMembers,
    removeMember,
    promote,
    leave,
    isBusy:
      rename.isPending ||
      addMembers.isPending ||
      removeMember.isPending ||
      promote.isPending ||
      leave.isPending,
    error: firstError ? getApiErrorMessage(firstError) : null,
  };
}

export default useGroupMutations;
