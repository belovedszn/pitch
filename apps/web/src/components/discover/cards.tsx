'use client';
import { MapPin, BadgeCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScoreMeter } from './score';
import { InterestButton } from './interest-button';
import { formatRange, formatUsd, initials } from '@/lib/utils';
import type { ScoredInvestor, ScoredStartup } from '@/lib/types';

function Avatar({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-tint font-display text-[13px] font-semibold text-accent-deep" aria-hidden="true">
      {initials(name)}
    </div>
  );
}

export function StartupCard({ item, onOpen }: { item: ScoredStartup; onOpen: () => void }) {
  const { startup: s, pitch, score, reasons, matchStatus, initiatedBy } = item;
  return (
    <Card className="flex flex-col p-4 transition-shadow duration-150 hover:shadow-pop">
      <div className="flex items-start gap-3">
        <Avatar name={s.name} />
        <div className="min-w-0 flex-1">
          <button onClick={onOpen} className="flex max-w-full items-center gap-1 text-left font-display text-[16px] font-semibold tracking-tight text-ink hover:underline">
            <span className="truncate">{s.name}</span>
            {s.verified && <BadgeCheck size={15} className="shrink-0 text-ok" aria-label="Verified" />}
          </button>
          <p className="flex items-center gap-1 text-xs text-mid"><MapPin size={11} />{s.city} · {s.stage}</p>
        </div>
        <ScoreMeter score={score} />
      </div>
      <p className="mt-3 text-[13.5px] text-body">{pitch?.headline ?? s.tagline}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge status="sector" tone="neutral" label={s.sector} />
        <Badge status="raising" tone="accent" label={`Raising ${formatUsd(s.raising)}`} />
        {s.mrr > 0 && <Badge status="mrr" tone="neutral" label={`${formatUsd(s.mrr)} MRR`} />}
      </div>
      {reasons.length > 0 && <p className="mt-3 text-xs text-mid">Why: {reasons.slice(0, 2).join(' · ')}</p>}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
        <button onClick={onOpen} className="text-[13px] text-mid hover:text-ink">View pitch</button>
        {matchStatus === 'passed' ? <Badge status="passed" /> : <InterestButton targetId={s.id} status={matchStatus} initiatedBy={initiatedBy} />}
      </div>
    </Card>
  );
}

export function InvestorCard({ item, onOpen }: { item: ScoredInvestor; onOpen: () => void }) {
  const { investor: i, score, reasons, matchStatus, initiatedBy } = item;
  return (
    <Card className="flex flex-col p-4 transition-shadow duration-150 hover:shadow-pop">
      <div className="flex items-start gap-3">
        <Avatar name={i.name} />
        <div className="min-w-0 flex-1">
          <button onClick={onOpen} className="flex max-w-full items-center gap-1 text-left font-display text-[16px] font-semibold tracking-tight text-ink hover:underline">
            <span className="truncate">{i.name}</span>
            {i.verified && <BadgeCheck size={15} className="shrink-0 text-ok" aria-label="Verified" />}
          </button>
          <p className="truncate text-xs text-mid">{i.title}, {i.firm}</p>
        </div>
        <ScoreMeter score={score} />
      </div>
      <p className="mt-3 line-clamp-2 text-[13.5px] text-body">{i.thesis}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {i.sectors.slice(0, 3).map((x) => <Badge key={x} status={x} tone="neutral" label={x} />)}
        <Badge status="cheque" tone="accent" label={formatRange(i.checkMin, i.checkMax)} />
      </div>
      {reasons.length > 0 && <p className="mt-3 text-xs text-mid">Why: {reasons.slice(0, 2).join(' · ')}</p>}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
        <button onClick={onOpen} className="text-[13px] text-mid hover:text-ink">View profile</button>
        {matchStatus === 'passed' ? <Badge status="passed" /> : <InterestButton targetId={i.id} status={matchStatus} initiatedBy={initiatedBy} />}
      </div>
    </Card>
  );
}
