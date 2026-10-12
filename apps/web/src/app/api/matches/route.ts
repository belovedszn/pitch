import { expressInterest, listMatches } from '@/server/store';
import { currentUser, fail, json, parseBody } from '@/server/http';
import { expressInterestSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  return json({ data: listMatches(user) });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  const body = await parseBody(req, expressInterestSchema);
  if ('res' in body) return body.res;
  const result = expressInterest(user, body.data.targetId);
  return result.ok ? json({ match: result.match, mutual: result.mutual }) : fail(result.error, result.status);
}
