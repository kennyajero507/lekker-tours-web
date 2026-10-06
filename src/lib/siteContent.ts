import { DEFAULT_BRANDING } from './branding';
import type {
  AboutPageSettings,
  AnnouncementBanner,
  ApiImage,
  ContactPageSettings,
  FooterSettings,
  ServicesPageSettings,
  SiteSettings,
} from '@/types';

/**
 * Defaults for the admin-editable page sections. Kept in step with
 * api/src/config/siteSettingsDefaults.js: these are what renders when the API
 * is unreachable, or is an older build that does not send a section at all.
 */
export const DEFAULT_ABOUT_PAGE: AboutPageSettings = {
  title: 'About Lekker Tours and Travel',
  subtitle: 'Explore • Discover • Experience',
  missionStatement:
    'To design and coordinate accessible, enjoyable and well-organised travel experiences by combining local destination knowledge, responsive customer service and carefully selected travel partners.',
  visionStatement:
    'To become a trusted and customer-focused travel company known for memorable experiences, dependable service and meaningful connections across Kenya and East Africa.',
  storyHtml: '',
  heroImageUrl: '/images/maasai-warriors-landscape.jpg',
  stats: [],
};

export const DEFAULT_SERVICES_PAGE: ServicesPageSettings = {
  title: 'Our Services',
  subtitle: 'Tours, safaris, holidays and travel services: planned and coordinated from Nairobi.',
  introText:
    'Whether it is a weekend safari, a family holiday, a group excursion, a beach escape, an airport transfer or a tailor-made itinerary, our goal is to be one dependable point of contact from planning to completion.',
  bannerImageUrl: '/images/mara-herd-safari.jpg',
  // The company profile's service portfolio, in the profile's own order.
  servicesList: [
    {
      title: 'East Africa Safaris',
      description:
        "Tailor-made and packaged safaris to the leading wildlife destinations of Kenya, Tanzania, Uganda and Rwanda, matched to the traveller's time, interests and budget",
    },
    {
      title: 'Holiday Packages',
      description:
        'Domestic and regional holidays covering safari, beach, city, nature, family and special-occasion travel.',
    },
    {
      title: 'Custom Tours & Excursions',
      description:
        'Private day trips, weekend getaways, cultural experiences, nature activities and personalised itineraries.',
    },
    {
      title: 'Airport Transfers',
      description:
        'Pre-arranged airport pickup and drop-off coordination for individuals, families, groups and corporate travellers.',
    },
    {
      title: 'Accommodation Booking',
      description:
        'Assistance with selecting and arranging hotels, lodges, camps and other suitable accommodation.',
    },
    {
      title: 'Group Travel',
      description:
        'Travel planning for schools, churches, families, social groups, clubs, companies and other organised groups.',
    },
    {
      title: 'Corporate & Business Travel',
      description:
        'Travel coordination for meetings, retreats, conferences, staff movements and business trips.',
    },
    {
      title: 'Transport & Ground Logistics',
      description:
        'Coordination of suitable vehicles, drivers, transfers and ground movement according to itinerary requirements.',
    },
    {
      title: 'International & Regional Travel',
      description:
        'Travel planning beyond Kenya through suitable airline, hotel and destination partners, where required.',
    },
    {
      title: 'Ticketing & Reservations',
      description:
        "Arrangement of domestic, regional and international flight tickets, SGR and long-distance bus tickets, and park entry, event and activity bookings. We handle date changes, reissues and confirmations, and keep every ticket aligned to the traveller's itinerary so connections, transfers and accommodation fit together without gaps.",
    },
    {
      title: 'Visa & Travel Documentation',
      description:
        'Guidance on visa requirements, eTA and entry permits, passport validity and supporting documents for travel into and out of Kenya and the wider region.',
    },
    {
      title: 'Travel Insurance',
      description:
        'Arrangement of suitable travel insurance through licensed partners, covering medical emergencies, evacuation, trip cancellation and lost baggage.',
    },
  ],
};

