'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { StatSkeleton, Skeleton } from '@/components/ui/skeleton';
import { CountUp } from '@/components/ui/count-up';
import { Stagger, Rise } from '@/components/ui/motion';
import { ScoreMeter } from '@/components/discover/score';
import { useDiscover, useMe, useOverview } from '@/lib/queries';
import { cn } from '@/lib/utils';
import type { MatchStatus } from '@/lib/types';

const FUNNEL_STYLE: Record<MatchStatus, { label: string; bar: string }> = {
  suggested: { label: 'Suggested', bar: 'bg-info' },
  interested: { label: 'Interested', bar: 'bg-accent' },
  connected: { label: 'Connected', bar: 'bg-ok' },
  passed: { label: 'Passed', bar: 'bg-faint' },
};

export default function OverviewPage() {
  const { data: me } = useMe();
  const { data: stats, isLoading } = useOverview();
  const { data: discover } = useDiscover({ sort: 'score' });
  const first = me?.user.name.split(' ')[0];
  const needsPitch = me?.user.role === 'founder' && !me.pitch;
  const total = stats?.funnel.reduce((a, f) => a + f.count, 0) ?? 0;

  return (
    <>
      <Topbar title="Overview" subtitle={me ? `Signed in as ${me.user.role}` : undefined} />
      <Stagger className="mx-auto max-w-[1280px] space-y-4 p-4 md:p-6">
        <Rise>
          <section className="hero-panel overflow-hidden rounded-2xl p-6 md:p-8">
            <p className="label-mono text-hero-mut">{me?.user.role === 'investor' ? 'Deal flow' : 'Fundraise'}</p>
            <h2 className="mt-2 max-w-xl font-display text-[28px] font-semibold leading-tight tracking-tighter text-hero-ink md:text-[34px]">
              {first ? `Welcome back, ${first}.` : 'Welcome back.'}{' '}
              {needsPitch ? 'Publish your pitch to get seen.' : stats ? <>You have <CountUp value={(stats.kpis[2]?.value ?? 0)} /> {me?.user.role === 'investor' ? 'startups' : 'investors'} waiting on a reply.</> : null}
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {needsPitch ? (
                <Link href="/dashboard/pitch"><Button size="lg">Write your pitch <ArrowRight size={15} /></Button></Link>
              ) : (
                <Link href="/dashboard/matches"><Button size="lg">Review matches <ArrowRight size={15} /></Button></Link>
              )}
              <Link href="/dashboard/discover"><Button size="lg" variant="outline" className="border-white/20 bg-transparent text-hero-ink hover:border-white/40 hover:text-hero-ink">Discover</Button></Link>
            </div>
          </section>
        </Rise>

        <Rise>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {isLoading || !stats
              ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
              : stats.kpis.map((k) => (
                  <StatCard key={k.label} label={k.label} sub={k.sub} value={<><CountUp value={k.value} />{k.format === 'percent' ? '%' : ''}</>} />
                ))}
          </div>
        </Rise>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Rise>
            <Card>
              <CardHeader><CardTitle>{me?.user.role === 'investor' ? 'Pitches reviewed this week' : 'Pitch activity this week'}</CardTitle></CardHeader>
              <CardContent>
                {isLoading || !stats ? <Skeleton className="h-52" /> : (
                  <div className="h-52" role="img" aria-label="Weekly activity chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.activity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="var(--line)" vertical={false} />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'var(--mid)', fontSize: 11 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--mid)', fontSize: 11 }} allowDecimals={false} />
                        <RTooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, fontSize: 12 }} />
                        <Area type="monotone" dataKey="views" name="Views" stroke="var(--accent)" strokeWidth={2} fill="url(#g)" />
                        <Area type="monotone" dataKey="interested" name="Interest" stroke="var(--ok)" strokeWidth={2} fill="none" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </Rise>

          <Rise>
            <Card className="h-full">
              <CardHeader><CardTitle>Pipeline</CardTitle></CardHeader>
              <CardContent>
                {isLoading || !stats ? <Skeleton className="h-24" /> : total === 0 ? (
                  <p className="py-6 text-center text-sm text-mid">No matches yet — discover to get started.</p>
                ) : (
                  <>
                    <div className="flex h-3 overflow-hidden rounded-full bg-soft" role="img" aria-label="Pipeline breakdown">
                      {stats.funnel.filter((f) => f.count > 0).map((f) => <div key={f.status} className={cn(FUNNEL_STYLE[f.status].bar)} style={{ width: `${(f.count / total) * 100}%` }} />)}
                    </div>
                    <ul className="mt-4 space-y-2">
                      {stats.funnel.map((f) => (
                        <li key={f.status} className="flex items-center justify-between text-[13.5px]">
                          <span className="flex items-center gap-2 text-body"><span className={cn('h-2 w-2 rounded-full', FUNNEL_STYLE[f.status].bar)} />{FUNNEL_STYLE[f.status].label}</span>
                          <span className="font-mono text-ink">{f.count}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </Rise>
        </div>

        <Rise>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top matches for you</CardTitle>
                <Link href="/dashboard/discover" className="text-[13px] text-accent-deep hover:underline">See all</Link>
              </div>
            </CardHeader>
            <ul>
              {!discover && <li className="p-4"><Skeleton className="h-10" /></li>}
              {discover?.role === 'investor' && discover.items.slice(0, 4).map((i) => (
                <li key={i.startup.id} className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-3 last:border-0">
                  <div className="min-w-0"><p className="truncate text-[13.5px] font-medium text-ink">{i.startup.name}</p><p className="truncate text-xs text-mid">{i.startup.tagline}</p></div>
                  <ScoreMeter score={i.score} />
                </li>
              ))}
              {discover?.role === 'founder' && discover.items.slice(0, 4).map((i) => (
                <li key={i.investor.id} className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-3 last:border-0">
                  <div className="min-w-0"><p className="truncate text-[13.5px] font-medium text-ink">{i.investor.name}</p><p className="truncate text-xs text-mid">{i.investor.title}, {i.investor.firm}</p></div>
                  <ScoreMeter score={i.score} />
                </li>
              ))}
            </ul>
          </Card>
        </Rise>
      </Stagger>
    </>
  );
}
