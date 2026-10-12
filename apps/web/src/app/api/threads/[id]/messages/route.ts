import { getThreadMessages, sendMessage } from '@/server/store';
import { currentUser, fail, json, parseBody } from '@/server/http';
import { messageSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  const msgs = getThreadMessages(user, params.id);
  return msgs ? json({ data: msgs }) : fail('Thread not found', 404);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  const body = await parseBody(req, messageSchema);
  if ('res' in body) return body.res;
  const msg = sendMessage(user, params.id, body.data.body);
  return msg ? json(msg, { status: 201 }) : fail('Thread not found', 404);
}
