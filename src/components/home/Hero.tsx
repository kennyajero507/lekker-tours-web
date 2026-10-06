import { ButtonLink } from '@/components/ui/Button';
import { HeroSlideshow } from './HeroSlideshow';
import type { SiteSettings } from '@/types';

/**
 * Left-aligned copy over a crossfading full-bleed background, sized so the
 * section below is visible without scrolling far.
 *
 * Slide one is the background image set in Site Settings and the rest are the
 * slides set beside it, so the whole rotation is content-managed.
 */
export function Hero({ hero, socials }: { hero: SiteSettings['hero']; socials?: SiteSettings['socials'] }) {
  const links = Object.entries(socials ?? {}).filter(([, url]) => Boolean(url));

  // Blank and repeated URLs are dropped: next/image throws on an empty src,
  // and the slideshow keys each slide by its URL.
  const seen = new Set<string>([hero.backgroundImage.url]);
  const rotation = (hero.slides ?? []).filter((slide) => {
    if (!slide.url || seen.has(slide.url)) return false;
    seen.add(slide.url);
    return true;
  });

  const slides = [
    { url: hero.backgroundImage.url, alt: hero.backgroundImage.alt },
    ...rotation.map((slide) => ({ url: slide.url, alt: slide.alt ?? '' })),
  ];

  return (
    <section className="relative flex min-h-[85svh] items-center overflow-hidden md:min-h-screen">
      <HeroSlideshow slides={slides} />

      {/* Weighted left, where the copy sits, so the photograph stays visible on the right. */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-forest-950/78 via-forest-950/40 to-transparent" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />

      <div className="container-page relative z-10 pt-28 md:pt-24">
        <div className="max-w-2xl">
          <p className="mb-4 text-[0.68rem] uppercase tracking-[0.32em] text-amber-400">
            Explore · Discover · Experience
          </p>

          <h1 className="font-display text-[1.75rem] leading-[1.15] text-white xs:text-[2.1rem] sm:text-5xl sm:leading-[1.1] lg:text-[3.6rem]">
            {hero.title}
          </h1>

          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-sand-100/85 sm:mt-5 sm:text-base">
            {hero.subtitle}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <ButtonLink href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="outline-light" size="lg">
              {hero.secondaryCta.label}
            </ButtonLink>
          </div>

          {/* Inline beneath the CTAs on small screens; the rail below takes over at md. */}
          {links.length > 0 ? (
            <ul className="mt-8 flex items-center gap-2.5 md:hidden">
              {links.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL_LABELS[key] ?? key}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/45 text-white transition-all duration-300 hover:border-amber-500 hover:bg-amber-500 hover:text-forest-950"
                  >
                    {SOCIAL_ICONS[key] ?? <GlobeIcon />}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* Vertical rail on the right edge from md up, where there is room beside the copy. */}
      {links.length > 0 ? (
        <ul className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-3 md:flex lg:right-7">
          {links.map(([key, url]) => (
            <li key={key}>
              <a
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={SOCIAL_LABELS[key] ?? key}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/45 text-white transition-all duration-300 hover:scale-110 hover:border-amber-500 hover:bg-amber-500 hover:text-forest-950"
              >
                {SOCIAL_ICONS[key] ?? <GlobeIcon />}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
    </svg>
  ),
  instagram: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.2 2H21l-6.5 7.4L22 22h-6l-4.7-6.2L5.9 22H3l7-8L2 2h6.2l4.2 5.6L18.2 2Zm-1 18h1.6L7.9 3.7H6.2L17.2 20Z" />
    </svg>
  ),
  youtube: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.5A2.5 2.5 0 0 0 2.4 7.3C2 8.8 2 12 2 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.5a2.5 2.5 0 0 0 1.8-1.8C22 15.2 22 12 22 12ZM10 15V9l5 3-5 3Z" />
    </svg>
  ),
  tiktok: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 3c.3 2.2 1.7 3.7 3.9 3.9v2.7c-1.4.1-2.7-.3-3.9-1.1v5.9c0 3.4-2.6 5.6-5.6 5.6A5.6 5.6 0 0 1 10.4 8.9v2.9a2.7 2.7 0 1 0 2.7 2.7V3H16Z" />
    </svg>
  ),
};

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
    </svg>
  );
}
