import { db } from '@/lib/firebase';
import { userId } from '@/lib/session';
export const runtime = 'nodejs';
const MAX = 900_000; // Firestore documents max out at 1 MiB
export async function GET() {
  const uid = await userId(); if (!uid) return Response.json({ error: 'auth' }, { status: 401 });
  const s = await db.doc(`vault/${uid}`).get();
  return Response.json({ blob: s.exists ? s.data()!.blob : null, version: s.exists ? s.data()!.version : 0 });
}
export async function PUT(req: Request) {
  const uid = await userId(); if (!uid) return Response.json({ error: 'auth' }, { status: 401 });
  const { blob, version } = await req.json().catch(() => ({}));
  if (typeof blob !== 'string' || Buffer.byteLength(blob) > MAX || !Number.isInteger(version)) return Response.json({ error: 'bad request' }, { status: 400 });
  const ref = db.doc(`vault/${uid}`);
  const nv = await db.runTransaction(async (t) => {
    const s = await t.get(ref);
    const cur = s.exists ? (s.data()!.version as number) : 0;
    if (cur !== version) return null;
    t.set(ref, { blob, version: cur + 1, updatedAt: Date.now() });
    return cur + 1;
  });
  return nv ? Response.json({ version: nv }) : Response.json({ error: 'conflict' }, { status: 409 });
}
