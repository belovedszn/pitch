import Link from 'next/link';
import { ArrowRight, Check, Gauge, Handshake, Presentation, ShieldCheck, Sparkles } from 'lucide-react';
import { Wordmark } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="Pitchfirst home"><Wordmark /></Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 text-[13.5px] text-mid md:flex">
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#founders" className="hover:text-ink">For founders</a>
          <a href="#investors" className="hover:text-ink">For investors</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:block"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link href="/signup"><Button size="sm">Get started</Button></Link>
        </div>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:pt-24">
      <p className="label-mono inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-mid">
        <Sparkles size={12} className="text-accent" /> Fundraising, minus the cold emails
      </p>
      <h1 className="mt-6 max-w-3xl font-display text-[44px] font-semibold leading-[1.02] tracking-tightest text-ink md:text-[72px]">
        Pitch first.<br /><span className="text-accent">Meet second.</span>
      </h1>
      <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-body">
        Pitchfirst puts a founder&apos;s 60-second pitch in front of investors who actually back that stage, sector and cheque size — and opens the conversation only when interest is mutual.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/signup"><Button size="lg">I&apos;m a founder <ArrowRight size={15} /></Button></Link>
        <Link href="/signup"><Button size="lg" variant="outline">I&apos;m an investor</Button></Link>
      </div>
      <p className="mt-4 text-xs text-mid">Want a look first? <Link href="/login" className="underline underline-offset-2 hover:text-ink">Open the demo with sample data</Link>.</p>

      <div className="hero-panel mt-14 grid gap-px overflow-hidden rounded-2xl border border-line md:grid-cols-3">
        {[
          ['01', 'Share a pitch', 'Problem, solution, traction and ask — in four short fields.'],
          ['02', 'Get matched', 'Scored on sector, stage, cheque size and region, with the reasons shown.'],
          ['03', 'Connect on mutual interest', 'Messaging unlocks only when both sides say yes.'],
        ].map(([n, t, d]) => (
          <div key={n} className="p-6">
            <p className="font-mono text-xs text-accent-lite">{n}</p>
            <p className="mt-3 font-display text-[19px] font-semibold tracking-tight text-hero-ink">{t}</p>
            <p className="mt-1.5 text-sm text-hero-mut">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  { icon: Presentation, title: 'Build your profile', body: 'Founders describe the company and raise. Investors describe their thesis, stages, regions and cheque range.' },
  { icon: Gauge, title: 'See explainable matches', body: 'Every match shows a score and the reasons behind it, so nobody wastes a week on a mandate mismatch.' },
  { icon: Handshake, title: 'Express interest', body: 'One tap signals interest. If the other side reciprocates, you are connected and can message directly.' },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="max-w-xl font-display text-[32px] font-semibold leading-tight tracking-tighter text-ink md:text-[40px]">A shorter path from pitch to partner.</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-line bg-card p-6 shadow-card">
            <Icon size={20} strokeWidth={1.75} className="text-accent" />
            <h3 className="mt-4 font-display text-[18px] font-semibold tracking-tight text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mid">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Audience({ id, eyebrow, title, points, cta }: { id: string; eyebrow: string; title: string; points: string[]; cta: string }) {
  return (
    <div id={id} className="rounded-2xl border border-line bg-card p-8 shadow-card">
      <p className="label-mono text-accent-deep">{eyebrow}</p>
      <h3 className="mt-3 font-display text-[26px] font-semibold leading-tight tracking-tighter text-ink">{title}</h3>
      <ul className="mt-5 space-y-3">
        {points.map((p) => (
          <li key={p} className="flex gap-2.5 text-[14px] text-body"><Check size={16} className="mt-0.5 shrink-0 text-ok" />{p}</li>
        ))}
      </ul>
      <Link href="/signup" className="mt-7 inline-block"><Button>{cta} <ArrowRight size={14} /></Button></Link>
    </div>
  );
}

export function Audiences() {
  return (
    <section className="mx-auto grid max-w-6xl gap-5 px-5 py-8 md:grid-cols-2">
      <Audience
        id="founders" eyebrow="For founders" title="Spend your time with investors who can say yes."
        points={['A single 60-second pitch replaces dozens of tailored emails', 'See which investors fit your stage, sector and round size', 'Track views, saves and interest in one pipeline', 'Message only people who have opted in']}
        cta="Start raising"
      />
      <Audience
        id="investors" eyebrow="For investors" title="Deal flow that already fits your thesis."
        points={['Set your mandate once: stages, sectors, regions and cheque size', 'Browse standardised pitches that are quick to compare', 'Every match shows why it was surfaced', 'Pass in one click, and never see a dead deal again']}
        cta="Find deals"
      />
    </section>
  );
}

export function Trust() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_1.2fr]">
        <div>
          <ShieldCheck size={22} className="text-accent" strokeWidth={1.75} />
          <h2 className="mt-4 font-display text-[30px] font-semibold leading-tight tracking-tighter text-ink">Matching you can audit.</h2>
          <p className="mt-3 text-sm leading-relaxed text-mid">No black box. Scores are a transparent blend of four signals, and you can see exactly which ones fired.</p>
        </div>
        <div className="rounded-xl border border-line bg-card p-5 shadow-card">
          {[['Sector', 35], ['Stage', 30], ['Cheque size', 20], ['Region', 15]].map(([label, w]) => (
            <div key={label as string} className="flex items-center gap-4 border-b border-line/70 py-3 last:border-0">
              <span className="w-28 text-[13.5px] text-body">{label}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-soft"><span className="block h-full rounded-full bg-accent" style={{ width: `${(w as number) * 2.5}%` }} /></span>
              <span className="w-10 text-right font-mono text-[13px] text-ink">{w}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  ['Is Pitchfirst free?', 'This is an early build with no payments wired up. Pricing is not final — see the roadmap in the README for the intended model.'],
  ['Who can see my pitch?', 'Signed-in investors. Founders cannot browse other founders\' pitches, and investor contact details stay private until you connect.'],
  ['Why can\'t I message anyone straight away?', 'Mutual interest keeps conversations welcome. Both sides opt in before a thread opens, which cuts cold outreach.'],
  ['How are matches scored?', 'Out of 100: sector 35, stage 30, cheque size 20, region 15. The reasons behind every score are shown on each card.'],
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
      <h2 className="font-display text-[32px] font-semibold tracking-tighter text-ink">Questions</h2>
      <div className="mt-6 divide-y divide-line rounded-xl border border-line bg-card shadow-card">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-[14.5px] font-medium text-ink">
              {q}<span aria-hidden className="ml-4 text-faint transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-mid">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <div className="hero-panel rounded-2xl px-8 py-14 text-center">
        <h2 className="mx-auto max-w-xl font-display text-[34px] font-semibold leading-tight tracking-tighter text-hero-ink md:text-[44px]">The right conversation starts with a good pitch.</h2>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup"><Button size="lg">Create your account</Button></Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-xs text-mid sm:flex-row">
        <Wordmark />
        <p>© {new Date().getFullYear()} Pitchfirst. Not investment advice; Pitchfirst does not broker securities.</p>
      </div>
    </footer>
  );
}
