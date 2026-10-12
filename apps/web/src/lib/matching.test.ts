import { describe, it, expect } from 'vitest';
import { scoreMatch, matchTier, WEIGHTS } from './matching';
import type { Investor, Startup } from './types';

const startup: Startup = {
  id: 's1', ownerId: 'u1', name: 'Payly', tagline: 'Payments for SMEs', description: 'x'.repeat(50),
  sector: 'Fintech', stage: 'Seed', region: 'West Africa', city: 'Lagos', foundedYear: 2024, teamSize: 8,
  raising: 1_500_000, mrr: 40_000, growthPct: 18, users: 12_000, website: 'https://payly.example', verified: true,
};

const investor: Investor = {
  id: 'i1', ownerId: 'u2', name: 'Ada', firm: 'Baobab', title: 'Partner', bio: 'x'.repeat(30), thesis: 'x'.repeat(30),
  stages: ['Seed', 'Series A'], sectors: ['Fintech', 'SaaS'], regions: ['West Africa'],
  checkMin: 250_000, checkMax: 2_000_000, portfolioCount: 30, city: 'Lagos', verified: true,
};

describe('scoreMatch', () => {
  it('gives a perfect score when every dimension fits', () => {
    const r = scoreMatch(startup, investor);
    expect(r.score).toBe(100);
    expect(r.reasons).toHaveLength(4);
  });

  it('drops only the sector weight on a sector mismatch', () => {
    const r = scoreMatch({ ...startup, sector: 'Climate' }, investor);
    expect(r.score).toBe(100 - WEIGHTS.sector);
    expect(r.reasons.some((x) => x.includes('Climate'))).toBe(false);
  });

  it('drops the stage weight on a stage mismatch', () => {
    expect(scoreMatch({ ...startup, stage: 'Pre-seed' }, investor).score).toBe(100 - WEIGHTS.stage);
  });

  it('fails the cheque test when the investor writes cheques too small', () => {
    const small = { ...investor, checkMin: 5_000, checkMax: 20_000 };
    expect(scoreMatch(startup, small).score).toBe(100 - WEIGHTS.check);
  });

  it('fails the cheque test when the minimum exceeds the round', () => {
    const big = { ...investor, checkMin: 5_000_000, checkMax: 10_000_000 };
    expect(scoreMatch(startup, big).score).toBe(100 - WEIGHTS.check);
  });

  it('scores 0 with nothing in common', () => {
    const none: Investor = { ...investor, sectors: ['Edtech'], stages: ['Series B+'], regions: ['Asia'], checkMin: 10_000_000, checkMax: 20_000_000 };
    expect(scoreMatch(startup, none)).toEqual({ score: 0, reasons: [] });
  });
});

describe('matchTier', () => {
  it('buckets scores', () => {
    expect(matchTier(100)).toBe('strong');
    expect(matchTier(80)).toBe('strong');
    expect(matchTier(65)).toBe('good');
    expect(matchTier(30)).toBe('weak');
  });
});
