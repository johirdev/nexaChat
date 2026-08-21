import type { User } from "./user";

export type ConversationType = "direct" | "group";

/* ==========================================================================
   RAW WIRE SHAPES
   Verified against the live API. `GET /conversations` returns two different
   object shapes inside one array, and the socket sends a third shape for
   messages — everything below documents what actually arrives.
   ========================================================================== */

/** Preview attached to a conversation. Arrives as `{}` when nothing was sent. */
export interface RawLastMessage {
  text?: string;
  sender?: string;
  createdAt?: string;
}

/** A 1-to-1 row. Note `participant` is SINGULAR and there is no `name`. */
export interface RawDirectConversation {
  _id: string;
  type: "direct";
  updatedAt?: string;
  lastMessage?: RawLastMessage;
  participant?: User;
}

/** A group row — and also what every group mutation returns. */
export interface RawGroupConversation {
  _id: string;
  type: "group";
  updatedAt?: string;
  createdAt?: string;
  lastMessage?: RawLastMessage;
  name?: string;
  createdBy?: string;
  admins?: string[];
  participants?: User[];
}

export type RawConversation = RawDirectConversation | RawGroupConversation;

/** REST message: `_id`, ISO `createdAt`. */
export interface RawMessage {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: string;
}

/**
 * Socket `message:new` payload. It is NOT the REST shape: the id arrives as
 * `id` and the timestamp as epoch milliseconds. Normalise before it touches the
 * cache or React will key rows on `undefined` and every date will be Invalid.
 */
export interface RawSocketMessage {
  id: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: number | string;
}

/* ==========================================================================
   VIEW MODELS
   ========================================================================== */

export type MessageStatus = "sent" | "sending" | "failed";

export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  text: string;
  /** Always ISO 8601 once normalised. */
  createdAt: string;
  status: MessageStatus;
  /** Present only while a message is optimistic, so a retry can find it. */
  clientId?: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  /** The other person's name for a direct chat, the group name for a group. */
  title: string;
  /** Stable seed for the deterministic avatar. */
  avatarSeed: string;
  updatedAt: string;
  lastMessage: RawLastMessage | null;
  /** Everyone in the chat, including the current user. */
  participants: User[];
  admins: string[];
  /** The other party — direct chats only. */
  otherUser: User | null;
  createdBy: string | null;
}

/* ==========================================================================
   NORMALISERS
   ========================================================================== */

const EPOCH = new Date(0).toISOString();

function toIso(value: string | number | undefined): string {
  if (typeof value === "number") return new Date(value).toISOString();
  if (typeof value === "string" && value) return value;
  return EPOCH;
}

function hasContent(preview: RawLastMessage | undefined): boolean {
  return Boolean(preview && (preview.text || preview.createdAt));
}

export function normalizeMessage(raw: RawMessage): Message {
  return {
    _id: raw._id,
    conversation: raw.conversation,
    sender: raw.sender,
    text: raw.text ?? "",
    createdAt: toIso(raw.createdAt),
    status: "sent",
  };
}

/** Bridges the socket's `{ id, createdAt: number }` onto the REST shape. */
export function normalizeSocketMessage(raw: RawSocketMessage): Message {
  return {
    _id: raw.id,
    conversation: raw.conversation,
    sender: raw.sender,
    text: raw.text ?? "",
    createdAt: toIso(raw.createdAt),
    status: "sent",
  };
}

export function normalizeConversation(
  raw: RawConversation,
  currentUserId: string | undefined,
): Conversation {
  const lastMessage = hasContent(raw.lastMessage)
    ? (raw.lastMessage as RawLastMessage)
    : null;

  const updatedAt =
    raw.updatedAt ??
    lastMessage?.createdAt ??
    (raw as RawGroupConversation).createdAt ??
    EPOCH;

  if (raw.type === "group") {
    const participants = raw.participants ?? [];
    return {
      id: raw._id,
      type: "group",
      title: raw.name?.trim() || "Unnamed group",
      avatarSeed: raw._id,
      updatedAt,
      lastMessage,
      participants,
      admins: raw.admins ?? [],
      otherUser: null,
      createdBy: raw.createdBy ?? null,
    };
  }

  const other = raw.participant ?? null;
  return {
    id: raw._id,
    type: "direct",
    title: other?.name?.trim() || "Unknown person",
    avatarSeed: other?._id ?? raw._id,
    updatedAt,
    lastMessage,
    participants: other ? [other] : [],
    admins: [],
    otherUser: other,
    createdBy: currentUserId ?? null,
  };
}

/**
 * A `conversation:updated` frame carries no `lastMessage` or `updatedAt`, so
 * merging it naively would wipe the list preview and re-sort the sidebar. Keep
 * those two fields from whatever we already had.
 */
export function mergeConversationUpdate(
  previous: Conversation | undefined,
  incoming: Conversation,
): Conversation {
  if (!previous) return incoming;
  return {
    ...incoming,
    lastMessage: incoming.lastMessage ?? previous.lastMessage,
    updatedAt:
      incoming.updatedAt === EPOCH ? previous.updatedAt : incoming.updatedAt,
  };
}

export function isGroupAdmin(
  conversation: Conversation,
  userId: string | undefined,
): boolean {
  return Boolean(
    userId && conversation.type === "group" && conversation.admins.includes(userId),
  );
}
