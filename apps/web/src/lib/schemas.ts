import { z } from 'zod';
import { MATCH_STATUSES, REGIONS, SECTORS, STAGES } from './types';

export const roleSchema = z.enum(['founder', 'investor']);

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Tell us your name'),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  role: roleSchema,
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const demoSchema = z.object({ role: roleSchema });

export const startupProfileSchema = z.object({
  name: z.string().trim().min(2).max(60),
  tagline: z.string().trim().min(10, 'At least 10 characters').max(120),
  description: z.string().trim().min(40, 'Give investors at least a couple of sentences').max(1200),
  sector: z.enum(SECTORS),
  stage: z.enum(STAGES),
  region: z.enum(REGIONS),
  city: z.string().trim().min(2).max(60),
  foundedYear: z.coerce.number().int().min(2000).max(new Date().getFullYear()),
  teamSize: z.coerce.number().int().min(1).max(10_000),
  raising: z.coerce.number().int().min(10_000, 'Minimum $10,000').max(500_000_000),
  mrr: z.coerce.number().int().min(0),
  growthPct: z.coerce.number().min(-100).max(1000),
  users: z.coerce.number().int().min(0),
  website: z.string().trim().url('Enter a full URL, e.g. https://example.com').or(z.literal('')),
});
export type StartupProfileInput = z.infer<typeof startupProfileSchema>;

export const investorProfileSchema = z
  .object({
    firm: z.string().trim().min(2).max(60),
    title: z.string().trim().min(2).max(60),
    bio: z.string().trim().min(20).max(800),
    thesis: z.string().trim().min(20, 'Describe what you back in a sentence or two').max(600),
    stages: z.array(z.enum(STAGES)).min(1, 'Pick at least one stage'),
    sectors: z.array(z.enum(SECTORS)).min(1, 'Pick at least one sector'),
    regions: z.array(z.enum(REGIONS)).min(1, 'Pick at least one region'),
    checkMin: z.coerce.number().int().min(1_000),
    checkMax: z.coerce.number().int().min(1_000),
    portfolioCount: z.coerce.number().int().min(0),
    city: z.string().trim().min(2).max(60),
  })
  .refine((v) => v.checkMax >= v.checkMin, { message: 'Max check must be ≥ min check', path: ['checkMax'] });
export type InvestorProfileInput = z.infer<typeof investorProfileSchema>;

export const pitchSchema = z.object({
  headline: z.string().trim().min(10, 'At least 10 characters').max(100),
  problem: z.string().trim().min(20).max(400),
  solution: z.string().trim().min(20).max(400),
  traction: z.string().trim().min(10).max(300),
  ask: z.string().trim().min(10).max(300),
});
export type PitchInput = z.infer<typeof pitchSchema>;

export const discoverQuerySchema = z.object({
  q: z.string().trim().optional(),
  sector: z.enum(SECTORS).optional(),
  stage: z.enum(STAGES).optional(),
  region: z.enum(REGIONS).optional(),
  sort: z.enum(['score', 'recent']).default('score'),
});

export const expressInterestSchema = z.object({ targetId: z.string().min(1) });
export const matchUpdateSchema = z.object({ status: z.enum(MATCH_STATUSES) });
export const messageSchema = z.object({ body: z.string().trim().min(1).max(2000) });
