'use client';
import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
async function call(url: string, method: string, body?: unknown) {
  const r = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Request failed');
  return j;
}
export default function Home() {
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false); const [ok, setOk] = useState(false);
  async function go(kind: 'register' | 'login') {
    if (kind === 'register' && !ok) { setMsg('Please confirm you are 18+ and agree to the privacy terms.'); return; }
    setBusy(true); setMsg('');
    try {
      const o = await call(`/api/auth/${kind}`, 'POST');
      const r = kind === 'register' ? await startRegistration({ optionsJSON: o }) : await startAuthentication({ optionsJSON: o });
      await call(`/api/auth/${kind}`, 'PUT', r); location.href = '/app.html';
    } catch (e) { setMsg(e instanceof Error && e.name === 'NotAllowedError' ? 'Cancelled. Try again when ready.' : e instanceof Error ? e.message : 'Something went wrong'); }
    finally { setBusy(false); }
  }
  const btn = { minHeight: 52, borderRadius: 14, border: '1px solid #7FD1C0', fontSize: 17, fontWeight: 700, cursor: 'pointer', width: '100%' } as const;
  return (
    <main style={{ maxWidth: 440, margin: '0 auto', padding: '64px 20px' }}>
      <p style={{ color: '#7FD1C0', fontWeight: 800, fontSize: 22, margin: 0 }}>Clarity</p>
      <h1 style={{ fontSize: 34, lineHeight: 1.1, margin: '12px 0' }}>Rebuild your focus. Privately.</h1>
      <p style={{ color: '#9DB5B0' }}>No email, no name. Your account is a passkey on your device.</p>
      <label style={{ display: 'flex', gap: 10, margin: '24px 0', color: '#9DB5B0' }}>
        <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} style={{ width: 22, height: 22 }} />
        <span>I am 18 or older and agree to the Privacy Policy. ClarityHub is not a medical service.</span>
      </label>
      <button disabled={busy} onClick={() => go('register')} style={{ ...btn, background: '#7FD1C0', color: '#0D1A1E', marginBottom: 12 }}>Create private account</button>
      <button disabled={busy} onClick={() => go('login')} style={{ ...btn, background: 'transparent', color: '#7FD1C0' }}>Sign in with passkey</button>
      <p role="alert" style={{ color: '#F2B65B', minHeight: 24 }}>{msg}</p>
    </main>
  );
}
