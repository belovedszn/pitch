import { buildSeed, type SeedData } from './seed';
import { scoreMatch } from '@/lib/matching';
import type {
  DiscoverResult, Investor, Match, MatchStatus, MatchView, Me, Message, NotificationItem, OverviewStats,
  Pitch, Role, Startup, Thread, ThreadView, User,
} from '@/lib/types';
import { MATCH_STATUSES } from '@/lib/types';
import type { InvestorProfileInput, PitchInput, StartupProfileInput } from '@/lib/schemas';

/**
 * In-memory data store behind the API routes.
 *
 * It's a process-local singleton (survives HMR via globalThis) so the whole product is
 * runnable with zero infrastructure. Every function here is the seam where a real database
 * (Postgres + Drizzle/Prisma) plugs in — route handlers never touch the arrays directly.
 */
const g = globalThis as unknown as { __pitchfirst?: SeedData };
const db: SeedData = (g.__pitchfirst ??= buildSeed());

let counter = 1000;
const nextId = (prefix: string) => `${prefix}_${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const nowIso = () => new Date().toISOString();

/* ── users ─────────────────────────────────────────────────────────── */
export const getUser = (id: string): User | undefined => db.users.find((u) => u.id === id);
export const findUserByEmail = (email: string): User | undefined =>
  db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
export const findDemoUser = (role: Role): User | undefined => db.users.find((u) => u.id === `u_${role}_demo`);

export function createUser(input: { name: string; email: string; role: Role }): User {
  const user: User = { id: nextId('u'), createdAt: nowIso(), ...input };
  db.users.push(user);
  if (input.role === 'founder') {
    db.startups.push({
      id: nextId('s'), ownerId: user.id, name: `${input.name.split(' ')[0]}'s startup`, tagline: 'Add a one-line description of what you do',
      description: 'Tell investors what you are building, who it is for, and why now. Edit this in your profile.',
      sector: 'SaaS', stage: 'Pre-seed', region: 'West Africa', city: 'Lagos', foundedYear: new Date().getFullYear(), teamSize: 1,
      raising: 250_000, mrr: 0, growthPct: 0, users: 0, website: '', verified: false,
    });
  } else {
    db.investors.push({
      id: nextId('i'), ownerId: user.id, name: input.name, firm: 'Independent', title: 'Angel investor',
      bio: 'Tell founders about your background and how you like to work with them.',
      thesis: 'Describe what you back, and what makes you a useful investor to have on the cap table.',
      stages: ['Pre-seed', 'Seed'], sectors: ['Fintech'], regions: ['West Africa'], checkMin: 25_000, checkMax: 250_000,
      portfolioCount: 0, city: 'Lagos', verified: false,
    });
  }
  return user;
}

const startupOf = (userId: string) => db.startups.find((s) => s.ownerId === userId) ?? null;
const investorOf = (userId: string) => db.investors.find((i) => i.ownerId === userId) ?? null;
const pitchOf = (startupId: string) => db.pitches.find((p) => p.startupId === startupId) ?? null;

export function getMe(userId: string): Me | null {
  const user = getUser(userId);
  if (!user) return null;
  const startup = user.role === 'founder' ? startupOf(userId) : null;
  return { user, startup, investor: user.role === 'investor' ? investorOf(userId) : null, pitch: startup ? pitchOf(startup.id) : null };
}

/* ── profiles + pitch ──────────────────────────────────────────────── */
export function updateStartup(userId: string, input: StartupProfileInput): Startup | null {
  const s = startupOf(userId);
  if (!s) return null;
  Object.assign(s, input);
  rescoreStartup(s.id);
  return s;
}

export function updateInvestor(userId: string, input: InvestorProfileInput): Investor | null {
  const i = investorOf(userId);
  if (!i) return null;
  Object.assign(i, input);
  rescoreInvestor(i.id);
  return i;
}

export function upsertPitch(userId: string, input: PitchInput): Pitch | null {
  const s = startupOf(userId);
  if (!s) return null;
  const existing = pitchOf(s.id);
  if (existing) {
    Object.assign(existing, input);
    return existing;
  }
  const pitch: Pitch = { id: nextId('p'), startupId: s.id, createdAt: nowIso(), views: 0, saves: 0, ...input };
  db.pitches.push(pitch);
  return pitch;
}

