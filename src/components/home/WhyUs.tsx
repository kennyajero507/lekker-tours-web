import Image from 'next/image';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import type { SiteSettings } from '@/types';

/**
 * Two-column block: narrative and CTAs on the left, a 2x2 photo grid on the
 * right with each value's label overlaid on its image.
 */
const PHOTOS = [
  { url: '/images/maasai-warrior-portrait.jpg', alt: 'A guide in traditional dress' },
  { url: '/images/mara-lioness-cubs.jpg', alt: 'A lioness resting with her cubs' },
  { url: '/images/lodge-deck-chairs.jpg', alt: 'A lodge deck looking out over the plains' },
  { url: '/images/amboseli-elephant-kilimanjaro.jpg', alt: 'An elephant with Kilimanjaro behind' },
];

export function WhyUs({
  values,
  phone,
}: {
  values: SiteSettings['values'];
  phone: string;
}) {
  if (!values?.length) return null;

  const cards = values.slice(0, 4).map((value, i) => ({
    ...value,
    photo: PHOTOS[i % PHOTOS.length],
  }));

  return (
    <section className="bg-white py-12 sm:py-16 md:py-28">
      <div className="container-page grid gap-8 md:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <p className="mb-3 text-[0.68rem] uppercase tracking-[0.3em] text-amber-600">
            Why Lekker
          </p>
          <h2 className="text-[1.7rem] leading-[1.2] sm:text-3xl md:text-[2.6rem] md:leading-[1.15]">
            Journeys that connect you deeply with Africa.
          </h2>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
            <p>
              Lekker Tours and Travel is a Nairobi-based company creating memorable wildlife and
              leisure travel experiences across Kenya, Tanzania, Uganda, Rwanda and Zanzibar. Every
              itinerary is built around the traveller’s own priorities rather than a fixed package.
            </p>
            <p>
              We pair the classic wildlife circuits with the quieter corners most travellers never
              reach: private conservancies, walking country, and camps where the only sound after
              dark is the bush itself. Nothing is off the shelf.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact">Contact us</ButtonLink>
            <ButtonLink href={`tel:${phone.replace(/[^\d+]/g, '')}`} variant="ghost">
              {phone}
            </ButtonLink>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {cards.map((card, i) => (
            <Reveal key={card.title} delay={i * 80}>
              <article className="group relative aspect-[3/4] overflow-hidden rounded-card sm:aspect-[4/5]">
                <Image
                  src={card.photo.url}
                  alt={card.photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-forest-950/92 via-forest-950/35 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5">
                  <h3 className="text-sm text-white sm:text-lg">{card.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[0.68rem] leading-relaxed text-sand-100/80 sm:mt-1.5 sm:line-clamp-3 sm:text-xs">
                    {card.description}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
