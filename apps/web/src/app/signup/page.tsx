'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Rocket, Landmark } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { api } from '@/lib/api';
import { signupSchema, type SignupInput } from '@/lib/schemas';
import { cn } from '@/lib/utils';

const ROLES = [
  { value: 'founder', label: "I'm a founder", sub: 'Raise capital', icon: Rocket },
  { value: 'investor', label: "I'm an investor", sub: 'Find deals', icon: Landmark },
] as const;

export default function SignupPage() {
  const router = useRouter();
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'founder' },
  });

  async function onSubmit(values: SignupInput) {
    try {
      await api.auth.signup(values);
      toast.success('Welcome to Pitchfirst — finish your profile to get matched');
      router.push('/dashboard/profile');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not create account');
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes a minute. You can refine your profile afterwards."
      footer={<>Already have an account? <Link href="/login" className="font-medium text-accent-deep hover:underline">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <div role="radiogroup" aria-label="I am a" className="grid grid-cols-2 gap-2">
              {ROLES.map(({ value, label, sub, icon: Icon }) => {
                const on = field.value === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => field.onChange(value)}
                    className={cn('rounded-xl border p-3 text-left transition-colors duration-150', on ? 'border-ink bg-card shadow-card' : 'border-line bg-card/60 hover:border-faint')}
                  >
                    <Icon size={18} strokeWidth={1.75} className={on ? 'text-accent' : 'text-faint'} />
                    <p className="mt-2 text-[13.5px] font-medium text-ink">{label}</p>
                    <p className="text-xs text-mid">{sub}</p>
                  </button>
                );
              })}
            </div>
          )}
        />
        <Field label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" placeholder="Ada Obi" {...register('name')} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" {...register('email')} />
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Creating account…' : 'Create account'}</Button>
      </form>
    </AuthShell>
  );
}
