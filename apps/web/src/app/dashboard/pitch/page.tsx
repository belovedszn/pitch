'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, Bookmark } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { qk, useMe } from '@/lib/queries';
import { pitchSchema, type PitchInput } from '@/lib/schemas';

const FIELDS = [
  { name: 'problem', label: 'The problem', hint: 'Who hurts, and how badly?', max: 400 },
  { name: 'solution', label: 'Your solution', hint: 'What do you do differently?', max: 400 },
  { name: 'traction', label: 'Traction', hint: 'Numbers beat adjectives.', max: 300 },
  { name: 'ask', label: 'The ask', hint: 'How much, for what, and what it unlocks.', max: 300 },
] as const;

export default function PitchPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: me, isLoading } = useMe();
  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<PitchInput>({
    resolver: zodResolver(pitchSchema),
    defaultValues: { headline: '', problem: '', solution: '', traction: '', ask: '' },
  });

  useEffect(() => {
    if (me?.user.role === 'investor') router.replace('/dashboard');
    if (me?.pitch) reset({ headline: me.pitch.headline, problem: me.pitch.problem, solution: me.pitch.solution, traction: me.pitch.traction, ask: me.pitch.ask });
  }, [me, reset, router]);

  const save = useMutation({
    mutationFn: api.me.savePitch,
    onSuccess: (p) => {
      toast.success('Pitch published — investors can see it now');
      reset({ headline: p.headline, problem: p.problem, solution: p.solution, traction: p.traction, ask: p.ask });
      void qc.invalidateQueries({ queryKey: qk.me });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save'),
  });

  const values = watch();

  return (
    <>
      <Topbar title="My pitch" subtitle="The 60-second version investors see first" />
      <div className="mx-auto grid max-w-[1280px] gap-5 p-4 md:p-6 lg:grid-cols-[1fr_380px]">
        {isLoading ? <Skeleton className="h-96 rounded-xl" /> : (
          <Card>
            <CardHeader><CardTitle>Write your pitch</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
                <Field label="Headline" htmlFor="headline" error={errors.headline?.message} hint="One sentence. Make an investor want the next one.">
                  <Input id="headline" maxLength={100} {...register('headline')} />
                </Field>
                {FIELDS.map((f) => (
                  <Field key={f.name} label={f.label} htmlFor={f.name} error={errors[f.name]?.message} hint={`${f.hint} (${values[f.name]?.length ?? 0}/${f.max})`}>
                    <Textarea id={f.name} maxLength={f.max} {...register(f.name)} />
                  </Field>
                ))}
                <div className="flex items-center justify-end gap-3">
                  {isDirty && <span className="text-xs text-mid">Unsaved changes</span>}
                  <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Publishing…' : me?.pitch ? 'Update pitch' : 'Publish pitch'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {me?.pitch && (
            <div className="grid grid-cols-2 gap-3">
              <Card className="px-4 py-3"><p className="label-mono flex items-center gap-1.5 text-mid"><Eye size={12} /> Views</p><p className="mt-1 font-mono text-2xl font-semibold text-ink">{me.pitch.views}</p></Card>
              <Card className="px-4 py-3"><p className="label-mono flex items-center gap-1.5 text-mid"><Bookmark size={12} /> Saves</p><p className="mt-1 font-mono text-2xl font-semibold text-ink">{me.pitch.saves}</p></Card>
            </div>
          )}
          <Card className="hero-panel overflow-hidden border-0 p-5">
            <p className="label-mono text-hero-mut">Preview · what investors see</p>
            <p className="mt-3 font-display text-[19px] font-semibold leading-snug tracking-tight text-hero-ink">{values.headline || 'Your headline appears here'}</p>
            <dl className="mt-4 space-y-3 text-[13px]">
              {FIELDS.map((f) => (
                <div key={f.name}>
                  <dt className="label-mono text-[10px] text-hero-mut">{f.label}</dt>
                  <dd className="mt-0.5 text-hero-ink/90">{values[f.name] || '—'}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
