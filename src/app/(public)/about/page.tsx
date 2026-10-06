import type { Metadata } from 'next';
import Image from 'next/image';
import { PageBanner } from '@/components/ui/PageBanner';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { getSettings } from '@/lib/settings';
import { DEFAULT_ABOUT_PAGE } from '@/lib/siteContent';
import { sanitizeHtml, RICH_TEXT_CLASSES } from '@/lib/sanitizeHtml';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Lekker Tours and Travel is a Kenya-based tours and travel company creating memorable, well-planned journeys for individuals, families, groups, organisations and international visitors.',
};

/**
 * Section 06 of the company profile, "Why Lekker". Deliberately claims only
 * what the profile claims: no fleet sizes, guide headcounts or years in
 * operation, none of which have been confirmed.
 */
const WHY_LEKKER = [
  {
    title: 'Local knowledge',
    body: 'Kenya is our home market. We build itineraries around real travel conditions, destination character and practical logistics.',
  },
  {
    title: 'Personalised planning',
    body: 'We listen first and then build a trip around the traveller’s priorities, rather than forcing every client into the same itinerary.',
  },
  {
    title: 'One point of contact',
    body: 'We aim to simplify planning by coordinating the different elements of a journey through one travel partner.',
  },
  {
    title: 'Flexible options',
    body: 'We can work across different travel styles, budgets, group sizes and trip lengths.',
  },
  {
    title: 'Clear communication',
    body: 'We explain itinerary details, inclusions, exclusions and important travel information before confirmation.',
  },
  {
    title: 'Partner network',
    body: 'We work with accommodation, transport, activity and destination partners to build complete travel solutions.',
  },
];

export default async function AboutPage() {
  const settings = await getSettings();
  const about = settings.aboutPage;

  const bannerTitle = about.title || DEFAULT_ABOUT_PAGE.title;
  const bannerImage = about.heroImageUrl || DEFAULT_ABOUT_PAGE.heroImageUrl;
  // The API sanitises this on save and on read. It is run through the same
  // allowlist once more here, because this is the line that injects markup.
  const storyHtml = sanitizeHtml(about.storyHtml);

  return (
    <>
      <PageBanner
        title={bannerTitle}
        subtitle={about.subtitle}
        image={{
          url: bannerImage,
          // The stock description only fits the stock photo. An uploaded image
          // has no description of its own, so the page title stands in.
          alt:
            bannerImage === DEFAULT_ABOUT_PAGE.heroImageUrl
              ? 'Guides walking out across open savanna at golden hour'
              : bannerTitle,
        }}
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/about', label: 'About Us' },
        ]}
      />

      <section className="bg-sand-50 py-16 md:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-amber-600">
              Company overview
            </p>
            <h2 className="mb-6 text-3xl leading-tight md:text-4xl">
              Making travel simple, enjoyable and memorable
            </h2>
            {storyHtml ? (
              <div className={RICH_TEXT_CLASSES} dangerouslySetInnerHTML={{ __html: storyHtml }} />
            ) : (
              <div className="space-y-5 text-base leading-relaxed text-muted">
                <p>
                  Lekker Tours and Travel is a Kenya-based tours and travel company focused on making
                  travel simple, enjoyable and memorable. We design and coordinate travel experiences
                  that connect people with Kenya’s wildlife, landscapes, beaches, culture and cities,
                  while also supporting practical travel needs.
                </p>
                <p>
                  Our approach combines personal service, practical planning and flexible travel
                  solutions. Whether a client is looking for a weekend safari, a family holiday, a
                  group excursion, a beach escape, an airport transfer or a tailor-made itinerary, our
                  goal is to provide one dependable point of contact from planning to completion.
                </p>
                <p>
                  We serve both the domestic and international market, with Kenya as our core
                  destination and East Africa as a natural area for expansion. Our office is at{' '}
                  {settings.contact.addressLine} in {settings.contact.city}.
                </p>
              </div>
            )}

            {about.stats.length > 0 ? (
              <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-sand-200 pt-7 sm:grid-cols-3">
                {about.stats.map((stat, i) => (
                  <div key={`${stat.label}-${i}`} className="flex flex-col-reverse">
                    <dt className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                      {stat.label}
                    </dt>
                    <dd className="font-display text-3xl text-forest-900">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/services">Our services</ButtonLink>
              <ButtonLink href="/contact" variant="ghost">
                Talk to us →
              </ButtonLink>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-card">
              <Image
                src="/images/maasai-warrior-portrait.jpg"
                alt="Portrait of a guide in traditional dress"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-card">
              <Image
                src="/images/lodge-deck-chairs.jpg"
                alt="Lodge deck looking out over the plains"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <Reveal>
            <article className="h-full rounded-card border border-sand-200 bg-sand-50 p-8">
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-amber-600">Our vision</p>
              <p className="text-base leading-relaxed text-muted">
                {about.visionStatement || DEFAULT_ABOUT_PAGE.visionStatement}
              </p>
            </article>
          </Reveal>
          <Reveal delay={90}>
            <article className="h-full rounded-card border border-sand-200 bg-sand-50 p-8">
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-amber-600">Our mission</p>
              <p className="text-base leading-relaxed text-muted">
                {about.missionStatement || DEFAULT_ABOUT_PAGE.missionStatement}
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      {settings.values?.length ? (
        <section className="bg-forest-900 py-16 md:py-24">
          <div className="container-page">
            <SectionHeading
              eyebrow="What we stand for"
              title="Our core values"
              tone="light"
              description="The commitments that shape how we plan, communicate and travel."
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {settings.values.map((value, i) => (
                <Reveal key={value.title} delay={(i % 3) * 90}>
                  <article className="h-full rounded-card border border-white/10 bg-forest-800/40 p-7">
                    <span aria-hidden className="mb-4 block font-display text-3xl text-amber-400">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mb-3 text-lg text-sand-50">{value.title}</h3>
                    <p className="text-sm leading-relaxed text-sand-200/75">{value.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white py-16 md:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why Lekker"
            title="What you can expect when you plan with us"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {WHY_LEKKER.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 90}>
                <article className="h-full rounded-card border border-sand-200 bg-sand-50 p-7">
                  <h3 className="mb-3 text-lg">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 rounded-card border border-sand-200 bg-sand-50 p-7">
            <h3 className="mb-3 text-lg">Our travel philosophy</h3>
            <p className="max-w-3xl text-sm leading-relaxed text-muted">
              We believe a good itinerary is more than a list of places. It should balance travel
              time, comfort, activities, budget and the traveller’s personal interests. We therefore
              encourage clients to choose experiences that match how they want to travel rather than
              simply following a standard package.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-forest-950 py-16 md:py-20">
        <div className="container-page text-center">
          <h2 className="mx-auto max-w-2xl text-3xl text-sand-50">Ready when you are</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-sand-200/75">
            {settings.contact.supportHours}, from the first enquiry to the final sunset of your
            tour.
          </p>
          <div className="mt-8">
            <ButtonLink href="/contact" size="lg">
              Start your journey
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
