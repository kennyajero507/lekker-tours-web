'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { telHref, secondaryNumber } from '@/lib/format';
import { wordmark } from '@/lib/branding';
import { isSafeHref } from '@/lib/siteContent';

const COUNTRIES = [
  { slug: 'kenya', label: 'Kenya' },
  { slug: 'tanzania', label: 'Tanzania' },
  { slug: 'uganda', label: 'Uganda' },
  { slug: 'rwanda', label: 'Rwanda' },
  { slug: 'zanzibar', label: 'Zanzibar' },
];

/** Public navigation only. /admin is deliberately absent and must stay that way. */
const NAV = [
  { href: '/', label: 'Home' },
  { href: '/destinations', label: 'Destinations', dropdown: COUNTRIES },
  { href: '/tours', label: 'Our Safaris' },
  { href: '/services', label: 'Services' },
  { href: '/blog', label: 'Journal' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
];

/**
 * A detached pill that floats over the hero: inset from the viewport edges,
 * fully rounded, translucent until the page scrolls.
 */
export function Header({
  phone,
  whatsapp,
  siteName,
  logoUrl,
  announcement,
}: {
  phone: string;
  whatsapp?: string;
  siteName: string;
  logoUrl: string;
  /** The admin-controlled announcement bar. Absent when switched off. */
  announcement?: { text: string; ctaLabel: string; ctaLink: string };
}) {
  const secondNumber = secondaryNumber(phone, whatsapp);
  const { primary, secondary } = wordmark(siteName);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const solid = scrolled || open;
  const announcementCta =
    announcement?.ctaLabel && isSafeHref(announcement.ctaLink) ? announcement : null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-8 md:pt-6">
      {/* Shown only at the top of the page: the header is fixed, and a bar that
          followed the visitor all the way down would cost a line of every
          screen for a message they have already read. */}
      {announcement && !scrolled && !open ? (
        <div className="mx-auto mb-2 flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-0.5 rounded-3xl bg-amber-500 px-5 py-1.5 text-center text-xs text-forest-950">
          <span>{announcement.text}</span>
          {announcementCta ? (
            <a
              href={announcementCta.ctaLink}
              className="shrink-0 font-medium underline underline-offset-2 hover:no-underline"
            >
              {announcementCta.ctaLabel} <span aria-hidden>→</span>
            </a>
          ) : null}
        </div>
      ) : null}

      <div
        className={`mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 rounded-full pl-4 pr-2.5 transition-all duration-500 ease-soft md:h-[4.2rem] md:gap-8 md:pl-7 md:pr-3.5 ${
          solid
            ? 'bg-forest-900/95 shadow-[0_12px_36px_-14px_rgba(0,0,0,0.6)] backdrop-blur-xl'
            : // A translucent bar over a bright photo leaves white text unreadable,
              // so the unscrolled state keeps a dark tint rather than near-clear white.
              'bg-forest-950/55 backdrop-blur-md'
        }`}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={`${siteName}, home`}
        >
          <Image
            src={logoUrl}
            alt={siteName}
            width={42}
            height={42}
            priority
            className="h-10 w-10 object-contain"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[1.05rem] text-white">{primary}</span>
            {secondary ? (
              <span className="mt-0.5 text-[0.46rem] uppercase tracking-[0.24em] text-amber-400">
                {secondary}
              </span>
            ) : null}
          </span>
        </Link>

        <nav ref={navRef} className="hidden items-center gap-3 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            if (!item.dropdown) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-full px-5 py-2.5 text-[0.88rem] transition-colors ${
                    active ? 'bg-white text-forest-900' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            }

            const isOpen = menu === item.href;
            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setMenu(item.href)}
                onMouseLeave={() => setMenu(null)}
              >
                <button
                  type="button"
                  onClick={() => setMenu(isOpen ? null : item.href)}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[0.88rem] transition-colors ${
                    active ? 'bg-white text-forest-900' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.label}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    aria-hidden
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                <div
                  hidden={!isOpen}
                  className="absolute left-1/2 top-full w-52 -translate-x-1/2 pt-3"
                >
                  <ul className="overflow-hidden rounded-2xl bg-white py-2 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)]">
                    <li>
                      <Link
                        href={item.href}
                        className="block px-5 py-2.5 text-[0.82rem] font-medium text-forest-900 transition-colors hover:bg-sand-50"
                      >
                        All destinations
                      </Link>
                    </li>
                    <li aria-hidden className="my-1 border-t border-sand-200" />
                    {item.dropdown.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/destinations/${c.slug}`}
                          className="block px-5 py-2.5 text-[0.82rem] text-muted transition-colors hover:bg-sand-50 hover:text-forest-900"
                        >
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <a
            href={`tel:${telHref(phone)}`}
            aria-label={`Call us on ${phone}`}
            title={secondNumber ? `${phone} or ${secondNumber}` : phone}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest-900 transition-all duration-300 hover:scale-105 hover:bg-amber-500 hover:text-forest-950 md:h-11 md:w-11"
          >
            <PhoneIcon />
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 md:h-11 md:w-11 lg:hidden"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300 ${
                  open ? 'top-2 rotate-45' : 'top-0'
                }`}
              />
              <span
                className={`absolute left-0 top-2 block h-0.5 w-5 bg-current transition-opacity duration-300 ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300 ${
                  open ? 'top-2 -rotate-45' : 'top-4'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="mx-auto mt-2 w-full max-w-6xl overflow-hidden rounded-3xl bg-forest-900 lg:hidden"
      >
        <nav className="flex flex-col px-6 py-3" aria-label="Mobile">
          {NAV.map((item) => (
            <div key={item.href} className="border-b border-white/5 last:border-0">
              <Link href={item.href} className="block py-3.5 text-sm text-sand-100 hover:text-amber-400">
                {item.label}
              </Link>
              {item.dropdown ? (
                <ul className="-mt-1 mb-3 flex flex-wrap gap-2">
                  {item.dropdown.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/destinations/${c.slug}`}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs text-sand-200 hover:bg-amber-500 hover:text-forest-950"
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
          <a
            href={`tel:${telHref(phone)}`}
            className="mt-3 inline-flex items-center gap-2 text-sm text-amber-400"
          >
            <PhoneIcon />
            {phone}
          </a>
          {secondNumber ? (
            <a
              href={`tel:${telHref(secondNumber)}`}
              className="mt-1 inline-flex items-center gap-2 pb-2 text-sm text-amber-400"
            >
              <PhoneIcon />
              {secondNumber}
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}
