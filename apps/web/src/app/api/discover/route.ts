import { discover } from '@/server/store';
import { currentUser, fail, json } from '@/server/http';
import { discoverQuerySchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  // treat empty strings from the filter UI as "unset"
  for (const k of Object.keys(params)) if (params[k] === '') delete params[k];
  const parsed = discoverQuerySchema.safeParse(params);
  if (!parsed.success) return fail('Invalid filters', 422);
  return json(discover(user, parsed.data));
}
