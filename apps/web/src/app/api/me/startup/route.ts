import { updateStartup } from '@/server/store';
import { currentUser, fail, json, parseBody } from '@/server/http';
import { startupProfileSchema } from '@/lib/schemas';

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  if (user.role !== 'founder') return fail('Only founders have a startup profile', 403);
  const body = await parseBody(req, startupProfileSchema);
  if ('res' in body) return body.res;
  const startup = updateStartup(user.id, body.data);
  return startup ? json(startup) : fail('Not found', 404);
}
