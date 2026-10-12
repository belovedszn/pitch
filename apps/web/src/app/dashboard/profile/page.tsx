'use client';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Field, ChipSelect } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { qk, useMe } from '@/lib/queries';
import { investorProfileSchema, startupProfileSchema, type InvestorProfileInput, type StartupProfileInput } from '@/lib/schemas';
import { REGIONS, SECTORS, STAGES, type Investor, type Startup } from '@/lib/types';

export default function ProfilePage() {
  const { data: me, isLoading } = useMe();
  return (
    <>
      <Topbar title="Profile" subtitle="Accurate profiles produce better matches" />
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        {isLoading || !me ? <Skeleton className="h-96 rounded-xl" /> : me.startup ? <StartupForm startup={me.startup} /> : me.investor ? <InvestorForm investor={me.investor} /> : null}
      </div>
    </>
  );
}

function StartupForm({ startup }: { startup: Startup }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<StartupProfileInput>({
    resolver: zodResolver(startupProfileSchema),
    defaultValues: startup,
  });
  useEffect(() => { reset(startup); }, [startup, reset]);

  const save = useMutation({
    mutationFn: api.me.updateStartup,
    onSuccess: () => {
      toast.success('Profile saved — your matches were re-scored');
      void qc.invalidateQueries({ queryKey: qk.me });
      void qc.invalidateQueries({ queryKey: ['discover'] });
      void qc.invalidateQueries({ queryKey: qk.matches });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save'),
  });

  return (
    <Card>
      <CardHeader><CardTitle>Startup profile</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Company name" htmlFor="name" error={errors.name?.message}><Input id="name" {...register('name')} /></Field>
          <Field label="Website" htmlFor="website" error={errors.website?.message}><Input id="website" placeholder="https://" {...register('website')} /></Field>
          <Field className="sm:col-span-2" label="Tagline" htmlFor="tagline" error={errors.tagline?.message}><Input id="tagline" {...register('tagline')} /></Field>
          <Field className="sm:col-span-2" label="Description" htmlFor="description" error={errors.description?.message}><Textarea id="description" rows={4} {...register('description')} /></Field>
          <Field label="Sector" htmlFor="sector"><Select id="sector" {...register('sector')}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Stage" htmlFor="stage"><Select id="stage" {...register('stage')}>{STAGES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Region" htmlFor="region"><Select id="region" {...register('region')}>{REGIONS.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="City" htmlFor="city" error={errors.city?.message}><Input id="city" {...register('city')} /></Field>
          <Field label="Raising (USD)" htmlFor="raising" error={errors.raising?.message}><Input id="raising" type="number" min={0} {...register('raising')} /></Field>
          <Field label="MRR (USD)" htmlFor="mrr" error={errors.mrr?.message}><Input id="mrr" type="number" min={0} {...register('mrr')} /></Field>
          <Field label="MoM growth (%)" htmlFor="growthPct" error={errors.growthPct?.message}><Input id="growthPct" type="number" step="0.1" {...register('growthPct')} /></Field>
          <Field label="Users / customers" htmlFor="users" error={errors.users?.message}><Input id="users" type="number" min={0} {...register('users')} /></Field>
          <Field label="Team size" htmlFor="teamSize" error={errors.teamSize?.message}><Input id="teamSize" type="number" min={1} {...register('teamSize')} /></Field>
          <Field label="Founded" htmlFor="foundedYear" error={errors.foundedYear?.message}><Input id="foundedYear" type="number" {...register('foundedYear')} /></Field>
          <div className="flex items-center justify-end gap-3 sm:col-span-2">
            {isDirty && <span className="text-xs text-mid">Unsaved changes</span>}
            <Button type="submit" disabled={save.isPending || !isDirty}>{save.isPending ? 'Saving…' : 'Save profile'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function InvestorForm({ investor }: { investor: Investor }) {
  const qc = useQueryClient();
  const { register, control, handleSubmit, reset, formState: { errors, isDirty } } = useForm<InvestorProfileInput>({
    resolver: zodResolver(investorProfileSchema),
    defaultValues: investor,
  });
  useEffect(() => { reset(investor); }, [investor, reset]);

  const save = useMutation({
    mutationFn: api.me.updateInvestor,
    onSuccess: () => {
      toast.success('Profile saved — your matches were re-scored');
      void qc.invalidateQueries({ queryKey: qk.me });
      void qc.invalidateQueries({ queryKey: ['discover'] });
      void qc.invalidateQueries({ queryKey: qk.matches });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not save'),
  });

  return (
    <Card>
      <CardHeader><CardTitle>Investor profile</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Firm" htmlFor="firm" error={errors.firm?.message}><Input id="firm" {...register('firm')} /></Field>
          <Field label="Title" htmlFor="title" error={errors.title?.message}><Input id="title" {...register('title')} /></Field>
          <Field className="sm:col-span-2" label="Investment thesis" htmlFor="thesis" error={errors.thesis?.message}><Textarea id="thesis" rows={3} {...register('thesis')} /></Field>
          <Field className="sm:col-span-2" label="Background" htmlFor="bio" error={errors.bio?.message}><Textarea id="bio" rows={3} {...register('bio')} /></Field>
          <Field className="sm:col-span-2" label="Stages" error={errors.stages?.message as string | undefined}>
            <Controller control={control} name="stages" render={({ field }) => <ChipSelect label="Stages" options={STAGES} value={field.value} onChange={field.onChange} />} />
          </Field>
          <Field className="sm:col-span-2" label="Sectors" error={errors.sectors?.message as string | undefined}>
            <Controller control={control} name="sectors" render={({ field }) => <ChipSelect label="Sectors" options={SECTORS} value={field.value} onChange={field.onChange} />} />
          </Field>
          <Field className="sm:col-span-2" label="Regions" error={errors.regions?.message as string | undefined}>
            <Controller control={control} name="regions" render={({ field }) => <ChipSelect label="Regions" options={REGIONS} value={field.value} onChange={field.onChange} />} />
          </Field>
          <Field label="Min cheque (USD)" htmlFor="checkMin" error={errors.checkMin?.message}><Input id="checkMin" type="number" {...register('checkMin')} /></Field>
          <Field label="Max cheque (USD)" htmlFor="checkMax" error={errors.checkMax?.message}><Input id="checkMax" type="number" {...register('checkMax')} /></Field>
          <Field label="Portfolio companies" htmlFor="portfolioCount" error={errors.portfolioCount?.message}><Input id="portfolioCount" type="number" min={0} {...register('portfolioCount')} /></Field>
          <Field label="City" htmlFor="city" error={errors.city?.message}><Input id="city" {...register('city')} /></Field>
          <div className="flex items-center justify-end gap-3 sm:col-span-2">
            {isDirty && <span className="text-xs text-mid">Unsaved changes</span>}
            <Button type="submit" disabled={save.isPending || !isDirty}>{save.isPending ? 'Saving…' : 'Save profile'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
