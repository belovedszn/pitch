# Architecture

```
Browser ──▶ middleware (JWT verify) ──▶ /dashboard pages (client components + TanStack Query)
                                        │
                                        ▼
                               /api/* route handlers
                                        │  zod parse → currentUser() → authorize
                                        ▼
                               server/store.ts  (in-memory today, DB tomorrow)
                                        ▲
                               lib/matching.ts  (pure scoring, unit-tested)
```

## Principles
- **Validate once, share everywhere.** `lib/schemas.ts` is imported by both forms and route handlers.
- **Route handlers stay thin:** parse → authorize → call a store function → serialise.
- **Pure core.** Scoring is a pure function of (startup, investor); the store applies it.
- **Authorization lives next to data access.** Store functions take the acting `User` and refuse to touch rows
  that user doesn't own (matches, threads, messages).

## Swapping in a database
Replace the arrays in `server/store.ts` with queries, keeping function signatures. Suggested tables:
`users, startups, investors, pitches, matches(startup_id, investor_id UNIQUE), threads, messages, notifications`.
The `(startup_id, investor_id)` pair must be unique; `expressInterest` should run in a transaction.
