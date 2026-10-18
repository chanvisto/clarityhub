# ClarityHub web app (Next.js + Firebase Firestore, passkey login)
No email or name is collected. Firestore is accessed only from the server (Admin SDK); client access is denied by `firestore.rules`.

## Run locally
1. `cp .env.example .env.local` and fill the six values (see the setup guide).
2. `npm install && npm run dev`, then open http://localhost:3000

## Deploy (Vercel)
Add the same six environment variables in Vercel (`RP_ID` = your domain, `ORIGIN` = `https://your-domain`). Passkeys need HTTPS; changing `RP_ID` later locks users out.

## Known gaps before public launch
- Vault is plaintext JSON until stage 3 (client-side encryption + recovery phrase). Do not market as end-to-end encrypted yet.
- Passkey-only: a lost device means a lost account until recovery ships.
- Add rate limiting on `/api/auth/*`; write Privacy Policy and Terms; get clinical review; run a security test.
- On a sync conflict (409) the server copy replaces local changes.
