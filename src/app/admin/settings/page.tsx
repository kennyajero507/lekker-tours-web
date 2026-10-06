'use client';

import { useEffect, useRef, useState } from 'react';
import { adminApi, AdminApiError } from '@/lib/adminApi';
import { useUnsavedChangesGuard } from '@/lib/useUnsavedChanges';
import {
  TextField,
  TextArea,
  CheckboxField,
  FormSection,
  FormActions,
} from '@/components/admin/FormControls';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { FormError } from '@/components/admin/FormError';
import { RichTextField } from '@/components/admin/RichTextField';
import { useToast } from '@/components/admin/Toasts';
import { withSettingsDefaults } from '@/lib/siteContent';
import type { SiteSettings } from '@/types';

/**
 * Mirrors the caps in api/src/validators/settings.validator.js. Enforcing them
 * in the inputs stops a long paste from failing the whole save, previously the
 * only feedback was a generic "correct the highlighted fields" with nothing
 * highlighted.
 */
const LIMITS = {
  siteName: 80,
  pageTitle: 120,
  pageSubtitle: 200,
  pageIntro: 600,
  storyHtml: 20000,
  statValue: 20,
  statLabel: 60,
  maxStats: 6,
  serviceTitle: 80,
  serviceDescription: 600,
  maxServices: 24,
  slideAlt: 200,
  maxSlides: 8,
  linkLabel: 40,
  maxQuickLinks: 12,
  copyright: 160,
  contactIntro: 300,
  address: 300,
  workingHours: 200,
  mapEmbedUrl: 1000,
  announcement: 160,
  bannerCtaLabel: 40,
  heroTitle: 160,
  heroSubtitle: 400,
  ctaLabel: 60,
  ctaHref: 200,
  valueTitle: 80,
  valueDescription: 400,
  phone: 40,
  email: 160,
  addressLine: 200,
  poBox: 80,
  city: 120,
  supportHours: 120,
  social: 200,
  newsletterHeading: 120,
  newsletterBlurb: 400,
  footerBlurb: 600,
  youtubeId: 11,
  seoTitle: 70,
  seoDescription: 200,
} as const;

/**
 * The page is one form with one Save, split into tabs so each area of the site
 * is a screen rather than a scroll. Every panel stays mounted while hidden, so
 * switching tabs never discards an edit or an in-flight upload.
 */
const TABS = [
  { id: 'branding', label: 'Branding & logos' },
  { id: 'home', label: 'Homepage & banners' },
  { id: 'about', label: 'About page' },
  { id: 'services', label: 'Services page' },
  { id: 'contact', label: 'Contact details & footer' },
] as const;

/** The icons a service card can show. Blank keeps the card's position number. */
const SERVICE_ICONS = ['compass', 'clock', 'leaf', 'receipt'] as const;

type TabId = (typeof TABS)[number]['id'];

/** Which tab owns a field, keyed by the top-level section the API reports errors under. */
const SECTION_TAB: Record<string, TabId> = {
  branding: 'branding',
  seo: 'branding',
  banner: 'home',
  hero: 'home',
  video: 'home',
  aboutPage: 'about',
  values: 'about',
  servicesPage: 'services',
  contact: 'contact',
  contactPage: 'contact',
  socials: 'contact',
  footer: 'contact',
  footerBlurb: 'contact',
  newsletter: 'contact',
};

function tabForField(field: string): TabId | undefined {
  return SECTION_TAB[field.split('.')[0]];
}

/**
 * Takes whatever the admin pasted and returns a bare video ID.
 *
 * The API wants the 11-character ID, but the natural thing to paste is the URL
 * from the browser bar, in any of several shapes (watch?v=, youtu.be/, /embed/,
 * /shorts/, with or without extra query parameters). Rather than reject those
 * and make the admin dissect a URL by hand, pull the ID out here. Anything that
 * is not recognisably a YouTube URL is passed through untouched so the server's
 * validation message is what they see.
 */
function extractYoutubeId(input: string): string {
  const value = input.trim();
  if (!value) return '';

  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/, // watch?v=ID
    /youtu\.be\/([A-Za-z0-9_-]{11})/, // youtu.be/ID
    /\/embed\/([A-Za-z0-9_-]{11})/, // /embed/ID
    /\/shorts\/([A-Za-z0-9_-]{11})/, // /shorts/ID
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }

  return value;
}

/**
 * Google's "Embed a map" hands over a whole <iframe> snippet, and the API wants
 * only its src. Same idea as extractYoutubeId: take the natural paste and pull
 * out the part that is needed.
 */
function extractMapEmbedUrl(input: string): string {
  const match = input.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  return match ? match[1] : input;
}

