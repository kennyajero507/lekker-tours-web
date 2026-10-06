import Link from 'next/link';
import Image from 'next/image';
import { getSettings } from '@/lib/settings';
import { resolveBranding } from '@/lib/branding';

export default async function NotFound() {
  const { siteName, logoUrl } = resolveBranding(await getSettings());

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-forest-950 px-4 text-center">
      <Image
        src={logoUrl}
        alt={siteName}
        width={96}
        height={96}
        className="mb-8 h-24 w-24 object-contain"
      />
      <p className="mb-4 text-xs uppercase tracking-[0.28em] text-amber-400">404</p>
      <h1 className="mb-4 text-3xl text-sand-50 md:text-4xl">This track leads nowhere</h1>
      <p className="mb-9 max-w-md text-sm leading-relaxed text-sand-200/70">
        The page you are looking for has moved or never existed. Let us get you back to the plains.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full bg-amber-500 px-6 text-sm font-medium text-forest-950 transition-colors hover:bg-amber-400"
        >
          Back to home
        </Link>
        <Link
          href="/tours"
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/40 px-6 text-sm text-sand-50 transition-colors hover:bg-white hover:text-forest-900"
        >
          Browse expeditions
        </Link>
      </div>
    </div>
  );
}
