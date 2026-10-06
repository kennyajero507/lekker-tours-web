import type { Metadata } from 'next';
import { PageBanner } from '@/components/ui/PageBanner';
import { ContactForm } from '@/components/contact/ContactForm';
import { getSettings } from '@/lib/settings';
import { telHref, whatsappHref, secondaryNumber } from '@/lib/format';
import { DEFAULT_CONTACT_PAGE, isAllowedMapEmbed } from '@/lib/siteContent';

export const metadata: Metadata = {
  title: 'Start Your Journey',
  description:
    'From the first enquiry to the final sunset of your tour, our Nairobi specialists are ready to craft your expedition. Call, email or send us your dates.',
};

export default async function ContactPage() {
  const { contact, contactPage } = await getSettings();
  const secondNumber = secondaryNumber(contact.phone, contact.whatsapp);

  // Each contact-page field overrides the site-wide one here only; blank
  // defers to it, so the header and footer keep showing the main details.
  const email = contactPage.inquiryEmail || contact.email;
  const hours = contactPage.workingHours || contact.supportHours;
  const customAddress = contactPage.address
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const addressLines = customAddress.length
    ? customAddress
    : [contact.addressLine, contact.poBox, contact.city].filter((line): line is string =>
        Boolean(line)
      );
  const mapQuery = customAddress.length
    ? customAddress.join(', ')
    : `${contact.addressLine}, ${contact.city}`;
  const mapEmbedUrl = isAllowedMapEmbed(contactPage.mapEmbedUrl) ? contactPage.mapEmbedUrl : '';

  const bannerTitle = contactPage.inquiryHeadline || DEFAULT_CONTACT_PAGE.inquiryHeadline;
  const bannerImage = contactPage.bannerImageUrl || DEFAULT_CONTACT_PAGE.bannerImageUrl;

  return (
    <>
      <PageBanner
        title={bannerTitle}
        subtitle={contactPage.inquiryIntro}
        image={{
          url: bannerImage,
          // The stock description only fits the stock photo.
          alt:
            bannerImage === DEFAULT_CONTACT_PAGE.bannerImageUrl
              ? 'Balloons drifting over the plains at first light'
              : bannerTitle,
        }}
        crumbs={[
          { href: '/', label: 'Home' },
          { href: '/contact', label: 'Contact' },
        ]}
      />

      <section className="bg-sand-50 py-16 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_360px]">
          <ContactForm />

          <aside className="space-y-5">
            <div className="rounded-card bg-forest-900 p-7 text-sand-100">
              <h2 className="mb-1 text-xl text-sand-50">Direct contact</h2>
              <p className="mb-6 text-sm text-sand-200/70">We are always available.</p>

              <dl className="space-y-5 text-sm">
                <div>
                  <dt className="mb-1 text-[0.65rem] uppercase tracking-[0.2em] text-amber-400">
                    Phone &amp; WhatsApp
                  </dt>
                  <dd className="space-y-1">
                    <a
                      href={`tel:${telHref(contact.phone)}`}
                      className="block text-sand-50 transition-colors hover:text-amber-400"
                    >
                      {contact.phone}
                    </a>
                    {/* Second line only when WhatsApp is a different number, so a
                        single-number setup does not render the same one twice. */}
                    {secondNumber ? (
                      <a
                        href={`tel:${telHref(secondNumber)}`}
                        className="block text-sand-50 transition-colors hover:text-amber-400"
                      >
                        {secondNumber}
                      </a>
                    ) : null}
                  </dd>
                </div>

                <div>
                  <dt className="mb-1 text-[0.65rem] uppercase tracking-[0.2em] text-amber-400">
                    Email
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${email}`}
                      className="break-all text-sand-50 transition-colors hover:text-amber-400"
                    >
                      {email}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="mb-1 text-[0.65rem] uppercase tracking-[0.2em] text-amber-400">
                    Office hours
                  </dt>
                  <dd className="text-sand-200/80">{hours}</dd>
                </div>
              </dl>

              {contact.whatsapp ? (
                <a
                  href={whatsappHref(contact.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 flex h-11 w-full items-center justify-center rounded-full bg-amber-500 text-sm font-medium text-forest-950 transition-colors hover:bg-amber-400"
                >
                  Message us on WhatsApp
                </a>
              ) : null}
            </div>

            <div className="rounded-card border border-sand-200 bg-white p-7">
              <h2 className="mb-1 text-xl">The heart of Nairobi</h2>
              <p className="mb-5 text-sm leading-relaxed text-muted">
                Visit us at {addressLines[0]} for a personal consultation.
              </p>

              <address className="space-y-1 text-sm not-italic leading-relaxed text-ink">
                {addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </address>

              {mapEmbedUrl ? (
                <iframe
                  src={mapEmbedUrl}
                  title="Map showing our office"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="mt-5 h-56 w-full rounded-lg border-0"
                />
              ) : null}

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  mapQuery
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-forest-700 transition-colors hover:text-amber-600"
              >
                Open in Google Maps
                <span aria-hidden>→</span>
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
