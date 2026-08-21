<div align="center">

# NexaChat

**A realtime 1-to-1 and group chat client — built for the Frontend Developer take-home.**

Phone-number auth · searchable directory · live delivery over WebSocket · group admin controls

</div>

---

## Live links

| What | URL |
| --- | --- |
| 🎨 **Landing page** (Part 2) | **https://nexachatbangladesh.vercel.app** |
| 🚀 **Chat application** (Part 1) | **https://nexachatbangladesh.vercel.app/dashboard** |
| 📘 **User guide** | https://nexachatbangladesh.vercel.app/guide |
| 📄 **API documentation** | https://winter-crater-185123.docs.buildwithfern.com/nexa-chat/users/users |

> Both parts ship from one deployment: the landing page is the root route, the
> chat application lives at `/dashboard`.

---

## Running it locally

```bash
cp .env.example .env.local     # then set NEXT_PUBLIC_SITE_URL
npm install
npm run dev                    # http://localhost:3000
```

```bash
npm run build                  # production build
npm run lint                   # eslint
npx tsc --noEmit               # typecheck
```

`NEXT_PUBLIC_API_URL` must include the `/api` suffix — the WebSocket origin is
derived from it by stripping the path.

Sign in with any phone number and a name; an unknown number registers itself.
**To see realtime working, open a second browser profile and sign in as someone
else** — the server deliberately does not echo your own messages back to you.

---

## Table of contents

