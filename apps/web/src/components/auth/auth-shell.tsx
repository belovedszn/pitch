import Link from 'next/link';
import { Wordmark } from '@/components/brand/logo';

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" aria-label="Pitchfirst home"><Wordmark /></Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-[30px] font-semibold leading-tight tracking-tighter text-ink">{title}</h1>
          <p className="mt-2 text-sm text-mid">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-mid">{footer}</div>
        </div>
      </div>
      <aside className="hero-panel relative hidden flex-col justify-end overflow-hidden p-12 lg:flex" aria-hidden="true">
        <p className="font-display text-[34px] font-semibold leading-[1.1] tracking-tighter text-hero-ink">
          The best introductions start with a great pitch — not a cold email.
        </p>
        <p className="mt-4 max-w-md text-sm text-hero-mut">
          Founders share a 60-second pitch. Investors see it matched against their thesis. When interest is mutual, the conversation opens.
        </p>
      </aside>
    </div>
  );
}
