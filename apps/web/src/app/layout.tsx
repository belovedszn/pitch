import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: { default: 'Pitchfirst — where founders and investors meet', template: '%s · Pitchfirst' },
  description:
    'Pitchfirst matches founders with investors who actually back what they build. Share a 60-second pitch, get matched on stage, sector and cheque size, and connect when interest is mutual.',
  openGraph: { title: 'Pitchfirst', description: 'Pitch first. Meet second.', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#f6f5f2' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
