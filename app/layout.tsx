import type { ReactNode } from 'react';
export const metadata = { title: 'ClarityHub', description: 'Private recovery and focus companion' };
export default function Root({ children }: { children: ReactNode }) {
  return <html lang="en"><body style={{ margin: 0, background: '#0D1A1E', color: '#E8F1EE', font: '16px/1.5 system-ui,sans-serif' }}>{children}</body></html>;
}
