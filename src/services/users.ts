import { api } from "@/src/lib/api";
import type { User } from "@/src/types/user";

/**
 * GET /users/search
 *
 * Behaviour verified against the live deployment (not documented in the spec):
 *
 *  - `q` is optional despite being marked required. Omitting it returns the
 *    whole directory, which the server caps at 50 records.
 *  - Matching is case-SENSITIVE and anchored to the START of the name:
 *      "Sarah" -> 2 hits, "sarah" -> 0, "arah" -> 0.
 *  - `limit`, `page`, `skip` and `offset` are all ignored. There is no
 *    server-side pagination; the endpoint always returns the full result set.
 *  - The signed-in user is included in their own results.
 *
 * The first two quirks are why `useUserDirectory` merges these results with a
 * cached copy of the directory and re-filters on the client — so a person
 * typing "sarah" or "chen" still finds Sarah Chen.
 */
export async function searchUsers(
  q: string,
  signal?: AbortSignal,
): Promise<User[]> {
  const { data } = await api.get<User[] | { data?: User[] }>("/users/search", {
    params: { q },
    signal,
  });

  // Tolerate both a bare array and a { data: [...] } envelope.
  if (Array.isArray(data)) return data;
  return data?.data ?? [];
}
