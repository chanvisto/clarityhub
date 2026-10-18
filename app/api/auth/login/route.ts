import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import { db } from '@/lib/firebase';
import { RP_ID, ORIGIN, setCookie, getCookie, startSession } from '@/lib/session';
export const runtime = 'nodejs';
export async function POST() {
  const o = await generateAuthenticationOptions({ rpID: RP_ID, userVerification: 'preferred' });
  await setCookie('ch_c', { ch: o.challenge }, 300);
  return Response.json(o);
}
export async function PUT(req: Request) {
  const c = await getCookie<{ ch: string }>('ch_c');
  if (!c) return Response.json({ error: 'Session expired. Try again.' }, { status: 400 });
  try {
    const body = await req.json();
    if (typeof body.id !== 'string' || !/^[\w-]+$/.test(body.id)) return Response.json({ error: 'Passkey not recognised' }, { status: 401 });
    const snap = await db.doc(`credentials/${body.id}`).get();
    if (!snap.exists) return Response.json({ error: 'Passkey not recognised' }, { status: 401 });
    const r = snap.data()!;
    const v = await verifyAuthenticationResponse({ response: body, expectedChallenge: c.ch, expectedOrigin: ORIGIN, expectedRPID: RP_ID,
      credential: { id: body.id, publicKey: new Uint8Array(Buffer.from(r.publicKey, 'base64url')), counter: Number(r.counter), transports: (r.transports ? r.transports.split(',') : []) as AuthenticatorTransportFuture[] } });
    if (!v.verified) return Response.json({ error: 'Verification failed' }, { status: 401 });
    await snap.ref.update({ counter: v.authenticationInfo.newCounter });
    await startSession(r.userId);
    return Response.json({ ok: true });
  } catch { return Response.json({ error: 'Sign-in failed' }, { status: 401 }); }
}
