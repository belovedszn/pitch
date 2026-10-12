'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Drawer } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { ScoreMeter } from './score';
import { InterestButton } from './interest-button';
import { api } from '@/lib/api';
import { formatRange, formatUsd } from '@/lib/utils';
import type { ScoredInvestor, ScoredStartup } from '@/lib/types';

export type DetailTarget = { kind: 'startup'; item: ScoredStartup } | { kind: 'investor'; item: ScoredInvestor } | null;

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-soft/70 px-3 py-2">
    <p className="label-mono text-[10px] text-mid">{label}</p>
    <p className="mt-0.5 font-mono text-[14px] font-medium text-ink">{value}</p>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-5">
    <h3 className="label-mono text-mid">{title}</h3>
    <div className="mt-1.5 text-[13.5px] leading-relaxed text-body">{children}</div>
  </section>
);

export function DetailDrawer({ target, onClose }: { target: DetailTarget; onClose: () => void }) {
  const startupId = target?.kind === 'startup' ? target.item.startup.id : null;
  // investors opening a pitch counts as a view
  useEffect(() => { if (startupId) void api.recordView(startupId).catch(() => undefined); }, [startupId]);

  return (
    <Drawer open={!!target} onClose={onClose}>
      {target && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {target.kind === 'startup' ? (
                <>
                  <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">{target.item.startup.name}</h2>
                  <p className="mt-1 text-sm text-mid">{target.item.startup.tagline}</p>
                </>
              ) : (
                <>
                  <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">{target.item.investor.name}</h2>
                  <p className="mt-1 text-sm text-mid">{target.item.investor.title}, {target.item.investor.firm}</p>
                </>
              )}
            </div>
            <button onClick={onClose} aria-label="Close" className="shrink-0 rounded-md p-1 text-faint hover:text-ink"><X size={18} /></button>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-line p-3">
            <div>
              <p className="label-mono text-mid">Match</p>
              <ScoreMeter score={target.item.score} className="mt-1" />
            </div>
            <InterestButton
              size="md"
              targetId={target.kind === 'startup' ? target.item.startup.id : target.item.investor.id}
              status={target.item.matchStatus}
              initiatedBy={target.item.initiatedBy}
            />
          </div>
          {target.item.reasons.length > 0 && (
            <ul className="mt-3 space-y-1 text-[13px] text-body">
              {target.item.reasons.map((r) => <li key={r} className="flex gap-2"><span className="text-ok">✓</span>{r}</li>)}
            </ul>
          )}

          {target.kind === 'startup' ? (
            <>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Stat label="Raising" value={formatUsd(target.item.startup.raising)} />
                <Stat label="MRR" value={formatUsd(target.item.startup.mrr)} />
                <Stat label="MoM growth" value={`${target.item.startup.growthPct}%`} />
                <Stat label="Users" value={target.item.startup.users.toLocaleString()} />
                <Stat label="Team" value={String(target.item.startup.teamSize)} />
                <Stat label="Founded" value={String(target.item.startup.foundedYear)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge status="sector" tone="neutral" label={target.item.startup.sector} />
                <Badge status="stage" tone="neutral" label={target.item.startup.stage} />
                <Badge status="loc" tone="neutral" label={`${target.item.startup.city}, ${target.item.startup.region}`} />
              </div>
              <Section title="About">{target.item.startup.description}</Section>
              {target.item.pitch ? (
                <>
                  <Section title="The 60-second pitch"><p className="font-medium text-ink">{target.item.pitch.headline}</p></Section>
                  <Section title="Problem">{target.item.pitch.problem}</Section>
                  <Section title="Solution">{target.item.pitch.solution}</Section>
                  <Section title="Traction">{target.item.pitch.traction}</Section>
                  <Section title="The ask">{target.item.pitch.ask}</Section>
                </>
              ) : (
                <Section title="Pitch"><span className="text-mid">This founder hasn&apos;t published a pitch yet.</span></Section>
              )}
            </>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Stat label="Cheque size" value={formatRange(target.item.investor.checkMin, target.item.investor.checkMax)} />
                <Stat label="Portfolio" value={`${target.item.investor.portfolioCount} cos.`} />
              </div>
              <Section title="Thesis">{target.item.investor.thesis}</Section>
              <Section title="Background">{target.item.investor.bio}</Section>
              <Section title="Stages">{target.item.investor.stages.join(' · ')}</Section>
              <Section title="Sectors">{target.item.investor.sectors.join(' · ')}</Section>
              <Section title="Regions">{target.item.investor.regions.join(' · ')}</Section>
            </>
          )}
        </div>
      )}
    </Drawer>
  );
}
