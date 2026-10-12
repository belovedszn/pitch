import { updateMatchStatus } from '@/server/store';
import { currentUser, fail, json, parseBody } from '@/server/http';
import { matchUpdateSchema } from '@/lib/schemas';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  const body = await parseBody(req, matchUpdateSchema);
  if ('res' in body) return body.res;
  const match = updateMatchStatus(user, params.id, body.data.status);
  return match ? json(match) : fail('Match not found or transition not allowed', 404);
}
