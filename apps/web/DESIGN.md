# Pitchfirst — Design System ("Ember")

Re-keyed from the Plinth "Counting House" system: same structure (calm warm canvas, floating white cards,
ink discipline, mono numbers, dense rows), new accent.

## Principles
- **Money and signal read instantly.** Every figure is mono + tabular.
- **Accent is for action.** Ember orange marks primary actions, the active nav item and brand. Success/positive
  state (connected, verified) is a separate green (`ok`) so brand and "good news" never get confused.
- **Density is information.** Rows ~44px, card padding 16–20, page gutter 24.

## Tokens (CSS vars in `globals.css`, mapped in `tailwind.config.ts`)
| Token | Light | Use |
|---|---|---|
| canvas / card / soft / line | `#f6f5f2` / `#fff` / `#f1efeb` / `#e8e5df` | surfaces |
| ink / body / mid | `#0f0e0c` / `#3f3d38` / `#6b6861` | text (mid clears AA 4.5:1 on all surfaces) |
| accent / accent-deep | `#ea580c` / `#b84309` | brand / AA-safe under white text |
| ok | `#0b7a55` | connected, verified, strong match |
| warn · danger · info | amber · red · blue | status chips |

Dark mode redeclares the same vars under `.dark`.

## Type
Clash Display (headings) · Satoshi (UI) · JetBrains Mono (numbers, labels). Self-hosted woff2 via `@font-face`.

## Components
`components/ui/*` — Button, Card, Badge, Input/Select/Textarea, Field/ChipSelect, Modal/Drawer, Tabs, Table,
Skeleton, StatCard, CountUp, Rise/Stagger.

## Motion
Ease `cubic-bezier(0.32,0.72,0,1)`. Hover/press 150ms; entrances 450–650ms rise+fade, 50ms stagger.
Transform/opacity only. `prefers-reduced-motion` respected globally and in Framer Motion.

## Never
Indigo/purple anything · system-font UI · pure `#000` · non-mono money · `transition: all` · icon-in-circle KPI grids.
