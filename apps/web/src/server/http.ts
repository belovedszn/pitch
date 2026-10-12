import { NextResponse } from 'next/server';
import type { ZodTypeAny, z } from 'zod';
import { getSessionUserId } from './session';
import { getUser } from './store';
import type { User } from '@/lib/types';

export const json = <T,>(data: T, init?: ResponseInit) => NextResponse.json(data, init);
export const fail = (error: string, status = 400, fields?: Record<string, string[] | undefined>) =>
  NextResponse.json({ error, ...(fields ? { fields } : {}) }, { status });

export async function currentUser(): Promise<User | null> {
  const id = await getSessionUserId();
  return id ? getUser(id) ?? null : null;
}

/** Parse + validate a JSON body. Returns the data or a ready-to-return 400 response. */
export async function parseBody<S extends ZodTypeAny>(req: Request, schema: S): Promise<{ data: z.infer<S> } | { res: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { res: fail('Invalid JSON body') };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { res: fail('Validation failed', 422, parsed.error.flatten().fieldErrors as Record<string, string[]>) };
  }
  return { data: parsed.data };
}
