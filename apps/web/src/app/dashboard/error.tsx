'use client';
import { Button } from '@/components/ui/button';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto mt-24 max-w-md text-center">
      <h2 className="font-display text-lg font-semibold text-ink">Something went wrong</h2>
      <p className="mt-2 text-sm text-mid">{error.message || 'An unexpected error occurred.'}</p>
      <Button className="mt-5" onClick={reset}>Try again</Button>
    </div>
  );
}