function rescoreStartup(startupId: string) {
  const s = db.startups.find((x) => x.id === startupId);
  if (!s) return;
  for (const m of db.matches.filter((x) => x.startupId === startupId)) applyScore(m, s, db.investors.find((i) => i.id === m.investorId));
}
function rescoreInvestor(investorId: string) {
  const i = db.investors.find((x) => x.id === investorId);
  if (!i) return;
  for (const m of db.matches.filter((x) => x.investorId === investorId)) applyScore(m, db.startups.find((s) => s.id === m.startupId), i);
}
function applyScore(m: Match, s?: Startup, i?: Investor) {
  if (!s || !i) return;
  const { score, reasons } = scoreMatch(s, i);
  m.score = score;
  m.reasons = reasons;
}

/* ── discovery ─────────────────────────────────────────────────────── */
export interface DiscoverFilters {
  q?: string | undefined;
  sector?: string | undefined;
  stage?: string | undefined;
  region?: string | undefined;
  sort: 'score' | 'recent';
}

const matchBetween = (startupId: string, investorId: string) =>
  db.matches.find((m) => m.startupId === startupId && m.investorId === investorId) ?? null;

export function discover(user: User, f: DiscoverFilters): DiscoverResult {
  const q = f.q?.toLowerCase();
  if (user.role === 'founder') {
    const mine = startupOf(user.id);
    const items = db.investors
      .filter((i) => i.ownerId !== user.id)
      .filter((i) => !f.sector || i.sectors.includes(f.sector as never))
      .filter((i) => !f.stage || i.stages.includes(f.stage as never))
      .filter((i) => !f.region || i.regions.includes(f.region as never))
      .filter((i) => !q || `${i.name} ${i.firm} ${i.thesis} ${i.city}`.toLowerCase().includes(q))
      .map((investor) => {
        const { score, reasons } = mine ? scoreMatch(mine, investor) : { score: 0, reasons: [] };
        const m = mine ? matchBetween(mine.id, investor.id) : null;
        return { investor, score, reasons, matchStatus: m?.status ?? null, initiatedBy: m?.initiatedBy ?? null };
      })
      .sort((a, b) => b.score - a.score || a.investor.name.localeCompare(b.investor.name));
    return { role: 'founder', items };
  }
  const me = investorOf(user.id);
  const items = db.startups
    .filter((s) => s.ownerId !== user.id)
    .filter((s) => !f.sector || s.sector === f.sector)
    .filter((s) => !f.stage || s.stage === f.stage)
    .filter((s) => !f.region || s.region === f.region)
    .filter((s) => !q || `${s.name} ${s.tagline} ${s.city} ${s.description}`.toLowerCase().includes(q))
    .map((startup) => {
      const { score, reasons } = me ? scoreMatch(startup, me) : { score: 0, reasons: [] };
      const m = me ? matchBetween(startup.id, me.id) : null;
      return { startup, pitch: pitchOf(startup.id), score, reasons, matchStatus: m?.status ?? null, initiatedBy: m?.initiatedBy ?? null };
    });
  items.sort(f.sort === 'recent' ? (a, b) => (b.pitch?.createdAt ?? '').localeCompare(a.pitch?.createdAt ?? '') : (a, b) => b.score - a.score);
  return { role: 'investor', items };
}

export function recordPitchView(startupId: string): void {
  const p = pitchOf(startupId);
  if (p) p.views += 1;
}

/* ── matches ───────────────────────────────────────────────────────── */
function matchView(m: Match): MatchView | null {
  const startup = db.startups.find((s) => s.id === m.startupId);
  const investor = db.investors.find((i) => i.id === m.investorId);
  if (!startup || !investor) return null;
  const thread = db.threads.find((t) => t.startupId === m.startupId && t.investorId === m.investorId);
  return { ...m, startup, investor, threadId: thread?.id ?? null };
}

