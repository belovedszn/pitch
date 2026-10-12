import { upsertPitch } from '@/server/store';
import { currentUser, fail, json, parseBody } from '@/server/http';
import { pitchSchema } from '@/lib/schemas';

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  if (user.role !== 'founder') return fail('Only founders can publish a pitch', 403);
  const body = await parseBody(req, pitchSchema);
  if ('res' in body) return body.res;
  const pitch = upsertPitch(user.id, body.data);
  return pitch ? json(pitch) : fail('Not found', 404);
}
