'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Stagger, Rise } from '@/components/ui/motion';
import { StartupCard, InvestorCard } from '@/components/discover/cards';
import { DetailDrawer, type DetailTarget } from '@/components/discover/detail-drawer';
import { useDiscover } from '@/lib/queries';
import { REGIONS, SECTORS, STAGES } from '@/lib/types';
import { useDebounced } from '@/lib/use-debounced';

export default function DiscoverPage() {
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [region, setRegion] = useState('');
  const [sort, setSort] = useState<'score' | 'recent'>('score');
  const [target, setTarget] = useState<DetailTarget>(null);
  const dq = useDebounced(q, 250);

  const { data, isLoading, isError, error } = useDiscover({ q: dq, sector, stage, region, sort });
  const isInvestor = data?.role === 'investor';

  return (
    <>
      <Topbar title={isInvestor ? 'Discover startups' : 'Find investors'} subtitle="Ranked by fit with your profile" />
      <div className="mx-auto max-w-[1280px] space-y-5 p-4 md:p-6">
        <Card className="flex flex-wrap items-end gap-3 p-3">
          <div className="relative min-w-[200px] flex-1">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <Input aria-label="Search" placeholder="Search by name, city or keyword" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
          </div>
          <Select aria-label="Sector" value={sector} onChange={(e) => setSector(e.target.value)} className="w-40">
            <option value="">All sectors</option>{SECTORS.map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Select aria-label="Stage" value={stage} onChange={(e) => setStage(e.target.value)} className="w-36">
            <option value="">All stages</option>{STAGES.map((s) => <option key={s}>{s}</option>)}
          </Select>
          <Select aria-label="Region" value={region} onChange={(e) => setRegion(e.target.value)} className="w-44">
            <option value="">All regions</option>{REGIONS.map((s) => <option key={s}>{s}</option>)}
          </Select>
          {isInvestor && (
            <Select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as 'score' | 'recent')} className="w-36">
              <option value="score">Best match</option><option value="recent">Newest pitch</option>
            </Select>
          )}
        </Card>

        {isError && <p role="alert" className="text-sm text-danger">{error instanceof Error ? error.message : 'Failed to load'}</p>}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}</div>
        ) : data && data.items.length === 0 ? (
          <Card className="px-6 py-14 text-center">
            <p className="font-display text-base font-semibold text-ink">No results</p>
            <p className="mt-1 text-sm text-mid">Try removing a filter or searching for something broader.</p>
          </Card>
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" key={`${dq}${sector}${stage}${region}${sort}${data?.role}`}>
            {data?.role === 'investor' && data.items.map((item) => (
              <Rise key={item.startup.id}><StartupCard item={item} onOpen={() => setTarget({ kind: 'startup', item })} /></Rise>
            ))}
            {data?.role === 'founder' && data.items.map((item) => (
              <Rise key={item.investor.id}><InvestorCard item={item} onOpen={() => setTarget({ kind: 'investor', item })} /></Rise>
            ))}
          </Stagger>
        )}
      </div>
      <DetailDrawer target={target} onClose={() => setTarget(null)} />
    </>
  );
}
