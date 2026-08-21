# NexaChat API — observed contract

The published OpenAPI document at `/docs` specifies requests only; response
bodies and status codes are left undocumented on purpose. Everything below was
captured by calling the live deployment and recording what came back, including
several behaviours that differ from what the spec implies.

- **REST base:** `https://frontend-task-chatapp.onrender.com/api`
- **WebSocket:** `https://frontend-task-chatapp.onrender.com` — the **root
  origin**, not the `/api` base. Connecting to `/api` fails the handshake.

---

## Errors

Every failure uses one envelope. There is **no top-level `message` key**, so
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

`details` appears only on validation failures. Observed codes: `NO_TOKEN`,
`INVALID_TOKEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `FORBIDDEN`.

Parsed centrally in `src/lib/errors.ts`.

---

## Auth

### `POST /auth/login`

One endpoint for login and registration — an unknown phone number creates an
account, a known one signs in.

```json
{ "phone": "+15551234567", "name": "Ada Lovelace" }
```

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

The token is stored in the `access_token` cookie with its expiry taken from the
JWT's own `exp` claim, and attached to every request by the Axios interceptor in
`src/lib/api.ts`:

```http
Authorization: Bearer <jwt>
```

### `GET /auth/me`

Returns the user object **bare** — not wrapped in `{ user }`.

```json
{ "_id": "…", "name": "Ada Lovelace", "phone": "+15551234567", "createdAt": "…" }
```

Without the header: `{"error":{"message":"No token provided","code":"NO_TOKEN"}}`.

---

## Users

### `GET /users/search?q=`

```json
[
  { "_id": "6a88239de5d6aac97521e231", "name": "Sarah Chen", "phone": "+8801700000001" }
]
```

A bare array of `{ _id, name, phone }` — no `createdAt`, no envelope.

**Four behaviours the spec does not mention:**

| Observation | Detail |
| --- | --- |
| `q` is optional | Marked required, but omitting it returns the directory. |
| Response is capped at 50 | `q=` returns 50 records regardless of how many exist. |
| Matching is case-sensitive and prefix-anchored | `Sarah` → 2 hits; `sarah` → 0; `arah` → 0. |
| No pagination | `limit`, `page`, `skip` and `offset` are all ignored. |
| You are in your own results | The signed-in user is not filtered out. |

Because a case-sensitive prefix match is not what a person expects from a search
box, `src/hooks/useUserDirectory.ts` merges the cached directory with the
server's own matches and re-filters client-side: case-insensitive substring on
the name, digits-only substring on the phone. The current user is removed, and
the merged list is windowed 20 at a time.

---

## Conversations

### `GET /conversations`

```json
{ "data": [ … ] }
```

Sorted by `updatedAt` descending. **The array mixes two different shapes.**

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

`lastMessage` is `{}` when nothing has been sent. Both shapes are folded into one
view model by `normalizeConversation` in `src/types/chat.ts`.

### `POST /conversations`

```json
{ "userId": "665f0c2a9b1e4a0012ab34cd" }
```

Idempotent — the same pair always returns the same `_id`. The response is a
**third** shape, with unpopulated participants and no `type`:

```json
{
  "_id": "6a882a03e5d6aac97521e666",
  "participants": ["<userA>", "<userB>"],
  "createdAt": "2026-08-21T10:35:47.934Z"
}
```

Only the id is usable; the client refetches the list for a renderable record.

### `GET /conversations/{id}/messages?limit=&before=`

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

- Messages are ordered **newest first**.
- `limit` **is** honoured here, unlike `/users/search`.
- `sender` is an id, not a populated user — resolve it against the
  conversation's participants.
- **`before` is inclusive.** Requesting the page before message *X* returns *X*
  again as the first item. Left alone this renders every page boundary twice;
  `src/services/messages.ts` strips the cursor row.

---

## Messages

### `POST /messages`

```json
{ "conversationId": "…", "text": "Hello!" }
```

Returns the created message in the same shape as history:

```json
{
  "_id": "…",
  "conversation": "…",
  "sender": "…",
  "text": "Hello!",
  "createdAt": "2026-08-21T15:57:09.499Z"
}
```

- Empty and whitespace-only text is **accepted and stored** — validate client-side.
- An unknown `conversationId` returns `null`, not an error envelope.

---

## Groups

All five endpoints return the **full updated group conversation**, in the same
shape as a group row in `GET /conversations`, so the client patches its cache
from the response without a follow-up fetch.

| Endpoint | Body | Notes |
| --- | --- | --- |
| `POST /conversations/group` | `{ name, participantIds[] }` | Creator becomes the first admin. |
| `POST /conversations/{id}/participants` | `{ userIds[] }` | Admins only. |
| `DELETE /conversations/{id}/participants/{userId}` | — | Admins only; your own id leaves. |
| `POST /conversations/{id}/admins` | `{ userId }` | Admins only. |
| `PATCH /conversations/{id}` | `{ name }` | Admins only. |

Non-admin attempts return `403`-style envelopes, e.g.
`{"error":{"message":"Only admins can rename the group","code":"FORBIDDEN"}}`.

---

## WebSocket (Socket.io v4)

```js
const socket = io("https://frontend-task-chatapp.onrender.com", {
  auth: { token },
});
```

Handshake rejections arrive on `connect_error`: `"Invalid token"` for a bad JWT,
`"No token provided"` when the token is missing. Neither is worth retrying, so
the client stops reconnecting on both.

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

**This is not the REST message shape.** The id arrives as `id` rather than `_id`,
and `createdAt` is epoch milliseconds rather than an ISO string.
`normalizeSocketMessage` bridges the two.

Delivery, as observed:

- Fires for both socket sends and REST sends.
- Reaches every other participant, direct and group alike.
- **Never reaches the author.** The sender has no echo to reconcile against,
  which is why outgoing messages rely on an optimistic row.

### `conversation:updated` (server → client)

Carries the full group conversation after a rename, or a member/admin change. It
reaches **every** member including the actor, and including a member who was
just removed — which is how the client detects "I was removed" and drops the
conversation. The payload has **no `lastMessage` and no `updatedAt`**, so both
are preserved from the cached copy on merge.

### `message:send` (client → server)

```js
socket.emit("message:send", { conversationId, text }, (ack) => {
  // { ok: true } | { ok: false, error: "Conversation not found" }
});
```

The ack carries no id and no timestamp. This client therefore **sends over REST**
and only *receives* over the socket: `POST /messages` returns the full created
message, which is what an optimistic row needs in order to reconcile exactly.
