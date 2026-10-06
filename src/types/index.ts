export type Status = 'draft' | 'published';
export type Country = 'Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda' | 'Zanzibar';
export type TourCategory = 'SafariExpedition' | 'WeekendEscape';

export interface ApiImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface Seo {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description?: string;
  activities: string[];
  meals: Array<'Breakfast' | 'Lunch' | 'Dinner'>;
  accommodation?: string;
}

export interface Tour {
  _id: string;
  id: string;
  title: string;
  slug: string;
  category: TourCategory;
  summary: string;
  description: string;
  priceFrom: number;
  currency: string;
  durationDays: number;
  durationNights: number;
  durationLabel: string;
  groupSizeMax: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  rating: number;
  reviewCount: number;
  destination?: Pick<Destination, '_id' | 'name' | 'slug' | 'country'> | string;
  countries: Country[];
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  heroImage: ApiImage;
  gallery: ApiImage[];
  featured: boolean;
  bestSelling: boolean;
  status: Status;
  order: number;
  seo?: Seo;
  /* discriminator fields */
  parks?: string[];
  gameDriveCount?: number;
  conservancyFeesIncluded?: boolean;
  departsFrom?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Park {
  name: string;
  slug?: string;
  blurb?: string;
  image?: ApiImage;
  bestTime?: string;
  highlights: string[];
}

export interface Destination {
  _id: string;
  id: string;
  name: string;
  slug: string;
  country: Country;
  tagline?: string;
  categoryLabel?: string;
  overview: string;
  heroImage: ApiImage;
  cardImage: ApiImage;
  highlights: string[];
  bestTime?: { months: string[]; note?: string };
  parks: Park[];
  parkCount: number;
  featured: boolean;
  status: Status;
  order: number;
  seo?: Seo;
}

export interface BlogPost {
  _id: string;
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: ApiImage;
  author: { name: string; avatar?: string };
  tags: string[];
  readingMinutes: number;
  publishedAt: string;
  featured: boolean;
  status: Status;
  seo?: Seo;
}

export interface Testimonial {
  _id: string;
  id: string;
  authorName: string;
  authorLocation?: string;
  avatar?: { url?: string; alt?: string };
  quote: string;
  rating: number;
  tourName?: string;
  featured: boolean;
  status: Status;
  order: number;
}

export interface Faq {
  _id: string;
  id: string;
  question: string;
  answer: string;
  group: 'general' | 'booking' | 'travel' | 'payment';
  order: number;
  status: Status;
}

export interface SiteBranding {
  siteName: string;
  logoUrl: string;
  /** Blank means the main logo is used in the footer too. */
  footerLogoUrl: string;
  /** Blank means the main logo doubles as the favicon. */
  faviconUrl: string;
}

export interface AboutPageSettings {
  title: string;
  subtitle: string;
  missionStatement: string;
  visionStatement: string;
  /** Sanitised by the API. Blank shows the built-in company overview. */
  storyHtml: string;
  heroImageUrl: string;
  stats: Array<{ value: string; label: string }>;
}

export interface ServicesPageSettings {
  title: string;
  subtitle: string;
  introText: string;
  bannerImageUrl: string;
  /** `icon` names one of the shared icons; a card without one shows its number. */
  servicesList: Array<{ title: string; description: string; icon?: string }>;
}

/**
 * The headline, intro and banner are the Contact page's own. The remaining
 * fields are overrides: blank defers to the counterpart in `contact`.
 */
export interface ContactPageSettings {
  inquiryHeadline: string;
  inquiryIntro: string;
  bannerImageUrl: string;
  address: string;
  workingHours: string;
  mapEmbedUrl: string;
  inquiryEmail: string;
}

/** The announcement bar above the header on every public page. */
export interface AnnouncementBanner {
  active: boolean;
  announcementText: string;
  ctaLabel: string;
  ctaLink: string;
}

export interface FooterSettings {
  /** Follows "© <year>". Blank shows "<site name>. All rights reserved." */
  copyrightText: string;
  quickLinks: Array<{ label: string; href: string }>;
}

export interface SiteSettings {
  branding: SiteBranding;
  footer: FooterSettings;
  aboutPage: AboutPageSettings;
  servicesPage: ServicesPageSettings;
  contactPage: ContactPageSettings;
  banner: AnnouncementBanner;
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: ApiImage;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    /** Crossfaded to after `backgroundImage`. Empty means a still hero. */
    slides: ApiImage[];
  };
  values: Array<{ title: string; description: string; icon?: string }>;
  contact: {
    phone: string;
    whatsapp?: string;
    email: string;
    addressLine: string;
    poBox?: string;
    city: string;
    supportHours: string;
  };
  socials: Partial<Record<'facebook' | 'instagram' | 'x' | 'youtube' | 'tiktok', string>>;
  newsletter: { heading: string; blurb: string };
  /** The homepage film. Empty until an admin sets one; a placeholder shows instead. */
  video: { youtubeId?: string };
  footerBlurb: string;
  seo: { defaultTitle: string; defaultDescription: string; ogImage?: string };
}

