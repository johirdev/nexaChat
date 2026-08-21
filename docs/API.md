# NexaChat API — documented contract

> **Part 1, deliverable 1.** The published OpenAPI document at `/docs` is
> request-focused on purpose: it lists endpoints, methods and request bodies but
> specifies **no response bodies and no status codes**. Everything below was
> produced by calling the live deployment endpoint by endpoint and recording
> what actually came back — including several behaviours that contradict what
> the spec implies.

- **REST base:** `https://frontend-task-chatapp.onrender.com/api`
- **WebSocket:** `https://frontend-task-chatapp.onrender.com` — the **root
  origin**, not the `/api` base. Connecting to `/api` fails the handshake.
- **Auth:** `Authorization: Bearer <jwt>` on every route except `/auth/login`
  and `/health`.

---

## 0. Error envelope

Every failure uses one shape. There is **no top-level `message` key**, so
`response.data.message` is always `undefined`.

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "name", "message": "Required" }]
  }
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `error.message` | `string` | Human-readable. Safe to show. |
| `error.code` | `string` | Machine-readable. |
| `error.details` | `{ path, message }[]` | Validation failures only. |

**Observed codes:** `NO_TOKEN`, `INVALID_TOKEN`, `VALIDATION_ERROR`,
`NOT_FOUND`, `FORBIDDEN`.

Parsed once in [`src/lib/errors.ts`](../src/lib/errors.ts).

---

## 1. Auth

### `POST /auth/login` — log in or register

No separate signup. An unknown phone number creates an account; a known one
signs in.

**Request**

