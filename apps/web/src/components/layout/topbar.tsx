'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { useMarkAllRead, useNotifications } from '@/lib/queries';
import { formatRelativeDate } from '@/lib/utils';

export function Topbar({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  const { data: notes } = useNotifications();
  const markAll = useMarkAllRead();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = (notes ?? []).filter((n) => !n.read).length;

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-canvas/95 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-baseline gap-3">
        <h1 className="truncate font-display text-[17px] font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="hidden truncate text-xs text-mid sm:block">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1">
        {actions}
        <div className="relative" ref={ref}>
          <Button variant="ghost" size="sm" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="relative">
            <Bell size={16} strokeWidth={1.75} />
            {unread > 0 && <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />}
          </Button>
          {open && (
            <div className="pop-shadow absolute right-0 top-full z-30 mt-2 w-[340px] overflow-hidden rounded-xl border border-line bg-card">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <p className="text-[13px] font-medium text-ink">Notifications</p>
                {unread > 0 && (
                  <button onClick={() => markAll.mutate()} className="text-xs text-accent-deep hover:underline">Mark all read</button>
                )}
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {(notes ?? []).length === 0 && <li className="px-4 py-6 text-center text-xs text-mid">You&apos;re all caught up.</li>}
                {(notes ?? []).map((n) => (
                  <li key={n.id} className="border-b border-line/70 last:border-0">
                    <Link href={n.kind === 'message' ? '/dashboard/messages' : '/dashboard/matches'} onClick={() => setOpen(false)} className="block px-4 py-3 hover:bg-soft/60">
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-ink">{n.title}</p>
                          <p className="line-clamp-2 text-xs text-mid">{n.body}</p>
                          <p className="mt-1 font-mono text-[10.5px] text-faint">{formatRelativeDate(n.createdAt)}</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