export interface Enquiry {
  _id: string;
  id: string;
  type: 'contact' | 'booking';
  name: string;
  email: string;
  phone?: string;
  expeditionInterest?: string;
  budgetUSD?: number;
  message?: string;
  tour?: { _id: string; title: string; slug: string } | string;
  tourTitle?: string;
  travelDate?: string;
  guests?: { adults: number; children: number; infants: number };
  totalGuests?: number | null;
  status: EnquiryStatus;
  adminNotes?: string;
  createdAt: string;

  /** Human-readable handle, e.g. "ENQ-2609-0042". */
  reference?: string;

  assignee?: AdminSummary | null;
  assignedAt?: string | null;

  lastContactedAt?: string | null;
  followUpAt?: string | null;
  closedAt?: string | null;

  /** Computed by the API: past its follow-up date and still open. */
  isOverdue?: boolean;

  /** Present on the detail response only, newest first. */
  events?: EnquiryEvent[];
}

/** The enquiry pipeline, in order. `won`/`lost` are terminal. */
export type EnquiryStatus = 'new' | 'assigned' | 'in_progress' | 'quoted' | 'won' | 'lost';

export interface AdminSummary {
  _id: string;
  id: string;
  name: string;
  email: string;
}

export type EnquiryEventType =
  | 'created'
  | 'status_change'
  | 'assigned'
  | 'unassigned'
  | 'note'
  | 'contacted';

export interface EnquiryEvent {
  _id: string;
  id: string;
  type: EnquiryEventType;
  /** Null for the public form's `created` entry. */
  actorName?: string | null;
  summary: string;
  note?: string | null;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  /**
   * Enquiry list only. `unassignedCount` is work nobody has picked up and
   * `overdueCount` is work past its follow-up date; together they replace the
   * old `unreadCount`, which counted mail nobody had opened rather than work
   * nobody had done.
   */
  statusCounts?: Partial<Record<EnquiryStatus, number>>;
  unassignedCount?: number;
  overdueCount?: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

export interface ApiFailure {
  success: false;
  error: { message: string; code: string; details?: Record<string, string> };
}

/* ---------- admin users, roles and audit ---------- */

export interface PermissionDef {
  key: string;
  label: string;
  hint?: string;
}

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: PermissionDef[];
}

export interface Role {
  _id: string;
  id: string;
  name: string;
  description: string;
  permissions: string[];
  /** The Administrator role: always holds everything and cannot be edited. */
  locked: boolean;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  _id: string;
  id: string;
  email: string;
  name: string;
  role: { id: string; name: string; locked: boolean } | null;
  roleId: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  _id: string;
  id: string;
  actorId: string | null;
  actorEmail: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  targetLabel: string | null;
  changes: { before?: Record<string, unknown>; after?: Record<string, unknown> };
  ip: string | null;
  createdAt: string;
}

/** Shape returned by /api/auth/me, drives what the dashboard shows. */
export interface CurrentAdmin {
  _id: string;
  id: string;
  email: string;
  name: string;
  roleName: string | null;
  permissions: string[];
  lastLoginAt?: string | null;
}
