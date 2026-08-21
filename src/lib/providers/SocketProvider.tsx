"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AuthContext } from "@/src/app/AuthProvider";
import { createChatSocket, type ChatSocket } from "@/src/lib/socket";

export type SocketStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "offline";

interface SocketContextValue {
  socket: ChatSocket | null;
  status: SocketStatus;
  /** Last handshake rejection, e.g. "Invalid token". */
  authError: string | null;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  status: "connecting",
  authError: null,
});

export function useChatSocket(): SocketContextValue {
  return useContext(SocketContext);
}

/**
 * Connection state tagged with the socket it describes. Tagging lets the value
 * be derived during render — a socket the state does not belong to simply reads
 * as "connecting" — so switching accounts needs no reset effect.
 */
interface ConnectionState {
  owner: ChatSocket | null;
  status: SocketStatus;
  authError: string | null;
}

const INITIAL: ConnectionState = {
  owner: null,
  status: "connecting",
  authError: null,
};

/**
 * Owns exactly one socket for the session. Mounted above the chat so every
 * consumer shares one connection — a second would double every `message:new`.
 */
export default function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useContext(AuthContext);
  const [connection, setConnection] = useState<ConnectionState>(INITIAL);

  // Constructed, not connected: `autoConnect` is off in `createChatSocket`, so
  // this only builds the object. The effect below owns the actual I/O.
  const socket = useMemo(
    () => (token ? createChatSocket(token) : null),
    [token],
  );

  useEffect(() => {
    if (!socket) return;

    const onConnect = () =>
      setConnection({ owner: socket, status: "connected", authError: null });

    const onDisconnect = (reason: string) => {
      // An explicit close on either end will not auto-reconnect; anything else will.
      const terminal =
        reason === "io server disconnect" || reason === "io client disconnect";
      setConnection({
        owner: socket,
        status: terminal ? "offline" : "reconnecting",
        authError: null,
      });
    };

    const onConnectError = (error: Error) => {
      const message = error.message || "Connection failed";

      if (message === "Invalid token" || message === "No token provided") {
        // Retrying cannot fix a rejected JWT — stop and surface it.
        socket.close();
        setConnection({ owner: socket, status: "offline", authError: message });
        return;
      }

      setConnection((previous) => ({
        owner: socket,
        status:
          previous.owner === socket && previous.status === "connected"
            ? "reconnecting"
            : "connecting",
        authError: null,
      }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.close();
    };
  }, [socket]);

  const value = useMemo<SocketContextValue>(() => {
    if (!token) {
      return { socket: null, status: "offline", authError: null };
    }

    const isCurrent = connection.owner === socket;
    return {
      socket,
      status: isCurrent ? connection.status : "connecting",
      authError: isCurrent ? connection.authError : null,
    };
  }, [token, socket, connection]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
