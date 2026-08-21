import { io, type Socket } from "socket.io-client";
import config from "@/src/config/config";

/**
 * Socket.io is served from the host ROOT, not from the `/api` base the REST
 * client uses — connecting to `.../api` 404s the handshake. Derive one from the
 * other so there is a single source of truth for the deployment URL.
 */
export function getSocketOrigin(): string {
  const base = config.API ?? "";
  try {
    return new URL(base).origin;
  } catch {
    // Relative or missing base URL — fall back to the page's own origin.
    return typeof window !== "undefined" ? window.location.origin : "";
  }
}

export interface ServerToClientEvents {
  "message:new": (payload: unknown) => void;
  "conversation:updated": (payload: unknown) => void;
}

export interface ClientToServerEvents {
  "message:send": (
    payload: { conversationId: string; text: string },
    ack?: (response: { ok: boolean; error?: string }) => void,
  ) => void;
}

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * The JWT goes in the handshake auth, not a header — the server rejects a
 * missing token with "No token provided" and a bad one with "Invalid token".
 */
export function createChatSocket(token: string): ChatSocket {
  return io(getSocketOrigin(), {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    reconnectionDelayMax: 8_000,
    timeout: 20_000,
    // The provider constructs the socket during render and connects from an
    // effect, so construction must stay free of I/O.
    autoConnect: false,
  });
}
