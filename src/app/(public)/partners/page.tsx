import type { Metadata } from 'next';
import { PageBanner } from '@/components/ui/PageBanner';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { getSettings } from '@/lib/settings';
import { secondaryNumber } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Partnerships',
  description:
    'Lekker Tours and Travel works with corporates, hotels and lodges, event organisers, schools and churches, international agents and transport providers on Kenya ground arrangements.',
};

/** Section 08 of the company profile. */
const PARTNERS = [
  {
    type: 'Corporates & SMEs',
    collaboration:
      'Business travel, retreats, staff movement, accommodation and group programmes.',
  },
  {
    type: 'Hotels & Lodges',
    collaboration:
      'Guest referrals, accommodation packages, transfers and destination experiences.',
  },
  {
    type: 'Event Organisers',
    collaboration: 'Transport, accommodation, group movement and travel coordination.',
  },
  {
    type: 'Schools / Churches / Groups',
    collaboration: 'Educational trips, retreats, excursions and organised group travel.',
  },
  {
    type: 'International Agents',
    collaboration:
      'Kenya ground arrangements, safari programmes, transfers and local coordination.',
  },
  {
    type: 'Transport & Activity Providers',
    collaboration:
      'Reliable ground transport and activity partnerships supporting complete itineraries.',
  },
];

/** Section 09, service standards. */
const STANDARDS = [
  {
    title: 'Clarity',
    body: 'Clients receive understandable information about itineraries, inclusions, exclusions and arrangements.',
  },
  {
    title: 'Responsiveness',
    body: 'We aim to respond to enquiries and changes as quickly as practical.',
  },
  {
    title: 'Coordination',
    body: 'Travel components are planned as one journey rather than isolated bookings.',
  },
  {
    title: 'Professionalism',
    body: 'We maintain respectful communication with clients, suppliers and partners.',
  },
  {
    title: 'Problem Solving',
    body: 'When travel plans change, we focus on practical options and timely communication.',
  },
];

export default async function PartnersPage() {
  const settings = await getSettings();
  const secondNumber = secondaryNumber(settings.contact.phone, settings.contact.whatsapp);

  return (
    <>
      <PageBanner
        title="Partnerships"
        subtitle="Working with companies, institutions, hotels, event organisers and travel agents."
        image={{ url: '/images/lodge-veranda.jpg', alt: 'A lodge veranda set for guests' }}
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/partners', label: 'Partnerships' },
        ]}
      />

      <section className="bg-sand-50 py-16 md:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Corporate & partnership opportunities"
            title="Positioned to work alongside the wider travel trade"
            description="Lekker Tours and Travel works with companies, institutions, hotels, event organisers, travel agents, accommodation providers and other destination partners."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PARTNERS.map((partner, i) => (
              <Reveal key={partner.type} delay={(i % 3) * 90}>
                <article className="h-full rounded-card border border-sand-200 bg-white p-7">
                  <h3 className="mb-3 text-lg">{partner.type}</h3>
                  <p className="text-sm leading-relaxed text-muted">{partner.collaboration}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 rounded-card border border-sand-200 bg-white p-7">
            <h3 className="mb-3 text-lg">Our B2B approach</h3>
            <p className="max-w-3xl text-sm leading-relaxed text-muted">
              We value long-term relationships built on responsiveness, clear communication and
              dependable fulfilment. For trade partners, we can tailor itineraries and ground
              arrangements to the requirements of the referring agent or organisation.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-forest-900 py-16 md:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Service standards"
            title="What partners and clients can expect"
            tone="light"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STANDARDS.map((standard, i) => (
              <Reveal key={standard.title} delay={(i % 3) * 90}>
                <article className="h-full rounded-card border border-white/10 bg-forest-800/40 p-7">
                  <h3 className="mb-3 text-lg text-sand-50">{standard.title}</h3>
                  <p className="text-sm leading-relaxed text-sand-200/75">{standard.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-amber-600">
              Responsible tourism
            </p>
            <h2 className="mb-6 text-3xl leading-tight md:text-4xl">
              Travel that respects wildlife, communities and place
            </h2>
            <div className="space-y-5 text-base leading-relaxed text-muted">
              <p>
                Lekker Tours and Travel recognises that tourism depends on healthy wildlife,
                communities, culture and natural environments. Our travel programmes are designed to
                encourage respectful behaviour and responsible choices, including following park
                rules, respecting wildlife distances and supporting local businesses where possible.
              </p>
              <p>
                Where practical, our itineraries can include locally owned accommodation, guides,
                experiences and suppliers.
              </p>
            </div>
          </div>

          <div className="rounded-card border border-sand-200 bg-sand-50 p-7">
            <h3 className="mb-4 text-lg">Talk to us about working together</h3>
            <p className="mb-6 text-sm leading-relaxed text-muted">
              For corporate and group clients, we can structure travel around agreed schedules,
              budgets, passenger lists, accommodation requirements, transport needs and activity
              programmes.
            </p>
            <dl className="space-y-3 text-sm">
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-muted">Office</dt>
                <dd>
                  {settings.contact.addressLine}, {settings.contact.city}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-muted">Phone</dt>
                <dd className="space-y-1">
                  <a
                    href={`tel:${settings.contact.phone.replace(/[^\d+]/g, '')}`}
                    className="block transition-colors hover:text-amber-600"
                  >
                    {settings.contact.phone}
                  </a>
                  {secondNumber ? (
                    <a
                      href={`tel:${secondNumber.replace(/[^\d+]/g, '')}`}
                      className="block transition-colors hover:text-amber-600"
                    >
                      {secondNumber}
                    </a>
                  ) : null}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-muted">Email</dt>
                <dd>
                  <a
                    href={`mailto:${settings.contact.email}`}
                    className="transition-colors hover:text-amber-600"
                  >
                    {settings.contact.email}
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-7">
              <ButtonLink href="/contact">Make an enquiry</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
