'use client';
import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMe, useMessages, useSendMessage, useThreads } from '@/lib/queries';
import { cn, formatRelativeDate, initials } from '@/lib/utils';
import Link from 'next/link';

export default function MessagesPage() {
  const { data: me } = useMe();
  const { data: threads, isLoading } = useThreads();
  const [activeId, setActiveId] = useState<string | null>(null);
  const current = activeId ?? threads?.[0]?.id ?? null;
  const active = threads?.find((t) => t.id === current) ?? null;

  return (
    <>
      <Topbar title="Messages" subtitle="Conversations unlock when interest is mutual" />
      <div className="mx-auto h-[calc(100vh-3.5rem-4rem)] max-w-[1280px] p-4 md:h-[calc(100vh-3.5rem)] md:p-6">
        {isLoading ? (
          <Skeleton className="h-full rounded-xl" />
        ) : !threads || threads.length === 0 ? (
          <Card className="px-6 py-16 text-center">
            <p className="font-display text-base font-semibold text-ink">No conversations yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-mid">
              When you and {me?.user.role === 'investor' ? 'a founder' : 'an investor'} both express interest, a thread opens here.{' '}
              <Link href="/dashboard/discover" className="font-medium text-accent-deep hover:underline">Start discovering</Link>.
            </p>
          </Card>
        ) : (
          <Card className="grid h-full grid-cols-1 overflow-hidden md:grid-cols-[300px_1fr]">
            <ul className="max-h-48 overflow-y-auto border-b border-line md:max-h-none md:border-b-0 md:border-r">
              {threads.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveId(t.id)}
                    aria-current={t.id === current}
                    className={cn('flex w-full items-start gap-3 border-b border-line/70 px-4 py-3 text-left transition-colors hover:bg-soft/60', t.id === current && 'bg-soft/70')}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-tint text-[11px] font-bold text-accent-deep">{initials(t.counterpart.name)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13.5px] font-medium text-ink">{t.counterpart.name}</span>
                        {t.unread > 0 && <span className="rounded-full bg-accent-deep px-1.5 font-mono text-[10px] text-white">{t.unread}</span>}
                      </span>
                      <span className="block truncate text-xs text-mid">{t.counterpart.subtitle}</span>
                      <span className="mt-0.5 block truncate text-xs text-faint">{t.lastMessage?.body ?? 'No messages yet'}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {active && me && <ThreadPane key={active.id} threadId={active.id} title={active.counterpart.name} subtitle={active.counterpart.subtitle} myId={me.user.id} />}
          </Card>
        )}
      </div>
    </>
  );
}

function ThreadPane({ threadId, title, subtitle, myId }: { threadId: string; title: string; subtitle: string; myId: string }) {
  const { data: msgs, isLoading } = useMessages(threadId);
  const send = useSendMessage(threadId);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [msgs?.length]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    send.mutate(body, { onSuccess: () => setDraft('') });
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="border-b border-line px-5 py-3">
        <p className="font-display text-[15px] font-semibold text-ink">{title}</p>
        <p className="text-xs text-mid">{subtitle}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" aria-live="polite">
        {isLoading && <Skeleton className="h-10 w-2/3" />}
        {(msgs ?? []).map((m) => {
          const mine = m.senderId === myId;
          return (
            <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[78%] rounded-2xl px-3.5 py-2 text-[13.5px]', mine ? 'rounded-br-md bg-ink text-card' : 'rounded-bl-md bg-soft text-body')}>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={cn('mt-1 font-mono text-[10px]', mine ? 'text-card/60' : 'text-faint')}>{formatRelativeDate(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-line p-3">
        <Input aria-label="Message" placeholder="Write a message…" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={2000} />
        <Button type="submit" disabled={send.isPending || !draft.trim()}><Send size={14} /> Send</Button>
      </form>
    </div>
  );
}
