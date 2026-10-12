import { describe, it, expect } from 'vitest';
import { createUser, discover, expressInterest, getMe, listMatches, listThreads, sendMessage, updateMatchStatus } from './store';

// The store is a process-wide singleton seeded at import; each test creates its own users so tests don't interact.
const uniq = () => Math.random().toString(36).slice(2, 8);
const mkFounder = () => createUser({ name: 'Test Founder', email: `f-${uniq()}@t.test`, role: 'founder' });
const mkInvestor = () => createUser({ name: 'Test Investor', email: `i-${uniq()}@t.test`, role: 'investor' });

describe('createUser', () => {
  it('provisions a blank startup for founders and investor profile for investors', () => {
    const f = mkFounder();
    const i = mkInvestor();
    expect(getMe(f.id)?.startup).not.toBeNull();
    expect(getMe(f.id)?.investor).toBeNull();
    expect(getMe(i.id)?.investor).not.toBeNull();
    expect(getMe(i.id)?.startup).toBeNull();
  });
});

describe('expressInterest', () => {
  it('first interest is one-sided and opens no thread', () => {
    const f = mkFounder();
    const i = mkInvestor();
    const r = expressInterest(f, getMe(i.id)!.investor!.id);
    expect(r.ok && r.match.status).toBe('interested');
    expect(r.ok && r.mutual).toBe(false);
    expect(r.ok && r.match.initiatedBy).toBe('founder');
    expect(listThreads(f)).toHaveLength(0);
  });

  it('is idempotent for the person who already expressed interest', () => {
    const f = mkFounder();
    const i = mkInvestor();
    const target = getMe(i.id)!.investor!.id;
    expressInterest(f, target);
    const again = expressInterest(f, target);
    expect(again.ok && again.match.status).toBe('interested');
    expect(listMatches(f)).toHaveLength(1);
  });

  it('mutual interest connects both sides and opens a shared thread', () => {
    const f = mkFounder();
    const i = mkInvestor();
    expressInterest(f, getMe(i.id)!.investor!.id);
    const r = expressInterest(i, getMe(f.id)!.startup!.id);
    expect(r.ok && r.mutual).toBe(true);
    expect(r.ok && r.match.status).toBe('connected');
    expect(listThreads(f)).toHaveLength(1);
    expect(listThreads(i)).toHaveLength(1);
  });

  it('404s for unknown targets', () => {
    const f = mkFounder();
    const r = expressInterest(f, 'i_does_not_exist');
    expect(r.ok).toBe(false);
    expect(!r.ok && r.status).toBe(404);
  });
});

describe('updateMatchStatus', () => {
  it('lets a user pass, but never force a connection', () => {
    const f = mkFounder();
    const i = mkInvestor();
    const r = expressInterest(f, getMe(i.id)!.investor!.id);
    const id = r.ok ? r.match.id : '';
    expect(updateMatchStatus(f, id, 'connected')).toBeNull();
    expect(updateMatchStatus(f, id, 'passed')?.status).toBe('passed');
  });

  it("does not let someone else's match be modified", () => {
    const f = mkFounder();
    const i = mkInvestor();
    const stranger = mkFounder();
    const r = expressInterest(f, getMe(i.id)!.investor!.id);
    expect(updateMatchStatus(stranger, r.ok ? r.match.id : '', 'passed')).toBeNull();
  });
});

describe('messaging', () => {
  it('only thread participants can send', () => {
    const f = mkFounder();
    const i = mkInvestor();
    const outsider = mkInvestor();
    expressInterest(f, getMe(i.id)!.investor!.id);
    expressInterest(i, getMe(f.id)!.startup!.id);
    const threadId = listThreads(f)[0]!.id;
    expect(sendMessage(f, threadId, 'hi')?.body).toBe('hi');
    expect(sendMessage(outsider, threadId, 'let me in')).toBeNull();
  });
});

describe('discover', () => {
  it('excludes yourself and ranks by score descending', () => {
    const f = mkFounder();
    const res = discover(f, { sort: 'score' });
    expect(res.role).toBe('founder');
    const scores = res.items.map((x) => x.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });
});
