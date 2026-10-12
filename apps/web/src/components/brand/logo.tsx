import { cn } from '@/lib/utils';

export function LogoMark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={cn('shrink-0', className)}>
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      {/* a "P" whose bowl is an arrow pointing forward: pitch first */}
      <path d="M11 24V8h6.2a5 5 0 0 1 0 10H11" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <LogoMark />
      <span className="font-display text-[17px] font-semibold tracking-tight text-ink">Pitchfirst</span>
    </span>
  );
}
