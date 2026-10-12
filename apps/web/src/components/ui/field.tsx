import { cn } from '@/lib/utils';

/** Label + control + error, the unit every form is built from. */
export function Field({
  label, error, hint, className, children, htmlFor,
}: {
  label: string;
  error?: string | undefined;
  hint?: string;
  className?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="label-mono block text-mid">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-mid">{hint}</p>}
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  );
}

/** Toggleable chip group used for multi-select (sectors, stages, regions). */
export function ChipSelect<T extends string>({
  options, value, onChange, label,
}: { options: readonly T[]; value: T[]; onChange: (v: T[]) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            className={cn(
              'rounded-full border px-3 py-1 text-[12.5px] transition-colors duration-150',
              on ? 'border-ink bg-ink text-card' : 'border-line bg-card text-body hover:border-faint',
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