function myMatches(user: User): Match[] {
  if (user.role === 'founder') {
    const s = startupOf(user.id);
    return s ? db.matches.filter((m) => m.startupId === s.id) : [];
  }
  const i = investorOf(user.id);
  return i ? db.matches.filter((m) => m.investorId === i.id) : [];
}

export function listMatches(user: User): MatchView[] {
  return myMatches(user)
    .map(matchView)
    .filter((m): m is MatchView => m !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function notify(userId: string, n: Omit<NotificationItem, 'id' | 'userId' | 'read' | 'createdAt'>) {
  db.notifications.unshift({ id: nextId('n'), userId, read: false, createdAt: nowIso(), ...n });
}

export type InterestResult = { ok: true; match: MatchView; mutual: boolean } | { ok: false; error: string; status: number };

/** The one "swipe right" action. Mutual interest connects both sides and opens a thread. */
export function expressInterest(user: User, targetId: string): InterestResult {
  const mine = user.role === 'founder' ? startupOf(user.id) : investorOf(user.id);
  if (!mine) return { ok: false, error: 'Complete your profile first', status: 409 };
  const startupId = user.role === 'founder' ? mine.id : targetId;
  const investorId = user.role === 'founder' ? targetId : mine.id;
  const startup = db.startups.find((s) => s.id === startupId);
  const investor = db.investors.find((i) => i.id === investorId);
  if (!startup || !investor) return { ok: false, error: 'Not found', status: 404 };

  let m = matchBetween(startupId, investorId);
  let mutual = false;
  const { score, reasons } = scoreMatch(startup, investor);
  if (!m) {
    m = { id: nextId('m'), startupId, investorId, initiatedBy: user.role, status: 'interested', score, reasons, createdAt: nowIso(), updatedAt: nowIso() };
    db.matches.push(m);
    notify(user.role === 'founder' ? investor.ownerId : startup.ownerId, {
      kind: 'match',
      title: `${user.role === 'founder' ? startup.name : investor.firm} is interested`,
      body: user.role === 'founder' ? `${startup.name} (${startup.stage}, ${startup.sector}) wants to connect.` : `${investor.name} at ${investor.firm} wants to connect.`,
    });
  } else if (m.status === 'connected') {
    return { ok: true, match: matchView(m)!, mutual: false };
  } else if (m.status === 'interested' && m.initiatedBy !== user.role) {
    m.status = 'connected';
    m.updatedAt = nowIso();
    mutual = true;
    openThread(startup, investor);
    notify(startup.ownerId, { kind: 'match', title: `You're connected with ${investor.firm}`, body: 'Messaging is unlocked — say hello.' });
    notify(investor.ownerId, { kind: 'match', title: `You're connected with ${startup.name}`, body: 'Messaging is unlocked — say hello.' });
  } else if (m.status === 'suggested' || m.status === 'passed') {
    m.status = 'interested';
    m.initiatedBy = user.role;
    m.updatedAt = nowIso();
  }
  return { ok: true, match: matchView(m)!, mutual };
}

function openThread(startup: Startup, investor: Investor): Thread {
  const existing = db.threads.find((t) => t.startupId === startup.id && t.investorId === investor.id);
  if (existing) return existing;
  const t: Thread = { id: nextId('t'), founderUserId: startup.ownerId, investorUserId: investor.ownerId, startupId: startup.id, investorId: investor.id, createdAt: nowIso() };
  db.threads.push(t);
  return t;
}

export function updateMatchStatus(user: User, matchId: string, status: MatchStatus): MatchView | null {
  const m = myMatches(user).find((x) => x.id === matchId);
  if (!m) return null;
  // Only the "pass" transition is user-driven here; connecting goes through expressInterest.
  if (status !== 'passed' && status !== 'suggested') return null;
  m.status = status;
  m.updatedAt = nowIso();
  return matchView(m);
}

/* ── messaging ─────────────────────────────────────────────────────── */
const myThreads = (user: User) =>
  db.threads.filter((t) => (user.role === 'founder' ? t.founderUserId === user.id : t.investorUserId === user.id));

export function listThreads(user: User): ThreadView[] {
  return myThreads(user)
    .map((t) => {
      const msgs = db.messages.filter((m) => m.threadId === t.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const startup = db.startups.find((s) => s.id === t.startupId);
      const investor = db.investors.find((i) => i.id === t.investorId);
      const counterpart = user.role === 'founder'
        ? { name: investor?.name ?? 'Investor', subtitle: investor?.firm ?? '' }
        : { name: startup?.name ?? 'Startup', subtitle: startup ? `${startup.stage} · ${startup.sector}` : '' };
      const last = msgs[msgs.length - 1] ?? null;
      return { id: t.id, counterpart, lastMessage: last, unread: msgs.filter((m) => m.senderId !== user.id && !readSet(user.id).has(m.id)).length };
    })
    .sort((a, b) => (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? ''));
}

const readState = new Map<string, Set<string>>();
const readSet = (userId: string) => {
  let s = readState.get(userId);
  if (!s) { s = new Set(); readState.set(userId, s); }
  return s;
};

export function getThreadMessages(user: User, threadId: string): Message[] | null {
  const t = myThreads(user).find((x) => x.id === threadId);
  if (!t) return null;
  const msgs = db.messages.filter((m) => m.threadId === threadId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const seen = readSet(user.id);
  msgs.forEach((m) => seen.add(m.id));
  return msgs;
}

export function sendMessage(user: User, threadId: string, body: string): Message | null {
  const t = myThreads(user).find((x) => x.id === threadId);
  if (!t) return null;
  const msg: Message = { id: nextId('msg'), threadId, senderId: user.id, body, createdAt: nowIso() };
  db.messages.push(msg);
  readSet(user.id).add(msg.id);
  const recipient = user.id === t.founderUserId ? t.investorUserId : t.founderUserId;
  notify(recipient, { kind: 'message', title: `New message from ${user.name}`, body: body.slice(0, 120) });
  return msg;
}

/* ── notifications + stats ─────────────────────────────────────────── */
export const listNotifications = (userId: string) => db.notifications.filter((n) => n.userId === userId);
export function markAllRead(userId: string): void {
  db.notifications.filter((n) => n.userId === userId).forEach((n) => { n.read = true; });
}

export function overview(user: User): OverviewStats {
  const ms = myMatches(user);
  const count = (s: MatchStatus) => ms.filter((m) => m.status === s).length;
  const funnel = MATCH_STATUSES.map((status) => ({ status, count: count(status) }));
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (user.role === 'founder') {
    const s = startupOf(user.id);
    const p = s ? pitchOf(s.id) : null;
    const views = p?.views ?? 0;
    return {
      role: 'founder',
      kpis: [
        { label: 'Pitch views', value: views, format: 'number', sub: p ? 'all time' : 'Publish your pitch to get seen' },
        { label: 'Saves', value: p?.saves ?? 0, format: 'number', sub: 'investors saved your pitch' },
        { label: 'Interested investors', value: count('interested'), format: 'number', sub: 'awaiting your response' },
        { label: 'Connected', value: count('connected'), format: 'number', sub: 'messaging unlocked' },
      ],
      funnel,
      // distribute totals across the week deterministically so the chart is stable between reloads
      activity: days.map((day, idx) => ({ day, views: Math.round((views / 28) * (idx + 1) * 0.8 + idx), interested: Math.round(((count('interested') + count('connected')) / 7) * ((idx % 3) + 1)) })),
    };
  }
  const avg = ms.length ? Math.round(ms.reduce((a, m) => a + m.score, 0) / ms.length) : 0;
  return {
    role: 'investor',
    kpis: [
      { label: 'In your pipeline', value: ms.filter((m) => m.status !== 'passed').length, format: 'number', sub: 'active deals' },
      { label: 'Interested', value: count('interested'), format: 'number', sub: 'awaiting a response' },
      { label: 'Connected', value: count('connected'), format: 'number', sub: 'in conversation' },
      { label: 'Avg. match score', value: avg, format: 'percent', sub: 'across your pipeline' },
    ],
    funnel,
    activity: days.map((day, idx) => ({ day, views: 6 + ((idx * 5) % 11), interested: (idx * 3) % 4 })),
  };
}
