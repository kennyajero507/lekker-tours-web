import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { getSettings } from '@/lib/settings';
import { resolveBranding } from '@/lib/branding';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

/** The site name and favicon are admin-editable, so the metadata comes from settings. */
export async function generateMetadata(): Promise<Metadata> {
  const { siteName, faviconUrl } = resolveBranding(await getSettings());

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: {
      default: `${siteName}: Safari Expeditions across East Africa`,
      template: `%s | ${siteName}`,
    },
    description:
      'Expertly curated safari expeditions and weekend escapes across Kenya, Tanzania, Uganda, Rwanda and Zanzibar, from our base in Nairobi.',
    icons: { icon: faviconUrl },
    openGraph: {
      type: 'website',
      siteName,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
