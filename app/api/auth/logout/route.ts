import { cookies } from 'next/headers';
export async function POST() { (await cookies()).delete('ch_s'); return Response.json({ ok: true }); }
