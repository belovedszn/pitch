export type Role = 'founder' | 'investor';

export const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B+'] as const;
export type Stage = (typeof STAGES)[number];

export const SECTORS = [
  'Fintech',
  'Healthtech',
  'AI / ML',
  'SaaS',
  'Climate',
  'Logistics',
  'E-commerce',
  'Edtech',
  'Agritech',
  'Consumer',
] as const;
export type Sector = (typeof SECTORS)[number];

export const REGIONS = ['West Africa', 'East Africa', 'North Africa', 'Southern Africa', 'Europe', 'North America', 'Asia'] as const;
export type Region = (typeof REGIONS)[number];

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  createdAt: string;
}

export interface Startup {
  id: string;
  ownerId: string;
  name: string;
  tagline: string;
  description: string;
  sector: Sector;
  stage: Stage;
  region: Region;
  city: string;
  foundedYear: number;
  teamSize: number;
  /** Amount being raised, USD */
  raising: number;
  /** Monthly recurring revenue, USD */
  mrr: number;
  /** Month-over-month growth, percent */
  growthPct: number;
  users: number;
  website: string;
  verified: boolean;
}

export interface Investor {
  id: string;
  ownerId: string;
  name: string;
  firm: string;
  title: string;
  bio: string;
  thesis: string;
  stages: Stage[];
  sectors: Sector[];
  regions: Region[];
  checkMin: number;
  checkMax: number;
  portfolioCount: number;
  city: string;
  verified: boolean;
}

/** A startup's "first pitch": the 60-second version investors see before anything else. */
export interface Pitch {
  id: string;
  startupId: string;
  headline: string;
  problem: string;
  solution: string;
  traction: string;
  ask: string;
  createdAt: string;
  views: number;
  saves: number;
}

export const MATCH_STATUSES = ['suggested', 'interested', 'connected', 'passed'] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export interface Match {
  id: string;
  startupId: string;
  investorId: string;
  /** who made the first move */
  initiatedBy: Role | 'system';
  status: MatchStatus;
  score: number;
  reasons: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface Thread {
  id: string;
  founderUserId: string;
  investorUserId: string;
  startupId: string;
  investorId: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  kind: 'match' | 'message' | 'view';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

/* ── View models returned by the API ─────────────────────────────────── */
export interface ScoredStartup {
  startup: Startup;
  pitch: Pitch | null;
  score: number;
  reasons: string[];
  matchStatus: MatchStatus | null;
  /** who made the first move on this match, if any */
  initiatedBy: Role | 'system' | null;
}
export interface ScoredInvestor {
  investor: Investor;
  score: number;
  reasons: string[];
  matchStatus: MatchStatus | null;
  initiatedBy: Role | 'system' | null;
}
export type DiscoverResult =
  | { role: 'founder'; items: ScoredInvestor[] }
  | { role: 'investor'; items: ScoredStartup[] };

export interface MatchView extends Match {
  startup: Startup;
  investor: Investor;
  threadId: string | null;
}

export interface ThreadView {
  id: string;
  counterpart: { name: string; subtitle: string };
  lastMessage: Message | null;
  unread: number;
}

export interface Me {
  user: User;
  startup: Startup | null;
  investor: Investor | null;
  pitch: Pitch | null;
}

export interface OverviewStats {
  role: Role;
  kpis: { label: string; value: number; format: 'number' | 'percent'; sub?: string }[];
  funnel: { status: MatchStatus; count: number }[];
  activity: { day: string; views: number; interested: number }[];
}
