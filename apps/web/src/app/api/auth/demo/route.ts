import { findDemoUser } from '@/server/store';
import { setSessionCookie } from '@/server/session';
import { fail, json, parseBody } from '@/server/http';
import { demoSchema } from '@/lib/schemas';

export async function POST(req: Request) {
  const body = await parseBody(req, demoSchema);
  if ('res' in body) return body.res;
  const user = findDemoUser(body.data.role);
  if (!user) return fail('Demo account unavailable', 500);
  await setSessionCookie(user.id);
  return json({ user });
}
