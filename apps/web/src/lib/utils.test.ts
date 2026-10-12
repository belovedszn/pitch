import { describe, it, expect } from 'vitest';
import { formatUsd, formatRange, formatRelativeDate, initials, pluralize } from './utils';

describe('formatUsd', () => {
  it('formats millions, thousands and small numbers', () => {
    expect(formatUsd(1_500_000)).toBe('$1.5M');
    expect(formatUsd(2_000_000)).toBe('$2M');
    expect(formatUsd(450_000)).toBe('$450K');
    expect(formatUsd(900)).toBe('$900');
  });
  it('formats ranges', () => {
    expect(formatRange(100_000, 500_000)).toBe('$100K – $500K');
  });
});

describe('formatRelativeDate', () => {
  const now = new Date('2026-10-12T12:00:00Z');
  it('handles minutes, hours and days', () => {
    expect(formatRelativeDate('2026-10-12T11:59:40Z', now)).toBe('Just now');
    expect(formatRelativeDate('2026-10-12T11:30:00Z', now)).toBe('30m ago');
    expect(formatRelativeDate('2026-10-12T07:00:00Z', now)).toBe('5h ago');
    expect(formatRelativeDate('2026-10-11T11:00:00Z', now)).toBe('Yesterday');
    expect(formatRelativeDate('2026-10-09T12:00:00Z', now)).toBe('3d ago');
  });
});

describe('misc', () => {
  it('initials', () => expect(initials('Ada Obi Nwosu')).toBe('AO'));
  it('pluralize', () => {
    expect(pluralize(1, 'match', 'matches')).toBe('1 match');
    expect(pluralize(3, 'match', 'matches')).toBe('3 matches');
  });
});
