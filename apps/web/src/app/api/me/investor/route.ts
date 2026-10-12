import { updateInvestor } from '@/server/store';
import { currentUser, fail, json, parseBody } from '@/server/http';
import { investorProfileSchema } from '@/lib/schemas';

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  if (user.role !== 'investor') return fail('Only investors have an investor profile', 403);
  const body = await parseBody(req, investorProfileSchema);
  if ('res' in body) return body.res;
  const investor = updateInvestor(user.id, body.data);
  return investor ? json(investor) : fail('Not found', 404);
}
