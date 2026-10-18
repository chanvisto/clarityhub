import { cookies } from 'next/headers';
import { db } from '@/lib/firebase';
import { userId } from '@/lib/session';
export const runtime = 'nodejs';
export async function DELETE() {
  const uid = await userId(); if (!uid) return Response.json({ error: 'auth' }, { status: 401 });
  const creds = await db.collection('credentials').where('userId', '==', uid).get();
  const b = db.batch();
  creds.forEach((d) => b.delete(d.ref));
  b.delete(db.doc(`vault/${uid}`)); b.delete(db.doc(`users/${uid}`));
  await b.commit();
  (await cookies()).delete('ch_s');
  return Response.json({ ok: true });
}
