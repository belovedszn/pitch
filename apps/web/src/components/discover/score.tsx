import { matchTier } from '@/lib/matching';
import { cn } from '@/lib/utils';

/** Match score as a thin bar + mono number. Colour is a redundant cue; the number carries the meaning. */
export function ScoreMeter({ score, className }: { score: number; className?: string }) {
  const tier = matchTier(score);
  return (
    <div className={cn('flex items-center gap-2', className)} title={`${score}% match`}>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-soft" role="presentation">
        <div
          className={cn('h-full rounded-full', tier === 'strong' ? 'bg-ok' : tier === 'good' ? 'bg-accent' : 'bg-faint')}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="font-mono text-[12px] font-medium text-ink">{score}%</span>
      <span className="sr-only">match</span>
    </div>
  );
}
