'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Table, Thead, Th, Tbody, Tr, Td } from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ScoreMeter } from '@/components/discover/score';
import { useExpressInterest, useMatches, useMe, usePassMatch } from '@/lib/queries';
import { formatRelativeDate, formatRange, formatUsd } from '@/lib/utils';
import { MATCH_STATUSES, type MatchStatus, type MatchView } from '@/lib/types';

const TAB_LABELS: Record<MatchStatus, string> = { connected: 'Connected', interested: 'Interested', suggested: 'Suggested', passed: 'Passed' };
const ORDER: MatchStatus[] = ['connected', 'interested', 'suggested', 'passed'];

export default function MatchesPage() {
  const { data: me } = useMe();
  const { data: matches, isLoading } = useMatches();
  const [tab, setTab] = useState<MatchStatus>('connected');
  const interest = useExpressInterest();
  const pass = usePassMatch();
  const role = me?.user.role;

  const counts = useMemo(() => {
    const c = Object.fromEntries(MATCH_STATUSES.map((s) => [s, 0])) as Record<MatchStatus, number>;
    (matches ?? []).forEach((m) => { c[m.status] += 1; });
    return c;
  }, [matches]);
  const rows = (matches ?? []).filter((m) => m.status === tab);

  /** "Interested" means different things depending on who made the first move. */
  const waitingOnMe = (m: MatchView) => m.status === 'interested' && !!role && m.initiatedBy !== role;

  return (
    <>
      <Topbar title="Matches" subtitle="Your pipeline, from first signal to conversation" />
      <div className="mx-auto max-w-[1280px] space-y-4 p-4 md:p-6">
        <Tabs tabs={ORDER.map((s) => ({ id: s, label: TAB_LABELS[s], count: counts[s] }))} activeTab={tab} onChange={(t) => setTab(t as MatchStatus)} />
        <Card className="overflow-x-auto">
          <Table>
            <Thead>
              <tr>
                <Th>{role === 'investor' ? 'Startup' : 'Investor'}</Th>
                <Th>Match</Th>
                <Th>{role === 'investor' ? 'Raising' : 'Cheque size'}</Th>
                <Th>Status</Th>
                <Th>Updated</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </Thead>
            <Tbody>
              {isLoading && <TableSkeleton cols={6} rows={4} />}
              {!isLoading && rows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-mid">
                  Nothing here yet. <Link href="/dashboard/discover" className="font-medium text-accent-deep hover:underline">Discover {role === 'investor' ? 'startups' : 'investors'}</Link> to get matches moving.
                </td></tr>
              )}
              {rows.map((m) => (
                <Tr key={m.id}>
                  <Td>
                    <p className="font-medium text-ink">{role === 'investor' ? m.startup.name : m.investor.name}</p>
                    <p className="text-xs text-mid">{role === 'investor' ? `${m.startup.stage} · ${m.startup.sector}` : `${m.investor.title}, ${m.investor.firm}`}</p>
                  </Td>
                  <Td><ScoreMeter score={m.score} /></Td>
                  <Td className="font-mono text-[12.5px]">{role === 'investor' ? formatUsd(m.startup.raising) : formatRange(m.investor.checkMin, m.investor.checkMax)}</Td>
                  <Td>
                    <Badge status={m.status} label={waitingOnMe(m) ? 'Wants to connect' : undefined} tone={waitingOnMe(m) ? 'accent' : undefined} />
                  </Td>
                  <Td className="font-mono text-[12px] text-mid">{formatRelativeDate(m.updatedAt)}</Td>
                  <Td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {m.status === 'connected' && (
                        <Link href="/dashboard/messages"><Button size="sm" variant="outline"><MessageSquare size={13} /> Message</Button></Link>
                      )}
                      {(m.status === 'suggested' || waitingOnMe(m)) && (
                        <Button size="sm" onClick={() => interest.mutate(role === 'investor' ? m.startupId : m.investorId)} disabled={interest.isPending}>
                          {waitingOnMe(m) ? 'Accept' : 'Express interest'}
                        </Button>
                      )}
                      {(m.status === 'suggested' || m.status === 'interested') && (
                        <Button size="sm" variant="ghost" aria-label={`Pass on ${role === 'investor' ? m.startup.name : m.investor.name}`} onClick={() => pass.mutate(m.id)} disabled={pass.isPending}><X size={14} /></Button>
                      )}
                      {m.status === 'passed' && (
                        <Button size="sm" variant="ghost" onClick={() => interest.mutate(role === 'investor' ? m.startupId : m.investorId)}>Reconsider</Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>
      </div>
    </>
  );
}
