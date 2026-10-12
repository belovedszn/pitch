'use client';
import Link from 'next/link';
import { Check, Heart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExpressInterest, useMe } from '@/lib/queries';
import type { MatchStatus, Role } from '@/lib/types';

export function InterestButton({
  targetId, status, initiatedBy, size = 'sm',
}: { targetId: string; status: MatchStatus | null; initiatedBy: Role | 'system' | null; size?: 'sm' | 'md' }) {
  const { data: me } = useMe();
  const interest = useExpressInterest();

  if (status === 'connected') {
    return (
      <Link href="/dashboard/messages">
        <Button variant="outline" size={size} type="button"><MessageSquare size={14} /> Message</Button>
      </Link>
    );
  }
  // I already made the first move: nothing left to do but wait.
  if (status === 'interested' && initiatedBy === me?.user.role) {
    return <Button variant="secondary" size={size} disabled><Check size={14} /> Interest sent</Button>;
  }
  // They made the first move: reciprocating connects us.
  const theyAsked = status === 'interested';
  return (
    <Button size={size} onClick={() => interest.mutate(targetId)} disabled={interest.isPending}>
      <Heart size={14} /> {interest.isPending ? 'Sending…' : theyAsked ? 'Accept & connect' : 'Express interest'}
    </Button>
  );
}
