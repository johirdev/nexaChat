/**
 * Every cache key in one place. The socket handlers write into these caches
 * directly, so a typo here is a silently stale UI — keep them centralised.
 */
export const queryKeys = {
  conversations: ["conversations"] as const,
  messages: (conversationId: string) => ["messages", conversationId] as const,
  userDirectory: ["users", "directory"] as const,
  userSearch: (term: string) => ["users", "search", term] as const,
} as const;
