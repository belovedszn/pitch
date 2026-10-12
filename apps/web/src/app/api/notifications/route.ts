import { listNotifications, markAllRead } from '@/server/store';
import { currentUser, fail, json } from '@/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  return json({ data: listNotifications(user.id) });
}

export async function POST() {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  markAllRead(user.id);
  return json({ ok: true });
}
