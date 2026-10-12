'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { api } from '@/lib/api';
import { loginSchema, type LoginInput } from '@/lib/schemas';
import type { Role } from '@/lib/types';

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const [demoLoading, setDemoLoading] = useState<Role | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const go = () => { router.push(next && next.startsWith('/dashboard') ? next : '/dashboard'); router.refresh(); };

  async function onSubmit(values: LoginInput) {
    try { await api.auth.login(values.email); go(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Sign in failed'); }
  }
  async function demo(role: Role) {
    setDemoLoading(role);
    try { await api.auth.demo(role); go(); } catch (e) { toast.error(e instanceof Error ? e.message : 'Demo unavailable'); setDemoLoading(null); }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see who's interested in you."
      footer={<>New to Pitchfirst? <Link href="/signup" className="font-medium text-accent-deep hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" {...register('email')} />
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing in…' : 'Sign in'}</Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-faint"><span className="h-px flex-1 bg-line" />or explore with sample data<span className="h-px flex-1 bg-line" /></div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => demo('founder')} disabled={demoLoading !== null}>{demoLoading === 'founder' ? 'Loading…' : 'Demo founder'}</Button>
        <Button variant="outline" onClick={() => demo('investor')} disabled={demoLoading !== null}>{demoLoading === 'investor' ? 'Loading…' : 'Demo investor'}</Button>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