```json
{ "phone": "+15551234567", "name": "Ada Lovelace" }
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `phone` | `string` | ✅ | `01824842336` and `+8801824842336` both accepted. |
| `name` | `string` | ✅ | Missing → `VALIDATION_ERROR` with `details[0].path = "name"`. |

**Response `200`**

```json
{
  "token": "<jwt>",
  "user": {
    "_id": "6a883e75e5d6aac975220c48",
    "name": "Ada Lovelace",
    "phone": "+15551234567",
    "createdAt": "2026-08-21T12:03:01.279Z"
  }
}
```

The JWT carries `sub`, `iat` and `exp` (7-day lifetime observed). The client
stores it in the `access_token` cookie with the expiry read from `exp`.

### `GET /auth/me` — current user

**Response `200`** — the user object **bare**, not wrapped in `{ user }`:

```json
{ "_id": "…", "name": "Ada Lovelace", "phone": "+15551234567", "createdAt": "…" }
```

**Response `400`** without the header:
`{"error":{"message":"No token provided","code":"NO_TOKEN"}}`

---

## 2. Users

### `GET /users/search?q=` — find people

**Response `200`** — a bare array, no envelope, no `createdAt`:

```json
[{ "_id": "6a88239de5d6aac97521e231", "name": "Sarah Chen", "phone": "+8801700000001" }]
```

**Five undocumented behaviours, all verified:**

| Observation | Evidence |
| --- | --- |
| `q` is optional despite being marked required | omitting it returns the directory |
| Response is capped at 50 | `q=` returns exactly 50 however many exist |
| Matching is **case-sensitive** and **prefix-anchored** | `Sarah` → 2 hits · `sarah` → 0 · `arah` → 0 |
| No pagination | `limit`, `page`, `skip`, `offset` are all ignored |
| You appear in your own results | not filtered server-side |

→ See [Known issues](#7-known-issues--workarounds) for the workaround.

---

## 3. Conversations

### `GET /conversations` — my conversations

**Response `200`** — `{ data: [...] }`, sorted by `updatedAt` descending.
**The array mixes two different object shapes.**

Direct — note `participant` is **singular**, and there is no `name`:

```json
{
  "_id": "6a882a03e5d6aac97521e666",
  "type": "direct",
  "lastMessage": { "text": "See you then", "sender": "…", "createdAt": "…" },
  "updatedAt": "2026-08-21T15:57:56.379Z",
  "participant": { "_id": "…", "name": "Bravo Probe", "phone": "+15559990002" }
}
```

Group — `admins` holds ids, `participants` holds populated users:

```json
{
  "_id": "6a88761ce5d6aac975230f63",
  "type": "group",
  "lastMessage": {},
  "updatedAt": "2026-08-21T16:00:35.270Z",
  "name": "Renamed Squad",
  "createdBy": "…",
  "admins": ["…"],
  "participants": [{ "_id": "…", "name": "Alpha Probe", "phone": "…" }]
}
```

`lastMessage` is `{}` when nothing has been sent. Both shapes are folded into
one view model by `normalizeConversation` in
[`src/types/chat.ts`](../src/types/chat.ts).

### `POST /conversations` — start a direct chat

**Request:** `{ "userId": "665f0c2a9b1e4a0012ab34cd" }`

**Idempotent** — the same pair always returns the same `_id`.

**Response `200`** — a **third** shape, unpopulated and without `type`:

```json
{
  "_id": "6a882a03e5d6aac97521e666",
  "participants": ["<userA>", "<userB>"],
  "createdAt": "2026-08-21T10:35:47.934Z"
}
```

Only the id is usable; the client refetches the list for a renderable record.

### `GET /conversations/{id}/messages` — history

| Param | In | Type | Notes |
| --- | --- | --- | --- |
| `id` | path | `string` | ✅ required |
| `limit` | query | `integer` | Honoured here, unlike `/users/search`. |
| `before` | query | `string` | Cursor — **inclusive**, see below. |

**Response `200`**

```json
{
  "messages": [
    {
      "_id": "6a887556e5d6aac975230619",
      "conversation": "6a882a03e5d6aac97521e666",
      "sender": "6a8829ece5d6aac97521e652",
      "text": "Bravo replying",
      "createdAt": "2026-08-21T15:57:10.797Z"
    }
  ],
  "hasMore": true
}
```

- Ordered **newest first**.
- `sender` is an id, not a populated user — resolve against the conversation's
  participants.
- **`before` is inclusive.** Requesting the page before message *X* returns *X*
  again as the first item.

---

## 4. Messages

### `POST /messages` — send

**Request:** `{ "conversationId": "…", "text": "Hello!" }`

**Response `200`** — the created message, same shape as history.

- Empty and whitespace-only `text` is **accepted and stored**.
- An unknown `conversationId` returns `null`, not an error envelope.

---

## 5. Groups

All five return the **full updated group conversation**, identical to a group
row in `GET /conversations`, so the client patches its cache from the response
without a follow-up fetch.

| Method | Endpoint | Body | Who |
| --- | --- | --- | --- |
| `POST` | `/conversations/group` | `{ name, participantIds[] }` | anyone; creator becomes first admin |
| `POST` | `/conversations/{id}/participants` | `{ userIds[] }` | admins |
| `DELETE` | `/conversations/{id}/participants/{userId}` | — | admins; own id = leave |
| `POST` | `/conversations/{id}/admins` | `{ userId }` | admins |
| `PATCH` | `/conversations/{id}` | `{ name }` | admins |

Non-admin attempts return e.g.
`{"error":{"message":"Only admins can rename the group","code":"FORBIDDEN"}}`.

There is **no demote** route, and **no delete/hide/archive** for a conversation
— `DELETE /conversations/{id}` answers `404 Route not found`.

---

## 6. WebSocket (Socket.io v4)

```js
const socket = io("https://frontend-task-chatapp.onrender.com", {
  auth: { token },
});
```

Handshake rejections arrive on `connect_error`: `"Invalid token"` for a bad JWT,
`"No token provided"` when missing. Neither is worth retrying, so the client
stops reconnecting on both.

### `message:new` (server → client)

```json
{
  "id": "6a887724e5d6aac975231a1f",
  "conversation": "6a882a03e5d6aac97521e666",
  "sender": "6a8829dfe5d6aac97521e64d",
  "text": "socket hello",
  "createdAt": 1787328292843
}
```

**This is not the REST message shape.** The id arrives as `id` rather than
`_id`, and `createdAt` is **epoch milliseconds** rather than an ISO string.

Delivery, as observed:

- Fires for socket sends **and** REST sends.
- Reaches every other participant, direct and group alike.
- **Never reaches the author** — the sender has no echo to reconcile against.

### `conversation:updated` (server → client)

Carries the full group conversation after a rename or a member/admin change.
Reaches **every** member including the actor, and including a member who was
just removed — which is how the client detects "I was removed". The payload has
**no `lastMessage` and no `updatedAt`**.

### `message:send` (client → server)

```js
socket.emit("message:send", { conversationId, text }, (ack) => {
  // { ok: true } | { ok: false, error: "Conversation not found" }
});
```

The ack carries no id and no timestamp.

---

## 7. Known issues & workarounds

| # | Issue | How this client handles it |
| --- | --- | --- |
| 1 | Errors nested under `error`, no top-level `message` | One parser in `lib/errors.ts`; `details[]` mapped onto form fields |
| 2 | `GET /conversations` returns two shapes; `POST` a third | `normalizeConversation()` folds them into one view model |
| 3 | `before` cursor is inclusive → duplicate rows at every page boundary | `services/messages.ts` strips the cursor message from the page |
| 4 | Socket message shape ≠ REST shape (`id`, epoch ms) | `normalizeSocketMessage()` bridges before anything touches the cache |
| 5 | No `message:new` echo to the sender | Outgoing messages are optimistic; REST response is the source of truth |
| 6 | `conversation:updated` drops `lastMessage`/`updatedAt` | Merge preserves both from the cached copy, so a rename can't blank the preview |
| 7 | `/users/search` is case-sensitive, prefix-only, capped at 50, unpaginated | Directory cached once, merged with server hits, re-filtered client-side; windowed 20 at a time |
| 8 | You appear in your own search results | Filtered by `currentUser._id` |
| 9 | Empty/whitespace `text` is stored | Rejected client-side before the request |
| 10 | Unknown `conversationId` returns `null`, not an error | Treated as a failure path |
| 11 | `message:send` ack has no id | Client sends over REST and only *receives* over the socket |
| 12 | No delete/hide/archive route | Removal is local, session-scoped, and reversible |
| 13 | Socket is at the root origin, not `/api` | `lib/socket.ts` derives the origin from the REST base |

Every one of these is commented at the point in the code that compensates for it.
