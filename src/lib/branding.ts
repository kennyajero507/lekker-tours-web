import type { SiteBranding, SiteSettings } from '@/types';

export const DEFAULT_BRANDING: SiteBranding = {
  siteName: 'Lekker Tours and Travel',
  logoUrl: '/logo.png',
  footerLogoUrl: '',
  faviconUrl: '',
};

/**
 * The branding to actually render: every blank resolved to something usable.
 *
 * A cleared logo falls back to the bundled one rather than leaving an empty
 * <Image src="">, which throws, and the footer logo and favicon fall back to
 * the main logo so an admin only has to upload one file.
 */
export function resolveBranding(settings: Pick<SiteSettings, 'branding'>): SiteBranding {
  const branding = { ...DEFAULT_BRANDING, ...(settings.branding ?? {}) };
  const logoUrl = branding.logoUrl || DEFAULT_BRANDING.logoUrl;

  return {
    siteName: branding.siteName || DEFAULT_BRANDING.siteName,
    logoUrl,
    footerLogoUrl: branding.footerLogoUrl || logoUrl,
    faviconUrl: branding.faviconUrl || logoUrl,
  };
}

/**
 * Splits the site name for the two-line wordmark beside the logo: the first
 * word set large, the rest as the small caps line under it.
 */
export function wordmark(siteName: string): { primary: string; secondary: string } {
  const [primary, ...rest] = siteName.trim().split(/\s+/);
  return { primary: primary ?? '', secondary: rest.join(' ') };
}
