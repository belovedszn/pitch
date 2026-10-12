import { Card } from './card';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <Card className="px-4 py-3.5">
      <p className="label-mono text-mid">{label}</p>
      <p className="mt-1.5 font-mono text-[26px] font-semibold leading-none tracking-tight text-ink">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-mid">{sub}</p>}
    </Card>
  );
}
