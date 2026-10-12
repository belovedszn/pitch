# Pitchfirst

**Pitch first. Meet second.** A platform where founders and investors find each other.

Founders publish a 60-second pitch. Investors set their mandate (stages, sectors, regions, cheque size).
Pitchfirst scores every founder↔investor pair with an **explainable** match score, and opens messaging only when
**both sides express interest**.

> Built by adapting the architecture, design system and UI kit of the Plinth repo into a new product.
> The billing engine, Nomba integration, docs site and 3D marketing site were intentionally **not** carried over.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + React 18 |
| Language | TypeScript (strict, `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS 3, CSS-variable design tokens, dark mode |
| Data fetching | TanStack Query v5 |
| Forms + validation | React Hook Form + Zod (same schemas validate client **and** API) |
| Auth | Signed, httpOnly JWT session cookie (`jose`) + edge middleware |
| Motion / charts / toasts | Framer Motion · Recharts · Sonner |
| Tests | Vitest + Testing Library |
| Package manager | pnpm workspaces |

## Quickstart

```bash
pnpm install
cp apps/web/.env.local.example apps/web/.env.local   # set SESSION_SECRET
pnpm dev                                             # http://localhost:3000
```

Open `/login` and use **Demo founder** or **Demo investor** — both come pre-populated with startups, investors,
matches, a live conversation and notifications. Or sign up as a new user.

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint
pnpm test        # 24 unit tests: matching, store rules, utils, components
pnpm build && pnpm start
```

## Repository structure

```
pitchfirst/
├── apps/web/
│   ├── src/app/
│   │   ├── page.tsx                  # marketing landing
│   │   ├── login/  signup/           # auth (role chosen at signup)
│   │   ├── dashboard/                # overview · discover · matches · messages · pitch · profile
│   │   └── api/                      # route handlers (auth, me, discover, matches, threads, …)
│   ├── src/server/                   # server-only: store, seed, session, http helpers
│   ├── src/lib/                      # types, zod schemas, matching engine, API client, query hooks
│   ├── src/components/               # ui kit · layout · discover · marketing · auth
│   └── src/middleware.ts             # gates /dashboard, bounces signed-in users from /login
└── .github/workflows/ci.yml          # typecheck → test → build
```

## How it works

**Matching** (`src/lib/matching.ts`) — deterministic, 0–100, with reasons:
sector 35 · stage 30 · cheque size 20 · region 15. No black box: every card shows *why* it was surfaced.

**Connection rules** (`src/server/store.ts`)
- Expressing interest creates a one-sided `interested` match and notifies the other party.
- If the other side had already expressed interest, the match becomes `connected` and a message thread opens.
- Users can *pass*, but nobody can force a connection; only thread participants can read or send messages.
- Editing a profile re-scores all of that user's existing matches.

## ⚠️ What this is — and isn't (read before deploying)

This is a working, tested **MVP foundation**, not a production system.

1. **Data is in memory.** `src/server/store.ts` is a process-local singleton seeded from `seed.ts`.
   Data resets on restart and **will not work on multi-instance / serverless deployments**. Every function in that
   file is the seam to replace with Postgres (Drizzle or Prisma). Route handlers never touch the arrays directly.
2. **Auth is passwordless-by-email *without* verification.** `POST /api/auth/login` signs in anyone who knows an
   email. That is fine for a demo and **unsafe in production** — replace it with emailed magic links or OAuth
   (e.g. Auth.js) and remove `/api/auth/demo`.
3. **No rate limiting, abuse reporting, or moderation.** Needed before opening messaging to the public.
4. **"Verified" badges are seed data**, not a real verification process.
5. **Dashboard activity chart is illustrative** (derived from totals), not event-tracked analytics.
6. **No file uploads** (decks, logos), email notifications, or payments yet.
7. This app facilitates introductions only. If you add anything involving fundraising mechanics, get legal advice
   on securities regulation in the jurisdictions you operate in.

## Roadmap

- [ ] Postgres + Drizzle migrations; real session store
- [ ] Email magic-link auth, email notifications for matches/messages
- [ ] Pitch deck + logo uploads (S3/R2)
- [ ] Real verification flow for investors and startups
- [ ] Saved searches, investor shortlists, intro requests via mutual connections
- [ ] Playwright e2e + axe accessibility sweep (the design tokens were built to meet WCAG AA contrast)
- [ ] Rate limiting, reporting/blocking, admin console

## Environment

| Variable | Purpose |
|---|---|
| `SESSION_SECRET` | ≥32 chars. **Required in production**; the app refuses to start without it. |
| `NEXT_PUBLIC_APP_URL` | Public origin, used for metadata. |
