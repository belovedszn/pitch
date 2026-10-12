import { findUserByEmail } from '@/server/store';
import { setSessionCookie } from '@/server/session';
import { fail, json, parseBody } from '@/server/http';
import { loginSchema } from '@/lib/schemas';

/** Passwordless demo login. In production replace with an emailed magic link (see README). */
export async function POST(req: Request) {
  const body = await parseBody(req, loginSchema);
  if ('res' in body) return body.res;
  const user = findUserByEmail(body.data.email);
  if (!user) return fail('No account found for that email', 404);
  await setSessionCookie(user.id);
  return json({ user });
}
