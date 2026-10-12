import { clearSessionCookie } from '@/server/session';
import { json } from '@/server/http';

export async function POST() {
  clearSessionCookie();
  return json({ ok: true });
}
