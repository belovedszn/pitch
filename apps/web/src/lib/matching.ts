import type { Investor, Startup } from './types';
import { formatRange, formatUsd } from './utils';

export interface MatchScore {
  /** 0–100 */
  score: number;
  /** Human-readable reasons, strongest first. */
  reasons: string[];
}

export const WEIGHTS = { sector: 35, stage: 30, check: 20, region: 15 } as const;

/**
 * How well does this startup fit this investor's mandate?
 *
 * Deterministic and explainable on purpose: both sides see *why* they were matched,
 * which matters more for trust than a black-box ranking.
 */
export function scoreMatch(startup: Startup, investor: Investor): MatchScore {
  let score = 0;
  const reasons: string[] = [];

  if (investor.sectors.includes(startup.sector)) {
    score += WEIGHTS.sector;
    reasons.push(`Invests in ${startup.sector}`);
  }

  if (investor.stages.includes(startup.stage)) {
    score += WEIGHTS.stage;
    reasons.push(`Backs ${startup.stage} companies`);
  }

  // A lead/co-investor typically writes between ~5% and 100% of the round.
  const fitsCheck = investor.checkMin <= startup.raising && investor.checkMax >= startup.raising * 0.05;
  if (fitsCheck) {
    score += WEIGHTS.check;
    reasons.push(`Cheque size ${formatRange(investor.checkMin, investor.checkMax)} fits a ${formatUsd(startup.raising)} round`);
  }

  if (investor.regions.includes(startup.region)) {
    score += WEIGHTS.region;
    reasons.push(`Active in ${startup.region}`);
  }

  return { score, reasons };
}

export function matchTier(score: number): 'strong' | 'good' | 'weak' {
  if (score >= 80) return 'strong';
  if (score >= 55) return 'good';
  return 'weak';
}
