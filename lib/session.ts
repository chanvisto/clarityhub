import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const key = () => new TextEncoder().encode(process.env.SESSION_SECRET!);
export const RP_ID = process.env.RP_ID!;
export const ORIGIN = process.env.ORIGIN!;
export const b64 = (u: Uint8Array) => Buffer.from(u).toString('base64url');
export async function setCookie(name: string, payload: Record<string, unknown>, ttl: number) {
  const t = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(`${ttl}s`).sign(key());
  (await cookies()).set(name, t, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: ttl });
}
export async function getCookie<T>(name: string): Promise<T | null> {
  try { const v = (await cookies()).get(name)?.value; return v ? ((await jwtVerify(v, key())).payload as T) : null; } catch { return null; }
}
export async function userId() { return (await getCookie<{ uid: string }>('ch_s'))?.uid ?? null; }
export const startSession = (uid: string) => setCookie('ch_s', { uid }, 60 * 60 * 24 * 30);
