import { createUser, findUserByEmail } from '@/server/store';
import { setSessionCookie } from '@/server/session';
import { fail, json, parseBody } from '@/server/http';
import { signupSchema } from '@/lib/schemas';

export async function POST(req: Request) {
  const body = await parseBody(req, signupSchema);
  if ('res' in body) return body.res;
  if (findUserByEmail(body.data.email)) return fail('An account with this email already exists — sign in instead', 409);
  const user = createUser(body.data);
  await setSessionCookie(user.id);
  return json({ user }, { status: 201 });
}
