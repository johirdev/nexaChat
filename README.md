# NexaChat

A realtime 1-to-1 and group chat client for the frontend take-home: phone-number
auth, a searchable people directory, threaded conversations with cursor
pagination, group administration, and live delivery over Socket.io.

Built with Next.js 16 (App Router), React 19, TanStack Query, Tailwind v4 and
socket.io-client.

## Running it

```bash
cp .env.example .env.local
npm install
npm run dev
```

`NEXT_PUBLIC_API_URL` must include the `/api` suffix; the WebSocket origin is
derived from it by stripping the path. Without it every request resolves against
`undefined` and the app cannot start.

Sign in at `/login` with any phone number and a name — an unknown number
registers automatically. To see realtime working, open a second browser profile
and sign in as someone else.

```bash
npm run build   # production build
npm run lint    # eslint
npx tsc --noEmit
```

## How it is put together

```
src/
  services/     one function per endpoint; the only place axios is called
  types/        wire shapes, view models, and the normalisers between them
  lib/          api client, auth cookie, error envelope, socket, cache writers
  hooks/        data + realtime behaviour, one concern per hook
  app/components/
    Chat/       rail, thread, composer, group panel, dialogs
    Users/      directory search, rows, skeletons
```

Data flows one way: `services` return raw wire shapes → `types` normalise them →
`hooks` own caching and mutations → components render. Socket frames land in the
same TanStack Query caches the REST calls populate, through the helpers in
`lib/messageCache.ts` and `lib/conversationCache.ts`, so there is a single source
of truth per screen.

### Realtime

`SocketProvider` owns exactly one connection for the session and reconnects with
backoff, except on an auth rejection — a bad JWT cannot be fixed by retrying.
`useChatRealtime` is the single subscription point; mounting it twice would apply
every frame twice.

Because the server does not echo `message:new` back to its author, outgoing
messages are optimistic: the row renders immediately as *sending*, is replaced by
the server's copy on success, and offers retry or discard on failure.

### Notes on the API

The published spec documents requests only. `docs/api.md` records the responses
as actually observed, including the parts that surprised us — the two different
conversation shapes, the inclusive `before` cursor, the socket's `id`/epoch
message shape, and the case-sensitive prefix-only user search. Each one is
commented at the point in the code that compensates for it.

## Known limits

- `/users/search` returns at most 50 records and ignores pagination parameters,
  so the directory's 20-at-a-time scroll windows a client-side list. The hook is
  shaped so that a real cursor would replace it without touching the UI.
- There is no read-receipt, typing, or presence endpoint, so none is faked. The
  dot on your own avatar is decoration, not presence.
- The JWT lives in a JavaScript-readable cookie. Moving it to an `httpOnly`
  cookie would need a route handler to proxy the API.
