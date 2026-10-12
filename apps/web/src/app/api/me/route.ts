import { getMe } from '@/server/store';
import { currentUser, fail, json } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  return json(getMe(user.id));
}
