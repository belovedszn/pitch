import { recordPitchView } from '@/server/store';
import { currentUser, fail, json } from '@/server/http';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return fail('Unauthorized', 401);
  if (user.role === 'investor') recordPitchView(params.id);
  return json({ ok: true });
}