1. [Part 1 — API documentation & chat application](#part-1--api-documentation--chat-application)
2. [Part 2 — Landing page](#part-2--landing-page)
3. [Folder architecture](#folder-architecture)
4. [Part 3 — Thought process write-up](#part-3--thought-process-write-up)
   - [3.1 Architecture & library choices](#31-architecture--library-choices)
   - [3.2 Landing page design decisions](#32-landing-page-design-decisions)
   - [3.3 How AI tools were used](#33-how-ai-tools-were-used)
   - [3.4 What I would improve with more time](#34-what-i-would-improve-with-more-time)
   - [3.5 Issues I ran into with the API](#35-issues-i-ran-into-with-the-api)

---

# Part 1 — API documentation & chat application

## Deliverable 1: the API documentation

Written **before** any feature code, in [`docs/API.md`](docs/API.md).

The provided OpenAPI spec documents requests only — no response bodies, no
status codes. So I probed the live deployment endpoint by endpoint with `curl`
and a small Socket.io script, and wrote up what actually came back: every
request shape, every response shape, the error envelope, the socket contract,
and a table of **thirteen** behaviours that differ from what the spec implies.

I chose Markdown over a Postman collection because the interesting part of this
API is not the request shapes — those were given — it is the *inconsistencies*,
and prose explains those far better than a collection can.

I did not rename or add endpoints. The freedom to redesign the API was offered,
but the contract is the one thing a frontend cannot unilaterally change in real
life; documenting its quirks honestly and compensating for them in the client
felt closer to the actual job.

## Deliverable 2: the chat application

Every required feature, and where it lives:

| Requirement | Status | Implementation |
| --- | --- | --- |
| Login with phone + name, no separate registration | ✅ | `components/Auth/LoginForm.tsx` — Zod + react-hook-form, server field errors mapped back onto inputs |
| Start a conversation by searching name **or** phone | ✅ | `components/Users/PeopleList.tsx` + `hooks/useUserDirectory.ts` |
| Group conversations with multiple participants | ✅ | `components/Chat/NewGroupDialog.tsx`, `GroupInfoPanel.tsx` |
| Full message history per conversation | ✅ | `hooks/useMessages.ts` — cursor pagination, infinite scroll upward |
| Own vs. other messages visually distinct | ✅ | `MessageBubble.tsx` — side, colour, tail radius, avatar, sender name in groups |
| Timestamp on every message | ✅ | Per-run timestamps + day dividers (`lib/format.ts`) |
| Send messages | ✅ | `hooks/useSendMessage.ts` — optimistic, with retry/discard on failure |
| No empty messages | ✅ | Trimmed and rejected client-side (**the API itself stores `""`**) |
| Realtime incoming messages, no refresh | ✅ | `lib/providers/SocketProvider.tsx` + `hooks/useChatRealtime.ts` |
| Loading / empty / error states | ✅ | Skeletons matching real row geometry; distinct empty and error states per surface |
| Auto-scroll — but never yank a reader who scrolled up | ✅ | `MessageList.tsx`, see below |

### The auto-scroll rule, specifically

This was called out as important, so it is worth showing how it is done.
`MessageList.tsx` distinguishes **three** cases by looking at which end of the
list changed:

```
1. conversation id changed   → jump to the newest message
2. older messages prepended  → hold the reader's place by absorbing the
                               height the new page added
3. a new message appended    → follow ONLY if already within 120px of the bottom
```

A `stickToBottom` ref is updated from the scroll handler, never from a render,
so a reader who has scrolled up is never moved. When they are scrolled away, a
**"Latest"** pill appears instead of dragging them down.

### Bonus work

Things not asked for that I judged worth building:

- **Optimistic send with a real failure path.** Because the server never echoes
  your own message back, an optimistic row is not a nicety here — it is the only
  thing that puts your own text on screen. A failed send stays visible in red
  with **Retry** and **Discard** rather than vanishing.
- **Inclusive-cursor deduplication.** The `before` cursor returns the cursor
  message *again*. Left alone, every page boundary renders twice. Caught by
  probing, fixed in the service layer.
- **Socket/REST shape bridging.** The socket sends `id` + epoch milliseconds
  while REST sends `_id` + ISO. Both are normalised before touching the cache.
- **Multi-select conversation removal**, session-scoped and reversible, with an
  always-visible **Restore** affordance — because the API has no delete route
  and hiding something forever with no way back would be a worse bug than not
  shipping it.
- **A `/guide` route**: a seven-step interactive walkthrough with keyboard
  navigation, built from the same data that generates its `HowTo` structured
  data, so the two cannot drift.
- **Branded session loader** on `/dashboard` with an explained redirect, and the
  reverse guard sending a signed-in visitor from `/login` to `/dashboard`.
- **Production SEO**: sitemap, robots, build-time OG image via `next/og`,
  canonical URLs, and JSON-LD generated from the page's own content arrays.

---

# Part 2 — Landing page

A dark, product-explainer landing page at `/`, fully responsive from 320px up.

Sections: hero with a **live interactive chat demo**, core features, a full
product screenshot, a three-step flow, an everyday-use split, a connected
platform panel, groups, mobile, the VIP moment, FAQ with a contact card, and a
closing CTA.

Two pieces are the creative bet:

**1. The hero is playable, not a screenshot.** You can type into it and get a
real reply with a typing indicator. It is keyword-driven, holds its state in
memory only, and resets on refresh — a marketing demo should greet the next
visitor cleanly. A chat app whose hero you can chat with makes the argument
better than any static image.

**2. The VIP moment.** Enter your name and the card bursts into confetti
(hand-rolled on a canvas — no dependency) and turns into a personalised
founding-member badge with perks arriving one by one. Nothing is collected or
sent anywhere; the name lives in component state for the reveal, and the real
sign-up is still `/login`. Promising a badge and quietly harvesting contact
details would be a different kind of page.

---

# Folder architecture

The rule: **data flows one way**, and every layer has exactly one job.

```
services  →  types (normalise)  →  hooks (cache + mutate)  →  components (render)
```

```
src/
├─ app/
│  ├─ (site)/                    ← public routes, share nav + footer
│  │  ├─ page.tsx                    landing page + JSON-LD
│  │  ├─ guide/page.tsx              user guide + HowTo/FAQ schema
│  │  ├─ login/page.tsx              noindex, wrapped in LoginGate
│  │  └─ layout.tsx                  Inter + Hind Siliguri, AuthProvider(requireAuth: false)
│  ├─ dashboard/                 ← the chat application (noindex, session-gated)
│  │  ├─ layout.tsx                  QueryProvider → AuthProvider → SocketProvider
│  │  └─ page.tsx                    <ChatWorkspace />
│  ├─ components/
│  │  ├─ Auth/                       LoginForm, LoginGate
│  │  ├─ Brand/                      BrandLoader (session + redirect screen)
│  │  ├─ Chat/                       workspace, rail, thread, composer, group panel
│  │  ├─ Users/                      directory search, rows, skeletons
│  │  ├─ HomeLandingPage/            landing sections, hero demo, confetti, VIP
│  │  ├─ Guide/                      walkthrough
│  │  └─ Seo/                        JsonLd
│  ├─ AuthProvider.tsx           ← session status: checking | authed | guest
│  ├─ robots.ts · sitemap.ts · manifest.ts · opengraph-image.tsx
│  └─ globals.css                ← tokens + base only; each area owns its stylesheet
│
├─ services/                     ← the ONLY place axios is called
│  ├─ users.ts · conversations.ts · messages.ts
│
├─ types/                        ← wire shapes, view models, and the normalisers between
│  ├─ chat.ts · user.ts
│
├─ lib/
│  ├─ api.ts                        axios instance + bearer interceptor
│  ├─ auth.ts                       cookie lifecycle, expiry from the JWT's exp
│  ├─ errors.ts                     the one error-envelope parser
│  ├─ socket.ts                     socket factory, origin derived from the REST base
│  ├─ messageCache.ts               cache writers shared by REST and socket
│  ├─ conversationCache.ts          ↑
│  ├─ queryKeys.ts · format.ts · seo.ts
│  └─ providers/                    QueryProvider, SocketProvider
│
└─ hooks/                        ← one concern each
   ├─ useConversations · useMessages · useSendMessage
   ├─ useChatRealtime               the single socket subscription
   ├─ useGroupMutations · useUserDirectory
   ├─ useHiddenConversations · useVoiceRecorder · useDebouncedValue
```

**Why `services` and `types` are separate layers.** Services return raw wire
shapes exactly as the API sends them. Types own the translation into view
models. That boundary is where all thirteen API quirks are absorbed, which means
no component ever has to know that `GET /conversations` returns two different
object shapes.

**Why cache writers are their own module.** Socket frames and REST responses
write into the *same* TanStack Query caches. If that logic lived in components
they would drift. `messageCache.ts` and `conversationCache.ts` are the only
places cache mutation happens, so deduplication and ordering are guaranteed to
be identical whichever path a message arrives by.

---

# Part 3 — Thought process write-up

## 3.1 Architecture & library choices

### The approach

I documented before I built. The first two hours went into probing the live API
with `curl` and a Socket.io script — no UI, just recording what each endpoint
returns. That felt slow at the time and saved the project. Four of the
behaviours I found (the inclusive cursor, the socket's different message shape,
the missing self-echo, the two conversation shapes) would each have surfaced as
a confusing bug days later. Finding them in a terminal with a known input is
much cheaper than finding them through a React render.

Then I built bottom-up: services → types → hooks → components. By the time I
wrote the first component, every shape it needed already existed and was typed.

### Library choices

| Choice | Why | What I considered instead |
| --- | --- | --- |
| **Next.js 16 (App Router)** | Given by the starter. The route groups earn their keep: `(site)` and `dashboard` need completely different providers, fonts and indexing rules, and route groups express that without a single conditional. | — |
| **TanStack Query** | The hard problem here is not local state, it is *one cache written by two sources* — REST responses and socket frames. Query gives me a keyed cache I can write into imperatively from a socket handler, plus `useInfiniteQuery` for the `before` cursor. | **Zustand** (was already in the project). I'd have had to hand-roll request dedup, cursor pagination and stale handling. **SWR** — lighter, but its infinite API is weaker for cursor paging. |
| **socket.io-client** | Non-negotiable — the server is Socket.io, so a raw `WebSocket` cannot speak the protocol. | — |
| **Zod + react-hook-form** | The login form is the only real form. RHF keeps it uncontrolled (no re-render per keystroke) and `setError` maps the API's `details[]` straight onto the offending field. | Plain `useState` — fine for two fields, but I'd lose the server-error-to-field mapping. |
| **axios** | One instance, one request interceptor for the bearer token, and `signal` support so Query can cancel in-flight searches. | `fetch` — would have meant writing the interceptor by hand. |
| **Tailwind v4 + hand-written CSS** | Tailwind for layout utilities and the token layer; hand-written CSS files per area for anything with real design in it. A message bubble with grouped-run corner radii is unreadable as a utility string. | Utility-only — the bubble grouping logic alone convinced me otherwise. CSS Modules — would have fought the token sharing between the landing page and the auth screen. |
| **No animation library** | Scroll reveals are ~35 lines of IntersectionObserver plus a CSS transition, and confetti is a small canvas loop. | **framer-motion**, which is still in `package.json` from the starter and which I ended up not importing. Adding ~40 KB for a fade-and-lift did not justify itself. **This is a loose end — it should be removed from `package.json`.** |

### Trade-offs I made deliberately

- **Send over REST, receive over the socket.** The socket's `message:send` ack
  is only `{ ok: true }` — no id, no timestamp — so an optimistic row would have
  nothing to reconcile against. `POST /messages` returns the full created
  message. Slightly more latency, exact reconciliation.
- **The JWT lives in a JS-readable cookie.** An `httpOnly` cookie would need a
  route handler proxying every call. Given the time budget I chose the simpler
  path and documented it as a known limitation rather than pretending it is fine.
- **Client-side windowing for the directory.** `/users/search` ignores every
  pagination parameter and caps at 50, so "20 at a time" is windowed locally.
  The hook is deliberately shaped so a real cursor would replace it without any
  component changing.
- **`sessionStorage` over `localStorage` for hidden conversations.** Nothing is
  deleted server-side, so a hidden chat coming back in a new session is the
  honest behaviour — it stops a local-only decision from looking permanent.

## 3.2 Landing page design decisions

### Colour

The palette is not invented — it is **lifted from the logo**. Sampling the mark
gives a sweep of teal `#1fd1b4` → cyan `#35d0e0` → blue `#4a8cf7` → violet
`#8b4dff`, and that exact gradient became a single token (`--ln-sweep`) reused
in six places: the accent word in headlines, the "Chat" in the wordmark, the
stat figures, the nav underline animation, the contact card's border, and the
guide's progress bar. The ground is a deep indigo `#070c1a` biased toward the
logo's violet end, so the mark sits *in* the page rather than on top of it.

I built a light version first. It looked like every other SaaS page, and it made
the product screenshots — which are dark — read as foreign objects. Going dark
fixed both problems at once.

### Typography

**Inter** for Latin, **Hind Siliguri** for Bengali, loaded together through
`next/font`. The Bengali face matters: the audience is Bangladeshi, and a mixed
line falling back to a system font breaks the optical weight mid-sentence.
Headings run tight (`-0.032em` to `-0.042em`) at large sizes; body copy is
capped near 62 characters.

### Layout

A product-explainer rhythm — hero, four features, full screenshot, three-step
flow, split explainer, platform panel, groups, mobile, VIP, FAQ, CTA. Sections
alternate between two ground tones so the page has a pulse without needing
dividers.

### Motion

Deliberately restrained, and every piece of it earns a reason:

- Scroll reveals fade-and-lift **once**, then stop observing.
- The hero demo's typing indicator scales its delay with reply length — a flat
  delay reads as canned.
- Confetti fires from two lower corners plus a centre pop, so it reads as
  celebration rather than falling snow.
- **`prefers-reduced-motion` is honoured throughout**, and the confetti is
  skipped entirely for those readers — a screenful of flying objects is
  precisely what that preference is about.

### UX decisions

- The nav's section links are absolute (`/#features`), so they still work from
  `/guide` and `/login`.
- On mobile the login page puts the **form first** and the marketing copy below
  — people arrive there to sign in, not to read.
- Scroll reveals have a `@media (scripting: none)` fallback, so with JavaScript
  off the content is visible rather than permanently at `opacity: 0`.

## 3.3 How AI tools were used

I used **Claude (Claude Code)** throughout, and it is fair to say this project
was built in a pairing loop with it rather than by prompting for finished files.
Being specific about the split:

**Where AI did the heavy lifting**

- **API probing.** This was the highest-value use by far. I had it write the
  `curl` sequences and a Node Socket.io script that logged *every* event both
  clients received. That is how the inclusive cursor, the socket's `id` +
  epoch-milliseconds shape, and the missing self-echo were found — three bugs
  that would otherwise have cost real debugging time.
- **Boilerplate with a known shape.** Service functions, the axios instance,
  type definitions, the error parser.
- **The SVG product mockups.** Every screenshot in the landing page and guide is
  hand-authored SVG rather than a real screen capture, so it stays crisp at any
  size and never goes stale against a UI change.
- **Copywriting**, which I then cut down — the first drafts were consistently
  too long.

**Where I pushed back or rewrote**

- **The first landing page was light-themed.** Generated confidently, looked
  generic, clashed with the dark product screenshots. I rejected it and had the
  palette rebuilt from the logo instead.
- **An artificial delay in the directory's "load more".** The AI added a 320 ms
  hold so a skeleton would be visible. Since page two comes from memory, that is
  theatre. I kept it only because a one-frame flash is genuinely worse UX, and
  insisted it be named `PAGE_REVEAL_MS` with a comment saying it disappears the
  day the API paginates.
- **Attachments.** When I asked for voice and image upload, the AI's first
  instinct was to wire them as if they sent. There is no upload endpoint. I made
  it label the tray *"Preview only — uploads need a server endpoint"* instead of
  faking delivery.
- **`framer-motion`.** Suggested for the scroll reveals. I said no — 35 lines of
  IntersectionObserver does the same job without the bundle.
- **React Compiler lint errors.** Next 16's rules rejected several
  `setState`-in-effect and ref-during-render patterns the AI produced. Rather
  than suppress them I had the state restructured to be derived — the pagination
  window and the socket connection state are both tagged with what they belong
  to and read back during render, so no reset effect is needed at all. That
  change came from the linter being right.

**What I would not delegate**

The architecture — the services/types/hooks/components split, and the decision
to put cache writing in its own module — was mine, and it is the decision the
whole codebase rests on. Likewise the calls about *honesty*: sending over REST
rather than the socket, `sessionStorage` rather than `localStorage`, labelling
the attachment tray as preview-only. AI is good at producing something that
looks finished; deciding what "finished" is allowed to claim is not something I
handed over.

**Verification.** Every change went through `tsc --noEmit`, `eslint`, and
`next build`. Where I could not verify something I said so rather than assuming
— the browser-driven visual checks in particular were done by hand.

## 3.4 What I would improve with more time

**Testing — the biggest gap.** There are currently no tests, and I would not
call this production-ready without them. In priority order:

1. Unit tests for the normalisers in `types/chat.ts` — they absorb every API
   quirk, so they are the highest-leverage thing to pin down.
2. Unit tests for the cache writers, especially deduplication when a socket
   frame and a REST response race.
3. A Playwright test for the auto-scroll rule — "reader scrolled up is not
   yanked down" is exactly the behaviour that silently regresses.

**Beyond tests**

- **Move the JWT to an `httpOnly` cookie** behind a route handler, removing the
  XSS read surface.
- **Virtualise the message list.** Fine at hundreds of messages; at tens of
  thousands the DOM node count would hurt.
- **A proper accessibility audit.** Focus order, roles and reduced-motion are
  handled, but I have not tested with an actual screen reader end to end.
- **Smarter reconnect.** Today a reconnect invalidates the conversation list. A
  `since` parameter would let it fetch only what was missed.
- **Real attachments**, once an upload endpoint exists — the recorder and the
  preview tray are already built and waiting.
- **Error boundaries** per surface, so a thrown render in the thread does not
  take the whole workspace with it.
- **Remove `framer-motion`, `zustand`, `sonner`, `tailwind-merge` and
  `react-icons`** from `package.json` — all leftovers from the starter that this
  build does not import.

## 3.5 Issues I ran into with the API

Not "no significant issues" — there were thirteen, all verified against the live
deployment. The full table with evidence is in
[`docs/API.md`](docs/API.md#7-known-issues--workarounds). The five that changed
the architecture:

**1. `before` is an inclusive cursor.**
Requesting the page before message *X* returns *X* again as the first item, so
every page boundary rendered twice.
*Workaround:* `services/messages.ts` strips the cursor message from each page,
and treats a page that contained only the cursor as the end of history rather
than looping on an empty result.

**2. The socket's message shape is not the REST shape.**
REST sends `{ _id, createdAt: "2026-08-21T…" }`; the socket sends
`{ id, createdAt: 1787328292843 }`. Rendered naively, React keys on `undefined`
and every timestamp is `Invalid Date`.
*Workaround:* `normalizeSocketMessage()` bridges the two before anything reaches
the cache. Nothing downstream knows there was ever a difference.

**3. The server never echoes `message:new` to the sender.**
I confirmed this by connecting three clients and logging every event: when A
sends, B and C receive `message:new` and A receives nothing but an ack.
*Workaround:* outgoing messages are optimistic by necessity, not by preference.
The REST response is what confirms them, which is also why sending goes over
REST rather than the socket.

**4. `GET /conversations` returns two different object shapes in one array —
and `POST /conversations` returns a third.**
Direct rows carry a singular `participant` and no `name`; group rows carry
`participants[]`, `admins[]` and `name`. The `POST` response has unpopulated
participant ids and no `type` at all.
*Workaround:* one normaliser folds all three into a single `Conversation` view
model. After `POST` I use only the returned `_id` and refetch the list, since
that payload is not renderable.

**5. `/users/search` is case-sensitive, prefix-anchored, capped at 50, and
ignores every pagination parameter.**
`Sarah` returns two results; `sarah` and `arah` return zero. `limit`, `page`,
`skip` and `offset` are all silently ignored.
*Workaround:* the client caches the directory once, merges it with the server's
own prefix hits, and re-filters case-insensitively on name plus a digits-only
match on phone — so typing `sarah` or `1700` finds the right person. The 20-at-a-time
scroll is windowed locally, behind a hook shaped so a real cursor drops in
without touching the UI.

**Also worth flagging:** the API accepts and stores empty and whitespace-only
message text (rejected client-side); an unknown `conversationId` returns `null`
rather than an error envelope; and there is no delete, hide or archive route for
a conversation — `DELETE /conversations/{id}` answers `404 Route not found`,
which is why removing a chat is a local, reversible, session-scoped decision.

---

<div align="center">

Built by **Md. Johirul Islam Rasel** · [johirulislam574206@gmail.com](mailto:johirulislam574206@gmail.com)

</div>
