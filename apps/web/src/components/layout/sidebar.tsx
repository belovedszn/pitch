'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, Compass, Handshake, MessageSquare, Presentation, UserCircle, LogOut } from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { api } from '@/lib/api';
import { useMe, useThreads } from '@/lib/queries';
import { Wordmark } from '@/components/brand/logo';
import type { Role } from '@/lib/types';

type NavItem = { href: string; icon: typeof LayoutDashboard; label: string; roles?: Role[] };

function navFor(role: Role | undefined): NavItem[] {
  const items: NavItem[] = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/discover', icon: Compass, label: role === 'investor' ? 'Discover startups' : 'Find investors' },
    { href: '/dashboard/matches', icon: Handshake, label: 'Matches' },
    { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/dashboard/pitch', icon: Presentation, label: 'My pitch', roles: ['founder'] },
    { href: '/dashboard/profile', icon: UserCircle, label: 'Profile' },
  ];
  return items.filter((i) => !i.roles || (role && i.roles.includes(role)));
}

const PILL_SPRING = { type: 'spring' as const, stiffness: 380, damping: 32 };

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const reduce = useReducedMotion();
  const { data: me } = useMe();
  const { data: threads } = useThreads();
  const unread = (threads ?? []).reduce((n, t) => n + t.unread, 0);

  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  async function signOut() {
    await api.auth.logout();
    qc.clear();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-line md:flex">
      <div className="px-5 pb-4 pt-5">
        <Link href="/dashboard" aria-label="Pitchfirst home"><Wordmark /></Link>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {navFor(me?.user.role).map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13.5px] transition-colors duration-150',
                active ? 'font-medium text-ink' : 'text-mid hover:bg-soft/70 hover:text-ink',
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-lg border border-line bg-card shadow-card"
                  transition={reduce ? { duration: 0 } : PILL_SPRING}
                />
              )}
              <Icon size={16} strokeWidth={1.75} className={cn('relative z-10', active ? 'text-accent' : 'text-faint group-hover:text-mid')} />
              <span className="relative z-10 flex-1">{label}</span>
              {label === 'Messages' && unread > 0 && (
                <span className="relative z-10 rounded-full bg-accent-deep px-1.5 font-mono text-[10px] text-white">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-tint">
            <span className="text-[11px] font-bold text-accent-deep">{initials(me?.user.name ?? '?')}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-medium text-ink">{me?.user.name ?? 'Loading…'}</p>
            <p className="label-mono truncate text-[10px] text-faint">{me?.user.role ?? ''}</p>
          </div>
          <button onClick={signOut} aria-label="Sign out" className="rounded-md p-1.5 text-faint transition-colors hover:bg-soft hover:text-danger">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

/** Compact bottom nav for small screens. */
export function MobileNav() {
  const pathname = usePathname();
  const { data: me } = useMe();
  const items = navFor(me?.user.role).slice(0, 5);
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-line bg-canvas/95 px-2 py-1.5 backdrop-blur md:hidden">
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('flex flex-col items-center gap-0.5 px-2 py-1 text-[10.5px]', active ? 'text-ink' : 'text-mid')}>
            <Icon size={18} strokeWidth={1.75} className={active ? 'text-accent' : ''} />
            {label.split(' ')[0]}
          </Link>
        );
      })}
    </nav>
  );
}