export const DEFAULT_CONTACT_PAGE: ContactPageSettings = {
  inquiryHeadline: 'Start Your Journey',
  inquiryIntro:
    'From the first enquiry to the final sunset of your tour, our Nairobi specialists are ready to craft your expedition.',
  bannerImageUrl: '/images/balloon-mara-dawn.jpg',
  address: '',
  workingHours: '',
  mapEmbedUrl: '',
  inquiryEmail: '',
};

export const DEFAULT_BANNER: AnnouncementBanner = {
  active: false,
  announcementText: '',
  ctaLabel: '',
  ctaLink: '',
};

export const DEFAULT_FOOTER: FooterSettings = {
  copyrightText: '',
  quickLinks: [
    { label: 'Our Safaris', href: '/tours' },
    { label: 'Weekend Escapes', href: '/tours?category=WeekendEscape' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Services', href: '/services' },
    { label: 'Journal', href: '/blog' },
    { label: 'About Us', href: '/about' },
    { label: 'Partnerships', href: '/partners' },
    { label: 'Contact Us', href: '/contact' },
  ],
};

/** The images the homepage hero crossfades to after its main background image. */
export const DEFAULT_HERO_SLIDES: ApiImage[] = [
  { url: '/images/mara-lions-stalking.jpg', alt: 'Lions moving through long grass in the Maasai Mara' },
  { url: '/images/amboseli-elephant-kilimanjaro.jpg', alt: 'An elephant on the savanna with Kilimanjaro behind' },
  { url: '/images/balloon-mara-sunrise.jpg', alt: 'Hot air balloons rising over the plains at sunrise' },
  { url: '/images/serengeti-zebra-wildebeest.jpg', alt: 'Zebra and wildebeest grazing across open grassland' },
];

/** A list the API left out, or sent as something else, falls back to its default. */
function list<T>(value: T[] | undefined, fallback: T[]): T[] {
  return Array.isArray(value) ? value : fallback;
}

/** Fills any section or key the API left out, so consumers can read every field. */
export function withSettingsDefaults(settings: SiteSettings): SiteSettings {
  const aboutPage = { ...DEFAULT_ABOUT_PAGE, ...(settings.aboutPage ?? {}) };
  const servicesPage = { ...DEFAULT_SERVICES_PAGE, ...(settings.servicesPage ?? {}) };
  const footer = { ...DEFAULT_FOOTER, ...(settings.footer ?? {}) };

  return {
    ...settings,
    branding: { ...DEFAULT_BRANDING, ...(settings.branding ?? {}) },
    hero: { ...settings.hero, slides: list(settings.hero?.slides, DEFAULT_HERO_SLIDES) },
    aboutPage: { ...aboutPage, stats: list(aboutPage.stats, []) },
    servicesPage: {
      ...servicesPage,
      servicesList: list(servicesPage.servicesList, DEFAULT_SERVICES_PAGE.servicesList),
    },
    contactPage: { ...DEFAULT_CONTACT_PAGE, ...(settings.contactPage ?? {}) },
    banner: { ...DEFAULT_BANNER, ...(settings.banner ?? {}) },
    footer: { ...footer, quickLinks: list(footer.quickLinks, DEFAULT_FOOTER.quickLinks) },
  };
}

/**
 * The API enforces both of these on save. They are repeated at the point of
 * rendering because a link or an iframe source is not something to take on
 * trust from a database row.
 */
export function isSafeHref(href: string): boolean {
  return /^(\/(?!\/)|https?:\/\/|mailto:|tel:)/i.test(href);
}

const MAP_EMBED_PREFIXES = [
  'https://www.google.com/maps/embed',
  'https://maps.google.com/maps',
  'https://www.openstreetmap.org/export/embed.html',
];

export function isAllowedMapEmbed(url: string): boolean {
  return MAP_EMBED_PREFIXES.some((prefix) => url.startsWith(prefix));
}
