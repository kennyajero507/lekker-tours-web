import { apiGet } from './api';
import { TAGS } from './tags';
import { DEFAULT_BRANDING } from './branding';
import {
  DEFAULT_ABOUT_PAGE,
  DEFAULT_BANNER,
  DEFAULT_CONTACT_PAGE,
  DEFAULT_FOOTER,
  DEFAULT_HERO_SLIDES,
  DEFAULT_SERVICES_PAGE,
  withSettingsDefaults,
} from './siteContent';
import type { SiteSettings } from '@/types';

/**
 * Fallback used only when the API is unreachable, so the shell still renders
 * with correct contact details rather than collapsing into an error page.
 */
const FALLBACK: SiteSettings = {
  branding: DEFAULT_BRANDING,
  aboutPage: DEFAULT_ABOUT_PAGE,
  servicesPage: DEFAULT_SERVICES_PAGE,
  contactPage: DEFAULT_CONTACT_PAGE,
  banner: DEFAULT_BANNER,
  footer: DEFAULT_FOOTER,
  hero: {
    title: 'Feel the Pulse of the African Wilderness',
    subtitle:
      'Expertly curated expeditions from the heart of Nairobi to the legendary golden plains.',
    backgroundImage: {
      url: '/images/mara-wildebeest-migration.jpg',
      alt: 'Wildebeest crossing the Maasai Mara plains',
    },
    primaryCta: { label: 'Explore Expeditions', href: '/tours' },
    secondaryCta: { label: 'Plan My Trip', href: '/contact' },
    slides: DEFAULT_HERO_SLIDES,
  },
  values: [],
  contact: {
    phone: '+254 182 308 871',
    whatsapp: '+254 182 308 872',
    email: 'lekkertours@gmail.com',
    addressLine: 'Agip House, Haile Selassie Avenue',
    poBox: 'P.O Box 13689-00200',
    city: 'Nairobi, Kenya',
    supportHours: 'We aim to respond to enquiries as quickly as practical',
  },
  socials: {},
  // No video in the fallback: if the API is down we cannot know which film the
  // admin chose, and the placeholder is the honest thing to show.
  video: {},
  newsletter: {
    heading: 'Stories from the bush',
    blurb: 'Occasional dispatches on wildlife, seasons and new expeditions. No noise.',
  },
  footerBlurb:
    'Bringing the pulse of the African wilderness to life through expertly curated expeditions. Based in Nairobi, serving East Africa with excellence.',
  seo: {
    defaultTitle: 'Lekker Tours and Travel',
    defaultDescription:
      'Expertly curated safari expeditions and weekend escapes across East Africa, from our base in Nairobi.',
  },
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    return withSettingsDefaults(
      await apiGet<SiteSettings>('/api/settings', { tags: [TAGS.settings] })
    );
  } catch (err) {
    console.error('[settings] falling back to defaults:', (err as Error).message);
    return FALLBACK;
  }
}
