import type { Investor, Match, Message, NotificationItem, Pitch, Startup, Thread, User } from '@/lib/types';
import { scoreMatch } from '@/lib/matching';

/**
 * Seed data for the in-memory store. Everything is relative to "now" so the UI always
 * looks alive. Swap `server/store.ts` for a real database (see README → "Going to production").
 */
export interface SeedData {
  users: User[];
  startups: Startup[];
  investors: Investor[];
  pitches: Pitch[];
  matches: Match[];
  threads: Thread[];
  messages: Message[];
  notifications: NotificationItem[];
}

export const DEMO_FOUNDER_EMAIL = 'founder@demo.pitchfirst.app';
export const DEMO_INVESTOR_EMAIL = 'investor@demo.pitchfirst.app';

export function buildSeed(now = Date.now()): SeedData {
  const ago = (days: number, hours = 0) => new Date(now - days * 86_400_000 - hours * 3_600_000).toISOString();

  const users: User[] = [
    { id: 'u_founder_demo', role: 'founder', name: 'Adaeze Okonkwo', email: DEMO_FOUNDER_EMAIL, createdAt: ago(60) },
    { id: 'u_investor_demo', role: 'investor', name: 'Tolu Bakare', email: DEMO_INVESTOR_EMAIL, createdAt: ago(80) },
  ];

  const startupDefs: Omit<Startup, 'ownerId'>[] = [
    { id: 's_demo', name: 'Kolo Pay', tagline: 'Payroll and instant wage access for African SMEs', description: 'Kolo Pay lets small businesses run payroll in minutes and lets employees access earned wages on demand. We settle over local rails in Nigeria and Ghana, with Kenya launching next quarter.', sector: 'Fintech', stage: 'Seed', region: 'West Africa', city: 'Lagos', foundedYear: 2024, teamSize: 11, raising: 1_500_000, mrr: 46_000, growthPct: 19, users: 14_200, website: 'https://kolopay.example', verified: true },
    { id: 's_2', name: 'Savanna Health', tagline: 'Last-mile diagnostics for rural clinics', description: 'Low-cost point-of-care diagnostic kits plus a clinician app that routes results to specialists. Deployed across 140 clinics in Kenya and Uganda.', sector: 'Healthtech', stage: 'Series A', region: 'East Africa', city: 'Nairobi', foundedYear: 2022, teamSize: 34, raising: 6_000_000, mrr: 210_000, growthPct: 11, users: 140, website: 'https://savannahealth.example', verified: true },
    { id: 's_3', name: 'Ledgerly', tagline: 'AI bookkeeping that closes the month for you', description: 'Connects to bank feeds and mobile-money statements, categorises transactions with an LLM pipeline, and produces audit-ready books for accountants serving SMEs.', sector: 'AI / ML', stage: 'Pre-seed', region: 'West Africa', city: 'Accra', foundedYear: 2025, teamSize: 5, raising: 500_000, mrr: 9_000, growthPct: 27, users: 800, website: 'https://ledgerly.example', verified: false },
    { id: 's_4', name: 'Greenfield', tagline: 'Pay-as-you-go solar for smallholder farms', description: 'Solar-powered irrigation leased per season, financed by offtake agreements with processors. 2,100 farms live, default rate under 3%.', sector: 'Agritech', stage: 'Seed', region: 'East Africa', city: 'Kigali', foundedYear: 2023, teamSize: 19, raising: 2_500_000, mrr: 88_000, growthPct: 14, users: 2_100, website: 'https://greenfield.example', verified: true },
    { id: 's_5', name: 'Haulr', tagline: 'Freight marketplace for cross-border trucking', description: 'Matches shippers with verified truckers across ECOWAS corridors, with escrowed payments and live tracking that cuts border dwell times by a third.', sector: 'Logistics', stage: 'Seed', region: 'West Africa', city: 'Lagos', foundedYear: 2023, teamSize: 16, raising: 2_000_000, mrr: 64_000, growthPct: 16, users: 3_400, website: 'https://haulr.example', verified: true },
    { id: 's_6', name: 'Nile Learn', tagline: 'Adaptive maths tutoring in Arabic and English', description: 'A phone-first tutor that adapts to each student and syncs with school curricula in Egypt and Morocco. 90k monthly active learners.', sector: 'Edtech', stage: 'Series A', region: 'North Africa', city: 'Cairo', foundedYear: 2021, teamSize: 42, raising: 5_000_000, mrr: 150_000, growthPct: 9, users: 90_000, website: 'https://nilelearn.example', verified: true },
    { id: 's_7', name: 'Cartwheel', tagline: 'Headless commerce for social sellers', description: 'Turns Instagram and WhatsApp catalogues into checkout-ready storefronts with inventory, delivery and payments built in.', sector: 'E-commerce', stage: 'Pre-seed', region: 'West Africa', city: 'Lagos', foundedYear: 2025, teamSize: 6, raising: 750_000, mrr: 14_000, growthPct: 31, users: 5_600, website: 'https://cartwheel.example', verified: false },
    { id: 's_8', name: 'Carbonbase', tagline: 'MRV software for African carbon projects', description: 'Satellite and sensor-based monitoring, reporting and verification that cuts credit issuance time from 18 months to 6.', sector: 'Climate', stage: 'Seed', region: 'Southern Africa', city: 'Cape Town', foundedYear: 2023, teamSize: 14, raising: 3_000_000, mrr: 52_000, growthPct: 12, users: 60, website: 'https://carbonbase.example', verified: true },
    { id: 's_9', name: 'Stackwise', tagline: 'Dev tooling for teams shipping to emerging markets', description: 'SDKs and observability for low-bandwidth, low-end-device conditions, used by 400 mobile teams.', sector: 'SaaS', stage: 'Seed', region: 'Europe', city: 'London', foundedYear: 2023, teamSize: 12, raising: 2_200_000, mrr: 71_000, growthPct: 13, users: 400, website: 'https://stackwise.example', verified: true },
    { id: 's_10', name: 'Mamas Table', tagline: 'Meal subscriptions from home cooks', description: 'Neighbourhood cooks sell weekly meal plans through our app; we handle logistics, hygiene audits and payouts.', sector: 'Consumer', stage: 'Pre-seed', region: 'West Africa', city: 'Abuja', foundedYear: 2025, teamSize: 7, raising: 400_000, mrr: 11_000, growthPct: 22, users: 2_900, website: 'https://mamastable.example', verified: false },
  ];

  // each non-demo startup gets its own founder user
  const startups: Startup[] = startupDefs.map((s) => {
    if (s.id === 's_demo') return { ...s, ownerId: 'u_founder_demo' };
    const ownerId = `u_f_${s.id}`;
    users.push({ id: ownerId, role: 'founder', name: `${s.name} Founder`, email: `founder+${s.id}@seed.pitchfirst.app`, createdAt: ago(40) });
    return { ...s, ownerId };
  });

  const investorDefs: Omit<Investor, 'ownerId'>[] = [
    { id: 'i_demo', name: 'Tolu Bakare', firm: 'Baobab Capital', title: 'General Partner', bio: 'Former operator at two African payments unicorns. Writes first cheques into fintech and AI infrastructure.', thesis: 'We back technical founders building financial and AI infrastructure for African SMEs, usually before the market sees it.', stages: ['Pre-seed', 'Seed'], sectors: ['Fintech', 'AI / ML', 'SaaS'], regions: ['West Africa', 'East Africa'], checkMin: 150_000, checkMax: 1_500_000, portfolioCount: 38, city: 'Lagos', verified: true },
    { id: 'i_2', name: 'Wanjiru Kamau', firm: 'Rift Ventures', title: 'Partner', bio: 'Healthtech and agritech specialist with a decade in development finance.', thesis: 'Climate-resilient food systems and primary care that reaches people where they are.', stages: ['Seed', 'Series A'], sectors: ['Healthtech', 'Agritech', 'Climate'], regions: ['East Africa', 'Southern Africa'], checkMin: 500_000, checkMax: 4_000_000, portfolioCount: 27, city: 'Nairobi', verified: true },
    { id: 'i_3', name: 'Yusuf Demir', firm: 'Bosphorus Growth', title: 'Principal', bio: 'Growth investor covering MENA and Africa marketplaces.', thesis: 'Marketplaces and logistics with proven unit economics and defensible supply.', stages: ['Seed', 'Series A', 'Series B+'], sectors: ['Logistics', 'E-commerce', 'Fintech'], regions: ['North Africa', 'West Africa', 'Europe'], checkMin: 1_000_000, checkMax: 8_000_000, portfolioCount: 19, city: 'Istanbul', verified: true },
    { id: 'i_4', name: 'Chiamaka Eze', firm: 'Okra Angels', title: 'Angel Syndicate Lead', bio: 'Runs a 140-member angel syndicate across the diaspora.', thesis: 'Day-one cheques for founders solving everyday problems for African consumers.', stages: ['Pre-seed'], sectors: ['Consumer', 'E-commerce', 'Edtech', 'Fintech'], regions: ['West Africa'], checkMin: 25_000, checkMax: 250_000, portfolioCount: 61, city: 'London', verified: false },
    { id: 'i_5', name: 'Sipho Dlamini', firm: 'Kalahari Climate Fund', title: 'Managing Director', bio: 'Climate-tech investor and former carbon-markets regulator.', thesis: 'Measurement, verification and financing rails for climate projects across Southern and East Africa.', stages: ['Seed', 'Series A'], sectors: ['Climate', 'Agritech'], regions: ['Southern Africa', 'East Africa'], checkMin: 1_000_000, checkMax: 6_000_000, portfolioCount: 14, city: 'Johannesburg', verified: true },
    { id: 'i_6', name: 'Rachel Okoye', firm: 'Lagos Lane', title: 'Partner', bio: 'Early-stage generalist, ex-product at a global marketplace.', thesis: 'Product-led startups with unusual distribution; we love fast shippers.', stages: ['Pre-seed', 'Seed'], sectors: ['SaaS', 'E-commerce', 'Consumer', 'AI / ML'], regions: ['West Africa'], checkMin: 100_000, checkMax: 1_000_000, portfolioCount: 33, city: 'Lagos', verified: true },
    { id: 'i_7', name: 'Hannah Weiss', firm: 'Northwind', title: 'Partner', bio: 'US-based investor focused on emerging-market software.', thesis: 'Infrastructure software and fintech serving billions of underserved users.', stages: ['Seed', 'Series A'], sectors: ['SaaS', 'Fintech', 'AI / ML'], regions: ['North America', 'West Africa', 'East Africa', 'Europe'], checkMin: 1_000_000, checkMax: 5_000_000, portfolioCount: 22, city: 'San Francisco', verified: true },
    { id: 'i_8', name: 'Omar Farouk', firm: 'Delta Education Partners', title: 'Investment Director', bio: 'Edtech investor with operating experience in Egypt.', thesis: 'Learning products that improve outcomes measurably, with strong institutional distribution.', stages: ['Seed', 'Series A', 'Series B+'], sectors: ['Edtech', 'Consumer'], regions: ['North Africa', 'East Africa'], checkMin: 750_000, checkMax: 7_000_000, portfolioCount: 17, city: 'Cairo', verified: true },
  ];

  const investors: Investor[] = investorDefs.map((i) => {
    if (i.id === 'i_demo') return { ...i, ownerId: 'u_investor_demo' };
    const ownerId = `u_i_${i.id}`;
    users.push({ id: ownerId, role: 'investor', name: i.name, email: `investor+${i.id}@seed.pitchfirst.app`, createdAt: ago(70) });
    return { ...i, ownerId };
  });

  const pitchCopy: Record<string, Omit<Pitch, 'id' | 'startupId' | 'createdAt' | 'views' | 'saves'>> = {
    s_demo: { headline: 'Payday, every day — payroll that pays workers when they earn', problem: 'Nigerian SMEs run payroll on spreadsheets and bank bulk uploads; workers wait up to 30 days and borrow at 20% a month to bridge it.', solution: 'Kolo Pay automates payroll and lets employees withdraw earned wages instantly, funded from our float — employers pay nothing extra.', traction: '₦-denominated GMV of $4.1M/mo, 46K MRR, 19% MoM, 180 paying employers, <1% wage-advance loss rate.', ask: 'Raising $1.5M seed to scale float and launch in Kenya. $600K already committed.' },
    s_2: { headline: 'A lab in every clinic bag', problem: 'Rural clinics lack diagnostics, so patients travel days for a test or go untreated.', solution: 'Low-cost kits and a clinician app that routes results to remote specialists in minutes.', traction: '140 clinics, 210K MRR, 11% MoM, 3 ministry partnerships.', ask: 'Raising $6M Series A to enter Tanzania and Ethiopia.' },
    s_3: { headline: 'Close the month in a day, not a week', problem: 'Accountants spend 60% of their time categorising transactions for SMEs.', solution: 'An LLM pipeline reads bank and mobile-money data and produces audit-ready books.', traction: '800 businesses, 9K MRR, 27% MoM, 94% auto-categorisation accuracy.', ask: 'Raising a $500K pre-seed to hire two ML engineers.' },
    s_4: { headline: 'Irrigation as a service for smallholders', problem: 'Farmers lose a third of yields to unreliable water and cannot afford the capex.', solution: 'We lease solar pumps per season, repaid from harvest via processor offtake.', traction: '2,100 farms, 88K MRR, <3% default.', ask: 'Raising $2.5M seed to finance 5,000 more units.' },
    s_5: { headline: 'The shortest path across a border', problem: 'Cross-border trucking is fragmented, opaque and slow.', solution: 'A verified marketplace with escrow and live tracking.', traction: '3,400 truckers, 64K MRR, 16% MoM.', ask: 'Raising $2M seed to expand to 4 more corridors.' },
  };

  const pitches: Pitch[] = startups
    .filter((s) => pitchCopy[s.id])
    .map((s, idx) => ({
      id: `p_${s.id}`,
      startupId: s.id,
      ...pitchCopy[s.id]!,
      createdAt: ago(10 + idx),
      views: 120 + idx * 47,
      saves: 9 + idx * 4,
    }));

  const matches: Match[] = [];
  const addMatch = (startupId: string, investorId: string, status: Match['status'], initiatedBy: Match['initiatedBy'], daysAgo: number) => {
    const s = startups.find((x) => x.id === startupId)!;
    const i = investors.find((x) => x.id === investorId)!;
    const { score, reasons } = scoreMatch(s, i);
    matches.push({ id: `m_${startupId}_${investorId}`, startupId, investorId, initiatedBy, status, score, reasons, createdAt: ago(daysAgo), updatedAt: ago(Math.max(daysAgo - 1, 0)) });
  };
  // demo founder (s_demo) pipeline
  addMatch('s_demo', 'i_demo', 'connected', 'investor', 6);
  addMatch('s_demo', 'i_6', 'interested', 'founder', 3);
  addMatch('s_demo', 'i_7', 'interested', 'investor', 2);
  addMatch('s_demo', 'i_4', 'suggested', 'system', 1);
  addMatch('s_demo', 'i_3', 'passed', 'investor', 12);
  // demo investor (i_demo) pipeline
  addMatch('s_3', 'i_demo', 'interested', 'investor', 4);
  addMatch('s_7', 'i_demo', 'interested', 'founder', 2);
  addMatch('s_5', 'i_demo', 'suggested', 'system', 1);
  addMatch('s_10', 'i_demo', 'passed', 'investor', 9);

  const threads: Thread[] = [
    { id: 't_1', founderUserId: 'u_founder_demo', investorUserId: 'u_investor_demo', startupId: 's_demo', investorId: 'i_demo', createdAt: ago(5) },
  ];
  const messages: Message[] = [
    { id: 'msg_1', threadId: 't_1', senderId: 'u_investor_demo', body: 'Loved the pitch — the wage-access loss rate is impressive. Could you share how you underwrite the float?', createdAt: ago(5, 2) },
    { id: 'msg_2', threadId: 't_1', senderId: 'u_founder_demo', body: 'Thanks Tolu! We cap advances at 40% of accrued pay and the employer guarantees repayment through payroll deduction. Happy to walk through the model on a call this week.', createdAt: ago(4, 20) },
    { id: 'msg_3', threadId: 't_1', senderId: 'u_investor_demo', body: 'Perfect. Does Thursday 3pm WAT work?', createdAt: ago(0, 3) },
  ];

  const notifications: NotificationItem[] = [
    { id: 'n_1', userId: 'u_founder_demo', kind: 'match', title: 'Northwind is interested', body: 'Hannah Weiss at Northwind wants to connect. Express interest back to unlock messaging.', read: false, createdAt: ago(2) },
    { id: 'n_2', userId: 'u_founder_demo', kind: 'message', title: 'New message from Tolu Bakare', body: 'Perfect. Does Thursday 3pm WAT work?', read: false, createdAt: ago(0, 3) },
    { id: 'n_3', userId: 'u_founder_demo', kind: 'view', title: 'Your pitch was viewed 24 times', body: 'Investors in fintech viewed Kolo Pay this week.', read: true, createdAt: ago(3) },
    { id: 'n_4', userId: 'u_investor_demo', kind: 'match', title: 'Cartwheel wants to connect', body: 'Cartwheel (Pre-seed, E-commerce) expressed interest in Baobab Capital.', read: false, createdAt: ago(2) },
    { id: 'n_5', userId: 'u_investor_demo', kind: 'match', title: '3 new startups match your thesis', body: 'Haulr, Ledgerly and Cartwheel fit your sector and stage.', read: true, createdAt: ago(1) },
  ];

  return { users, startups, investors, pitches, matches, threads, messages, notifications };
}
