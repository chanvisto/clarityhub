import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import { db } from '@/lib/firebase';
import { RP_ID, ORIGIN, b64, setCookie, getCookie, startSession } from '@/lib/session';
export const runtime = 'nodejs';
export async function POST() {
  const uid = crypto.randomUUID();
  const o = await generateRegistrationOptions({ rpName: 'ClarityHub', rpID: RP_ID, userName: 'ch-' + uid.slice(0, 6), userID: new TextEncoder().encode(uid), attestationType: 'none', authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' } });
  await setCookie('ch_c', { ch: o.challenge, uid }, 300);
  return Response.json(o);
}
export async function PUT(req: Request) {
  const c = await getCookie<{ ch: string; uid: string }>('ch_c');
  if (!c) return Response.json({ error: 'Session expired. Try again.' }, { status: 400 });
  try {
    const v = await verifyRegistrationResponse({ response: await req.json(), expectedChallenge: c.ch, expectedOrigin: ORIGIN, expectedRPID: RP_ID });
    if (!v.verified || !v.registrationInfo) return Response.json({ error: 'Verification failed' }, { status: 401 });
    const cr = v.registrationInfo.credential;
    const batch = db.batch();
    batch.create(db.doc(`users/${c.uid}`), { handle: 'ch-' + c.uid.slice(0, 6), createdAt: Date.now() });
    batch.create(db.doc(`credentials/${cr.id}`), { userId: c.uid, publicKey: b64(cr.publicKey), counter: cr.counter, transports: (cr.transports ?? []).join(',') });
    await batch.commit();
    await startSession(c.uid);
    return Response.json({ ok: true });
  } catch { return Response.json({ error: 'Could not create account' }, { status: 400 }); }
}
