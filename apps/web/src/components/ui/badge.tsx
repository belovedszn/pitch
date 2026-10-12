import { cn } from '@/lib/utils';

const tones = {
  ok: 'bg-ok-tint text-ok',
  accent: 'bg-accent-tint text-accent-deep dark:text-accent-lite',
  warn: 'bg-warn-tint text-warn',
  danger: 'bg-danger-tint text-danger',
  info: 'bg-info-tint text-info',
  neutral: 'bg-soft text-mid',
};

const stateTone: Record<string, keyof typeof tones> = {
  connected: 'ok',
  verified: 'ok',
  interested: 'accent',
  suggested: 'info',
  passed: 'neutral',
};

const LABELS: Record<string, string> = { connected: 'Connected', interested: 'Interested', suggested: 'Suggested', passed: 'Passed' };

interface BadgeProps {
  status: string;
  label?: string;
  tone?: keyof typeof tones;
  className?: string;
}

export function Badge({ status, label, tone, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2 py-[3px] font-mono text-[10.5px] font-medium uppercase tracking-[0.05em]',
        tones[tone ?? stateTone[status] ?? 'neutral'],
        className,
      )}
    >
      {label ?? LABELS[status] ?? status.replace(/_/g, ' ')}
    </span>
  );
}
