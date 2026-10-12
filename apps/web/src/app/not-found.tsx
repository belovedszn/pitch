import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="label-mono text-accent-deep">404</p>
      <h1 className="mt-2 font-display text-[34px] font-semibold tracking-tighter text-ink">Nothing pitched here.</h1>
      <p className="mt-2 text-sm text-mid">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="mt-6"><Button>Back home</Button></Link>
    </div>
  );
}