/** An uploader for a field that stores only the image URL, with no alt text of its own. */
function ImageUrlField({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  contain = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  hint?: string;
  contain?: boolean;
}) {
  return (
    <div>
      <ImageUploader
        label={label}
        name={name}
        hideAlt
        contain={contain}
        value={value ? { url: value, alt: '' } : undefined}
        error={error}
        onChange={(v) => onChange(v?.url ?? '')}
      />
      {hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

const smallInput =
  'w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<TabId>('branding');

  const { toast } = useToast();

  const initial = useRef<string | null>(null);

  useEffect(() => {
    adminApi
      .get<SiteSettings>('/api/settings')
      .then((loaded) => {
        // An API that predates a section omits it entirely.
        const complete = withSettingsDefaults(loaded);
        setSettings(complete);
        initial.current = JSON.stringify(complete);
      })
      .catch((err) =>
        setError(err instanceof AdminApiError ? err.message : 'Could not load settings.')
      )
      .finally(() => setLoading(false));
  }, []);

  const dirty =
    initial.current !== null && settings !== null && JSON.stringify(settings) !== initial.current;
  useUnsavedChangesGuard(dirty && !saving);

  function patch<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
    setSaved(false);
  }

  /** Reports a problem found before sending, on the tab where it can be fixed. */
  function reject(message: string, onTab: TabId) {
    setError(message);
    setTab(onTab);
    toast({ tone: 'error', message: 'Settings could not be saved.' });
    setSaving(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError('');
    setFieldErrors({});

    // The validator requires both title and description on every value, but
    // "+ Add value" inserts a blank pair. Sending one would reject the entire
    // payload and lose every other edit on the page, so drop empty rows.
    const values = settings.values.filter(
      (v) => v.title.trim() || v.description.trim()
    );
    if (values.some((v) => !v.title.trim() || !v.description.trim())) {
      reject('Each value needs both a title and a description, or remove it.', 'about');
      return;
    }

    // Same treatment for the About page figures.
    const stats = settings.aboutPage.stats.filter((s) => s.value.trim() || s.label.trim());
    if (stats.some((s) => !s.value.trim() || !s.label.trim())) {
      reject('Each About page figure needs both a value and a label, or remove it.', 'about');
      return;
    }

    // And for the three other row editors: wholly blank rows are dropped, half
    // filled ones are reported where they can be completed.
    const servicesList = settings.servicesPage.servicesList.filter(
      (s) => s.title.trim() || s.description.trim()
    );
    if (servicesList.some((s) => !s.title.trim() || !s.description.trim())) {
      reject('Each service needs both a title and a description, or remove it.', 'services');
      return;
    }

    const quickLinks = settings.footer.quickLinks.filter((l) => l.label.trim() || l.href.trim());
    if (quickLinks.some((l) => !l.label.trim() || !l.href.trim())) {
      reject('Each footer link needs both a label and a destination, or remove it.', 'contact');
      return;
    }

    const slides = settings.hero.slides.filter((slide) => slide.url);

    try {
      const updated = await adminApi.patch<SiteSettings>('/api/admin/settings', {
        branding: settings.branding,
        banner: settings.banner,
        hero: { ...settings.hero, slides },
        values,
        aboutPage: { ...settings.aboutPage, stats },
        servicesPage: {
          ...settings.servicesPage,
          // A blank icon means "show the number", which the API stores as no icon.
          servicesList: servicesList.map(({ icon, ...rest }) => (icon ? { ...rest, icon } : rest)),
        },
        footer: { ...settings.footer, quickLinks },
        contact: settings.contact,
        contactPage: settings.contactPage,
        socials: settings.socials,
        newsletter: settings.newsletter,
        video: settings.video ?? {},
        footerBlurb: settings.footerBlurb,
        seo: settings.seo,
      });
      // The response is what was stored, which for the About story means after
      // sanitising, so the editor shows exactly what the public page renders.
      const complete = withSettingsDefaults(updated);
      setSettings(complete);
      initial.current = JSON.stringify(complete);
      setSaved(true);
      toast({ message: 'Settings saved. The public site updates within moments.' });
    } catch (err) {
      if (err instanceof AdminApiError) {
        setError(err.message);
        if (err.details) {
          setFieldErrors(err.details);
          // The offending field may be on a tab that is not showing.
          const owner = Object.keys(err.details).map(tabForField).find(Boolean);
          if (owner) setTab(owner);
        }
      } else {
        setError('Could not save settings.');
      }
      toast({ tone: 'error', message: 'Settings could not be saved.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl space-y-4">
        <div className="h-8 w-56 animate-pulse rounded bg-sand-200" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-card bg-white" />
          ))}
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <p role="alert" className="rounded-lg bg-maroon-600/10 px-4 py-3 text-sm text-maroon-700">
        {error || 'Settings are unavailable.'}
      </p>
    );
  }

  const { branding, banner, aboutPage, servicesPage, contactPage, footer, hero } = settings;
  const tabsWithErrors = new Set(Object.keys(fieldErrors).map(tabForField));

  /* Two columns from xl up. The sections are independent, so they tile into a
     masonry-ish grid instead of one tall ribbon with a dead right-hand gutter. */
  const panelProps = (id: TabId) => ({
    id: `settings-panel-${id}`,
    role: 'tabpanel' as const,
    'aria-labelledby': `settings-tab-${id}`,
    className: tab === id ? 'grid grid-cols-1 items-start gap-5 xl:grid-cols-2' : 'hidden',
  });

  return (
    <div className="max-w-6xl">
      <header className="mb-7">
        <h1 className="text-3xl">Site settings</h1>
        <p className="mt-2 text-sm text-muted">
          Everything here appears on the public site. The tabs are one form: Save stores the changes
          on all of them together.
        </p>
      </header>

      <div className="mb-5">
        <FormError message={error} fieldErrors={fieldErrors} />
      </div>
      {saved ? (
        <p role="status" className="mb-5 rounded-lg bg-forest-100 px-4 py-3 text-sm text-forest-700">
          Saved. The public site will reflect this within moments.
        </p>
      ) : null}

      <div
        role="tablist"
        aria-label="Settings sections"
        className="mb-5 flex gap-2 overflow-x-auto pb-1"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`settings-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`settings-panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-xs transition-colors ${
              tab === t.id
                ? 'bg-forest-900 text-sand-50'
                : 'border border-sand-300 text-muted hover:border-forest-900'
            }`}
          >
            {t.label}
            {tabsWithErrors.has(t.id) ? (
              <span className="h-1.5 w-1.5 rounded-full bg-maroon-600">
                <span className="sr-only">has errors</span>
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="pb-4">
        {/* ---------------- Branding ---------------- */}
        <div {...panelProps('branding')}>
          <FormSection
            className="xl:col-span-2"
            title="Branding"
            description="The name and logos shown in the header, footer and browser tab."
          >
            <TextField
              label="Site name"
              name="branding.siteName"
              hint="Shown beside the logo, in page titles and in the footer copyright line. The first word is set large, the rest beneath it."
              value={branding.siteName}
              maxLength={LIMITS.siteName}
              error={fieldErrors['branding.siteName']}
              onChange={(v) => patch('branding', { ...branding, siteName: v })}
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <ImageUrlField
                label="Main logo"
                name="branding.logoUrl"
                contain
                hint="Header and error pages."
                value={branding.logoUrl}
                error={fieldErrors['branding.logoUrl']}
                onChange={(url) => patch('branding', { ...branding, logoUrl: url })}
              />
              <ImageUrlField
                label="Footer logo"
                name="branding.footerLogoUrl"
                contain
                hint="Sits on a dark background. Leave empty to reuse the main logo."
                value={branding.footerLogoUrl}
                error={fieldErrors['branding.footerLogoUrl']}
                onChange={(url) => patch('branding', { ...branding, footerLogoUrl: url })}
              />
              <ImageUrlField
                label="Favicon"
                name="branding.faviconUrl"
                contain
                hint="Browser tab icon, ideally a square PNG. Leave empty to reuse the main logo."
                value={branding.faviconUrl}
                error={fieldErrors['branding.faviconUrl']}
                onChange={(url) => patch('branding', { ...branding, faviconUrl: url })}
              />
            </div>
          </FormSection>

          <FormSection
            className="xl:col-span-2"
            title="Default SEO"
            description="Used where a page does not set its own."
          >
            <TextField
              label="Default title"
              name="seoTitle"
              value={settings.seo.defaultTitle}
              maxLength={LIMITS.seoTitle}
              error={fieldErrors['seo.defaultTitle']}
              onChange={(v) => patch('seo', { ...settings.seo, defaultTitle: v })}
            />
            <TextArea
              label="Default description"
              name="seoDescription"
              value={settings.seo.defaultDescription}
              rows={2}
              maxLength={LIMITS.seoDescription}
              error={fieldErrors['seo.defaultDescription']}
              onChange={(v) => patch('seo', { ...settings.seo, defaultDescription: v })}
            />
          </FormSection>
        </div>

        {/* ---------------- Homepage & banners ---------------- */}
        <div {...panelProps('home')}>
          <FormSection
            className="xl:col-span-2"
            title="Announcement bar"
            description="A slim bar above the header on every public page, for an offer or a notice. It hides once the visitor scrolls."
          >
            <CheckboxField
              label="Show the announcement bar"
              checked={banner.active}
              onChange={(v) => patch('banner', { ...banner, active: v })}
              hint="Nothing is shown while the text below is empty."
            />
            <TextField
              label="Announcement"
              name="banner.announcementText"
              value={banner.announcementText}
              maxLength={LIMITS.announcement}
              placeholder="Great Migration departures now open for July to October"
              error={fieldErrors['banner.announcementText']}
              onChange={(v) => patch('banner', { ...banner, announcementText: v })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Link label"
                name="banner.ctaLabel"
                hint="Optional. Leave blank for a bar with no link."
                value={banner.ctaLabel}
                maxLength={LIMITS.bannerCtaLabel}
                placeholder="See the dates"
                error={fieldErrors['banner.ctaLabel']}
                onChange={(v) => patch('banner', { ...banner, ctaLabel: v })}
              />
              <TextField
                label="Link"
                name="banner.ctaLink"
                hint="A page on this site such as /tours, or a full https:// address."
                value={banner.ctaLink}
                maxLength={LIMITS.ctaHref}
                placeholder="/tours"
                error={fieldErrors['banner.ctaLink']}
                onChange={(v) => patch('banner', { ...banner, ctaLink: v })}
              />
            </div>
          </FormSection>

          <FormSection
            className="xl:col-span-2"
            title="Homepage hero"
            description="The first thing every visitor sees."
          >
            <TextField
              label="Headline"
              name="heroTitle"
              value={settings.hero.title}
              maxLength={LIMITS.heroTitle}
              error={fieldErrors['hero.title']}
              onChange={(v) => patch('hero', { ...settings.hero, title: v })}
            />
            <TextArea
              label="Subheadline"
              name="heroSubtitle"
              value={settings.hero.subtitle}
              rows={2}
              maxLength={LIMITS.heroSubtitle}
              error={fieldErrors['hero.subtitle']}
              onChange={(v) => patch('hero', { ...settings.hero, subtitle: v })}
            />
            <ImageUploader
              label="Background image"
              value={settings.hero.backgroundImage}
              onChange={(v) =>
                patch('hero', {
                  ...settings.hero,
                  backgroundImage: v ?? { url: '', alt: '' },
                })
              }
            />

            <div>
              <p className="text-sm font-medium text-ink">Slideshow images</p>
              <p className="mt-1 text-xs text-muted">
                The hero fades through these after the background image above. Remove them all for a
                still hero.
              </p>
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                {hero.slides.map((slide, i) => (
                  <div key={i}>
                    <ImageUploader
                      label={`Slide ${i + 2}`}
                      name={`hero.slides.${i}.url`}
                      value={slide}
                      error={fieldErrors[`hero.slides.${i}.url`] ?? fieldErrors[`hero.slides.${i}.alt`]}
                      onChange={(v) =>
                        patch('hero', {
                          ...hero,
                          // Clearing a slide's image removes the slide.
                          slides: v
                            ? hero.slides.map((x, j) => (j === i ? v : x))
                            : hero.slides.filter((_, j) => j !== i),
                        })
                      }
                    />
                  </div>
                ))}
              </div>
              {hero.slides.length < LIMITS.maxSlides ? (
                <button
                  type="button"
                  onClick={() =>
                    patch('hero', { ...hero, slides: [...hero.slides, { url: '', alt: '' }] })
                  }
                  className="mt-3 w-full rounded-lg border border-dashed border-sand-300 py-2.5 text-sm text-forest-700 hover:border-amber-500"
                >
                  + Add slide
                </button>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Primary button label"
                name="primaryLabel"
                value={settings.hero.primaryCta.label}
                maxLength={LIMITS.ctaLabel}
                error={fieldErrors['hero.primaryCta.label']}
                onChange={(v) =>
                  patch('hero', {
                    ...settings.hero,
                    primaryCta: { ...settings.hero.primaryCta, label: v },
                  })
                }
              />
              <TextField
                label="Primary button link"
                name="primaryHref"
                value={settings.hero.primaryCta.href}
                maxLength={LIMITS.ctaHref}
                error={fieldErrors['hero.primaryCta.href']}
                onChange={(v) =>
                  patch('hero', {
                    ...settings.hero,
                    primaryCta: { ...settings.hero.primaryCta, href: v },
                  })
                }
              />
              <TextField
                label="Secondary button label"
                name="secondaryLabel"
                value={settings.hero.secondaryCta.label}
                maxLength={LIMITS.ctaLabel}
                error={fieldErrors['hero.secondaryCta.label']}
                onChange={(v) =>
                  patch('hero', {
                    ...settings.hero,
                    secondaryCta: { ...settings.hero.secondaryCta, label: v },
                  })
                }
              />
              <TextField
                label="Secondary button link"
                name="secondaryHref"
                value={settings.hero.secondaryCta.href}
                maxLength={LIMITS.ctaHref}
                error={fieldErrors['hero.secondaryCta.href']}
                onChange={(v) =>
                  patch('hero', {
                    ...settings.hero,
                    secondaryCta: { ...settings.hero.secondaryCta, href: v },
                  })
                }
              />
            </div>
          </FormSection>


          <FormSection
            title="Homepage film"
            description="The video embedded on the homepage. Leave blank to show the placeholder."
          >
            <TextField
              label="YouTube video ID"
              name="videoYoutubeId"
              value={settings.video?.youtubeId ?? ''}
              maxLength={LIMITS.youtubeId}
              error={fieldErrors['video.youtubeId']}
              hint="The 11-character ID, e.g. dQw4w9WgXcQ. Pasting a full YouTube link also works."
              onChange={(v) => patch('video', { youtubeId: extractYoutubeId(v) })}
            />
          </FormSection>
        </div>

        {/* ---------------- About page ---------------- */}
        <div {...panelProps('about')}>
          <FormSection
            className="xl:col-span-2"
            title="About page banner"
            description="The photo and heading at the top of /about."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Title"
                name="aboutPage.title"
                value={aboutPage.title}
                maxLength={LIMITS.pageTitle}
                error={fieldErrors['aboutPage.title']}
                onChange={(v) => patch('aboutPage', { ...aboutPage, title: v })}
              />
              <TextField
                label="Subtitle"
                name="aboutPage.subtitle"
                value={aboutPage.subtitle}
                maxLength={LIMITS.pageSubtitle}
                error={fieldErrors['aboutPage.subtitle']}
                onChange={(v) => patch('aboutPage', { ...aboutPage, subtitle: v })}
              />
            </div>
            <ImageUrlField
              label="Banner image"
              name="aboutPage.heroImageUrl"
              hint="A wide landscape photo works best. Leave empty to use the standard image."
              value={aboutPage.heroImageUrl}
              error={fieldErrors['aboutPage.heroImageUrl']}
              onChange={(url) => patch('aboutPage', { ...aboutPage, heroImageUrl: url })}
            />
          </FormSection>

          <FormSection
            className="xl:col-span-2"
            title="Our story"
            description="The company overview beside the two portrait photos."
          >
            <RichTextField
              label="Story"
              name="aboutPage.storyHtml"
              value={aboutPage.storyHtml}
              rows={10}
              maxLength={LIMITS.storyHtml}
              error={fieldErrors['aboutPage.storyHtml']}
              hint="Leave blank to show the standard company overview. Select text and use the buttons to format it. Only that formatting is kept: anything else, including styling pasted from Word, is removed when you save."
              placeholder={'<p>Lekker Tours and Travel began with…</p>'}
              onChange={(v) => patch('aboutPage', { ...aboutPage, storyHtml: v })}
            />
          </FormSection>

          <FormSection
            title="Vision and mission"
            description="The two cards under the story."
          >
            <TextArea
              label="Vision statement"
              name="aboutPage.visionStatement"
              value={aboutPage.visionStatement}
              rows={4}
              maxLength={LIMITS.pageIntro}
              error={fieldErrors['aboutPage.visionStatement']}
              onChange={(v) => patch('aboutPage', { ...aboutPage, visionStatement: v })}
            />
            <TextArea
              label="Mission statement"
              name="aboutPage.missionStatement"
              value={aboutPage.missionStatement}
              rows={4}
              maxLength={LIMITS.pageIntro}
              error={fieldErrors['aboutPage.missionStatement']}
              onChange={(v) => patch('aboutPage', { ...aboutPage, missionStatement: v })}
            />
          </FormSection>

          <FormSection
            title="Values"
            description="Shown as “Our core values” on this page, and as the cards below the hero on the homepage."
          >
            {settings.values.map((value, i) => (
              <div key={i} className="space-y-3 rounded-lg border border-sand-200 bg-sand-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted">Value {i + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      patch('values', settings.values.filter((_, j) => j !== i))
                    }
                    className="text-xs text-maroon-600 underline"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={value.title}
                  placeholder="Title"
                  maxLength={LIMITS.valueTitle}
                  aria-label={`Value ${i + 1} title`}
                  onChange={(e) =>
                    patch(
                      'values',
                      settings.values.map((v, j) => (j === i ? { ...v, title: e.target.value } : v))
                    )
                  }
                  className={smallInput}
                />
                <textarea
                  rows={2}
                  value={value.description}
                  placeholder="Description"
                  maxLength={LIMITS.valueDescription}
                  aria-label={`Value ${i + 1} description`}
                  onChange={(e) =>
                    patch(
                      'values',
                      settings.values.map((v, j) =>
                        j === i ? { ...v, description: e.target.value } : v
                      )
                    )
                  }
                  className={smallInput}
                />
                {fieldErrors[`values.${i}.title`] || fieldErrors[`values.${i}.description`] ? (
                  <p className="text-xs text-maroon-600">
                    {fieldErrors[`values.${i}.title`] ?? fieldErrors[`values.${i}.description`]}
                  </p>
                ) : null}
                <select
                  value={value.icon ?? 'compass'}
                  onChange={(e) =>
                    patch(
                      'values',
                      settings.values.map((v, j) => (j === i ? { ...v, icon: e.target.value } : v))
                    )
                  }
                  className={`${smallInput} bg-white`}
                >
                  {['compass', 'clock', 'leaf', 'receipt'].map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                patch('values', [
                  ...settings.values,
                  { title: '', description: '', icon: 'compass' },
                ])
              }
              className="w-full rounded-lg border border-dashed border-sand-300 py-2.5 text-sm text-forest-700 hover:border-amber-500"
            >
              + Add value
            </button>
          </FormSection>

          <FormSection
            title="Figures"
            description="Optional headline numbers under the story, such as “12+ destinations”. Only enter figures you can stand behind; none are shown until you add them."
          >
            {aboutPage.stats.map((stat, i) => (
              <div key={i} className="flex items-start gap-2">
                <input
                  type="text"
                  value={stat.value}
                  placeholder="12+"
                  maxLength={LIMITS.statValue}
                  aria-label={`Figure ${i + 1} value`}
                  onChange={(e) =>
                    patch('aboutPage', {
                      ...aboutPage,
                      stats: aboutPage.stats.map((s, j) =>
                        j === i ? { ...s, value: e.target.value } : s
                      ),
                    })
                  }
                  className={`${smallInput} w-24 shrink-0`}
                />
                <input
                  type="text"
                  value={stat.label}
                  placeholder="Destinations"
                  maxLength={LIMITS.statLabel}
                  aria-label={`Figure ${i + 1} label`}
                  onChange={(e) =>
                    patch('aboutPage', {
                      ...aboutPage,
                      stats: aboutPage.stats.map((s, j) =>
                        j === i ? { ...s, label: e.target.value } : s
                      ),
                    })
                  }
                  className={smallInput}
                />
                <button
                  type="button"
                  onClick={() =>
                    patch('aboutPage', {
                      ...aboutPage,
                      stats: aboutPage.stats.filter((_, j) => j !== i),
                    })
                  }
                  className="shrink-0 py-2 text-xs text-maroon-600 underline"
                >
                  Remove
                </button>
              </div>
            ))}
            {aboutPage.stats.map((_, i) =>
              fieldErrors[`aboutPage.stats.${i}.value`] ||
              fieldErrors[`aboutPage.stats.${i}.label`] ? (
                <p key={i} className="text-xs text-maroon-600">
                  Figure {i + 1}:{' '}
                  {fieldErrors[`aboutPage.stats.${i}.value`] ??
                    fieldErrors[`aboutPage.stats.${i}.label`]}
                </p>
              ) : null
            )}
            {aboutPage.stats.length < LIMITS.maxStats ? (
              <button
                type="button"
                onClick={() =>
                  patch('aboutPage', {
                    ...aboutPage,
                    stats: [...aboutPage.stats, { value: '', label: '' }],
                  })
                }
                className="w-full rounded-lg border border-dashed border-sand-300 py-2.5 text-sm text-forest-700 hover:border-amber-500"
              >
                + Add figure
              </button>
            ) : null}
          </FormSection>
        </div>

        {/* ---------------- Services page ---------------- */}
        <div {...panelProps('services')}>
          <FormSection
            className="xl:col-span-2"
            title="Services page banner"
            description="The photo and heading at the top of /services."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Title"
                name="servicesPage.title"
                value={servicesPage.title}
                maxLength={LIMITS.pageTitle}
                error={fieldErrors['servicesPage.title']}
                onChange={(v) => patch('servicesPage', { ...servicesPage, title: v })}
              />
              <TextField
                label="Subtitle"
                name="servicesPage.subtitle"
                value={servicesPage.subtitle}
                maxLength={LIMITS.pageSubtitle}
                error={fieldErrors['servicesPage.subtitle']}
                onChange={(v) => patch('servicesPage', { ...servicesPage, subtitle: v })}
              />
            </div>
            <ImageUrlField
              label="Banner image"
              name="servicesPage.bannerImageUrl"
              hint="A wide landscape photo works best. Leave empty to use the standard image."
              value={servicesPage.bannerImageUrl}
              error={fieldErrors['servicesPage.bannerImageUrl']}
              onChange={(url) => patch('servicesPage', { ...servicesPage, bannerImageUrl: url })}
            />
          </FormSection>

          <FormSection
            className="xl:col-span-2"
            title="Introduction"
            description="The paragraph under “What we do”, above the list of services."
          >
            <TextArea
              label="Intro text"
              name="servicesPage.introText"
              value={servicesPage.introText}
              rows={4}
              maxLength={LIMITS.pageIntro}
              error={fieldErrors['servicesPage.introText']}
              onChange={(v) => patch('servicesPage', { ...servicesPage, introText: v })}
            />
          </FormSection>

          <FormSection
            className="xl:col-span-2"
            title="Service cards"
            description="The grid of services, in the order shown. A card with no icon shows its number instead."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              {servicesPage.servicesList.map((service, i) => {
                const list = servicesPage.servicesList;
                const setList = (next: typeof list) =>
                  patch('servicesPage', { ...servicesPage, servicesList: next });
                const update = (change: Partial<(typeof list)[number]>) =>
                  setList(list.map((x, j) => (j === i ? { ...x, ...change } : x)));
                const move = (to: number) => {
                  const next = [...list];
                  [next[i], next[to]] = [next[to], next[i]];
                  setList(next);
                };
                const rowError =
                  fieldErrors[`servicesPage.servicesList.${i}.title`] ??
                  fieldErrors[`servicesPage.servicesList.${i}.description`];

                return (
                  <div key={i} className="space-y-3 rounded-lg border border-sand-200 bg-sand-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-wider text-muted">
                        Service {i + 1}
                      </span>
                      <span className="flex items-center gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => move(i - 1)}
                          disabled={i === 0}
                          aria-label={`Move service ${i + 1} earlier`}
                          className="text-forest-700 underline disabled:text-muted disabled:no-underline disabled:opacity-50"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() => move(i + 1)}
                          disabled={i === list.length - 1}
                          aria-label={`Move service ${i + 1} later`}
                          className="text-forest-700 underline disabled:text-muted disabled:no-underline disabled:opacity-50"
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          onClick={() => setList(list.filter((_, j) => j !== i))}
                          className="text-maroon-600 underline"
                        >
                          Remove
                        </button>
                      </span>
                    </div>
                    <input
                      type="text"
                      value={service.title}
                      placeholder="Title"
                      maxLength={LIMITS.serviceTitle}
                      aria-label={`Service ${i + 1} title`}
                      onChange={(e) => update({ title: e.target.value })}
                      className={smallInput}
                    />
                    <textarea
                      rows={3}
                      value={service.description}
                      placeholder="Description"
                      maxLength={LIMITS.serviceDescription}
                      aria-label={`Service ${i + 1} description`}
                      onChange={(e) => update({ description: e.target.value })}
                      className={smallInput}
                    />
                    <select
                      value={service.icon ?? ''}
                      aria-label={`Service ${i + 1} icon`}
                      onChange={(e) => update({ icon: e.target.value })}
                      className={`${smallInput} bg-white`}
                    >
                      <option value="">No icon (show the number)</option>
                      {SERVICE_ICONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                    {rowError ? <p className="text-xs text-maroon-600">{rowError}</p> : null}
                  </div>
                );
              })}
            </div>
            {servicesPage.servicesList.length < LIMITS.maxServices ? (
              <button
                type="button"
                onClick={() =>
                  patch('servicesPage', {
                    ...servicesPage,
                    servicesList: [...servicesPage.servicesList, { title: '', description: '' }],
                  })
                }
                className="w-full rounded-lg border border-dashed border-sand-300 py-2.5 text-sm text-forest-700 hover:border-amber-500"
              >
                + Add service
              </button>
            ) : null}
          </FormSection>
        </div>

        {/* ---------------- Contact details ---------------- */}
        <div {...panelProps('contact')}>
          <FormSection
            title="Contact details"
            description="Used in the header, footer and contact page. Both numbers are shown publicly when they differ."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Phone"
                name="phone"
                hint="Primary number. Shown first everywhere."
                value={settings.contact.phone}
                maxLength={LIMITS.phone}
                error={fieldErrors['contact.phone']}
                onChange={(v) => patch('contact', { ...settings.contact, phone: v })}
              />
              <TextField
                label="WhatsApp"
                name="whatsapp"
                hint="Also listed as a second number, and used for WhatsApp links. Leave blank to show only the phone number."
                value={settings.contact.whatsapp ?? ''}
                maxLength={LIMITS.phone}
                error={fieldErrors['contact.whatsapp']}
                onChange={(v) => patch('contact', { ...settings.contact, whatsapp: v })}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={settings.contact.email}
                maxLength={LIMITS.email}
                error={fieldErrors['contact.email']}
                onChange={(v) => patch('contact', { ...settings.contact, email: v })}
              />
              <TextField
                label="Support hours"
                name="supportHours"
                value={settings.contact.supportHours}
                maxLength={LIMITS.supportHours}
                error={fieldErrors['contact.supportHours']}
                onChange={(v) => patch('contact', { ...settings.contact, supportHours: v })}
              />
              <TextField
                label="Address line"
                name="addressLine"
                value={settings.contact.addressLine}
                maxLength={LIMITS.addressLine}
                error={fieldErrors['contact.addressLine']}
                onChange={(v) => patch('contact', { ...settings.contact, addressLine: v })}
              />
              <TextField
                label="P.O. Box"
                name="poBox"
                value={settings.contact.poBox ?? ''}
                maxLength={LIMITS.poBox}
                error={fieldErrors['contact.poBox']}
                onChange={(v) => patch('contact', { ...settings.contact, poBox: v })}
              />
              <TextField
                label="City"
                name="city"
                value={settings.contact.city}
                maxLength={LIMITS.city}
                error={fieldErrors['contact.city']}
                onChange={(v) => patch('contact', { ...settings.contact, city: v })}
              />
            </div>
          </FormSection>

          <FormSection
            className="xl:col-span-2"
            title="Contact page banner"
            description="The photo and heading at the top of /contact."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Headline"
                name="contactPage.inquiryHeadline"
                value={contactPage.inquiryHeadline}
                maxLength={LIMITS.pageTitle}
                error={fieldErrors['contactPage.inquiryHeadline']}
                onChange={(v) => patch('contactPage', { ...contactPage, inquiryHeadline: v })}
              />
              <TextArea
                label="Intro"
                name="contactPage.inquiryIntro"
                value={contactPage.inquiryIntro}
                rows={2}
                maxLength={LIMITS.contactIntro}
                error={fieldErrors['contactPage.inquiryIntro']}
                onChange={(v) => patch('contactPage', { ...contactPage, inquiryIntro: v })}
              />
            </div>
            <ImageUrlField
              label="Banner image"
              name="contactPage.bannerImageUrl"
              hint="A wide landscape photo works best. Leave empty to use the standard image."
              value={contactPage.bannerImageUrl}
              error={fieldErrors['contactPage.bannerImageUrl']}
              onChange={(url) => patch('contactPage', { ...contactPage, bannerImageUrl: url })}
            />
          </FormSection>

          <FormSection
            title="Contact page details"
            description="Shown on /contact only. Leave a field blank to use the matching contact detail, so the two never disagree by accident."
          >
            <TextArea
              label="Address"
              name="contactPage.address"
              value={contactPage.address}
              rows={3}
              maxLength={LIMITS.address}
              error={fieldErrors['contactPage.address']}
              hint="One line per row. Blank uses the address line, P.O. Box and city."
              onChange={(v) => patch('contactPage', { ...contactPage, address: v })}
            />
            <TextField
              label="Working hours"
              name="contactPage.workingHours"
              value={contactPage.workingHours}
              maxLength={LIMITS.workingHours}
              placeholder="Monday to Saturday, 8am to 6pm"
              error={fieldErrors['contactPage.workingHours']}
              hint="Blank uses the support hours."
              onChange={(v) => patch('contactPage', { ...contactPage, workingHours: v })}
            />
            <TextField
              label="Enquiry email"
              name="contactPage.inquiryEmail"
              type="email"
              value={contactPage.inquiryEmail}
              maxLength={LIMITS.email}
              error={fieldErrors['contactPage.inquiryEmail']}
              hint="The address shown on the contact page. Blank uses the main email."
              onChange={(v) => patch('contactPage', { ...contactPage, inquiryEmail: v })}
            />
            <TextField
              label="Map embed link"
              name="contactPage.mapEmbedUrl"
              value={contactPage.mapEmbedUrl}
              placeholder="https://www.google.com/maps/embed?pb=…"
              error={fieldErrors['contactPage.mapEmbedUrl']}
              hint="In Google Maps choose Share, then “Embed a map”, and paste what it gives you. Blank shows no map."
              onChange={(v) =>
                patch('contactPage', { ...contactPage, mapEmbedUrl: extractMapEmbedUrl(v) })
              }
            />
          </FormSection>

          <FormSection
            className="xl:col-span-2"
            title="Social links"
            description="Leave blank to hide a platform from the footer."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {(['facebook', 'instagram', 'x', 'youtube', 'tiktok'] as const).map((key) => (
                <TextField
                  key={key}
                  label={key === 'x' ? 'X (Twitter)' : key[0].toUpperCase() + key.slice(1)}
                  name={key}
                  value={settings.socials[key] ?? ''}
                  placeholder="https://…"
                  maxLength={LIMITS.social}
                  error={fieldErrors[`socials.${key}`]}
                  onChange={(v) => patch('socials', { ...settings.socials, [key]: v })}
                />
              ))}
            </div>
          </FormSection>

          <FormSection title="Footer and newsletter">
            <TextArea
              label="Footer description"
              name="footerBlurb"
              value={settings.footerBlurb}
              rows={3}
              maxLength={LIMITS.footerBlurb}
              error={fieldErrors.footerBlurb}
              onChange={(v) => patch('footerBlurb', v)}
            />
            <TextField
              label="Copyright text"
              name="footer.copyrightText"
              value={footer.copyrightText}
              maxLength={LIMITS.copyright}
              placeholder={`${branding.siteName}. All rights reserved.`}
              error={fieldErrors['footer.copyrightText']}
              hint="Follows “© ” and the current year, which is filled in for you. Blank uses the site name."
              onChange={(v) => patch('footer', { ...footer, copyrightText: v })}
            />
            <TextField
              label="Newsletter heading"
              name="newsletterHeading"
              value={settings.newsletter.heading}
              maxLength={LIMITS.newsletterHeading}
              error={fieldErrors['newsletter.heading']}
              onChange={(v) => patch('newsletter', { ...settings.newsletter, heading: v })}
            />
            <TextArea
              label="Newsletter blurb"
              name="newsletterBlurb"
              value={settings.newsletter.blurb}
              rows={2}
              maxLength={LIMITS.newsletterBlurb}
              error={fieldErrors['newsletter.blurb']}
              onChange={(v) => patch('newsletter', { ...settings.newsletter, blurb: v })}
            />
          </FormSection>

          <FormSection
            title="Footer quick links"
            description="The “Explore” column in the footer, in the order shown."
          >
            {footer.quickLinks.map((link, i) => {
              const setLinks = (next: typeof footer.quickLinks) =>
                patch('footer', { ...footer, quickLinks: next });
              const rowError =
                fieldErrors[`footer.quickLinks.${i}.label`] ??
                fieldErrors[`footer.quickLinks.${i}.href`];

              return (
                <div key={i}>
                  <div className="flex items-start gap-2">
                    <input
                      type="text"
                      value={link.label}
                      placeholder="Label"
                      maxLength={LIMITS.linkLabel}
                      aria-label={`Footer link ${i + 1} label`}
                      onChange={(e) =>
                        setLinks(
                          footer.quickLinks.map((x, j) =>
                            j === i ? { ...x, label: e.target.value } : x
                          )
                        )
                      }
                      className={smallInput}
                    />
                    <input
                      type="text"
                      value={link.href}
                      placeholder="/tours"
                      maxLength={LIMITS.ctaHref}
                      aria-label={`Footer link ${i + 1} destination`}
                      onChange={(e) =>
                        setLinks(
                          footer.quickLinks.map((x, j) =>
                            j === i ? { ...x, href: e.target.value } : x
                          )
                        )
                      }
                      className={smallInput}
                    />
                    <button
                      type="button"
                      onClick={() => setLinks(footer.quickLinks.filter((_, j) => j !== i))}
                      className="shrink-0 py-2 text-xs text-maroon-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                  {rowError ? <p className="mt-1 text-xs text-maroon-600">{rowError}</p> : null}
                </div>
              );
            })}
            <p className="text-xs text-muted">
              A destination is a page on this site such as /tours, or a full https:// address.
            </p>
            {footer.quickLinks.length < LIMITS.maxQuickLinks ? (
              <button
                type="button"
                onClick={() =>
                  patch('footer', {
                    ...footer,
                    quickLinks: [...footer.quickLinks, { label: '', href: '' }],
                  })
                }
                className="w-full rounded-lg border border-dashed border-sand-300 py-2.5 text-sm text-forest-700 hover:border-amber-500"
              >
                + Add link
              </button>
            ) : null}
          </FormSection>
        </div>

        <div className="mt-5">
          <FormActions saving={saving} submitLabel="Save settings" dirty={dirty} />
        </div>
      </form>
    </div>
  );
}
