import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { SiteSettings } from '@/types';

/** Also offered to the service cards on /services. */
export const ICONS: Record<string, React.ReactNode> = {
  compass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 10-5 16-9 16Z" />
      <path d="M8 17c2-4 5-6 9-8" />
    </svg>
  ),
  receipt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M5 3v18l2-1.5L9 21l2-1.5L13 21l2-1.5L17 21l2-1.5V3z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  ),
};

export function ValuesGrid({ values }: { values: SiteSettings['values'] }) {
  if (!values?.length) return null;

  return (
    <section className="bg-sand-50 py-12 sm:py-16 md:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Why Lekker"
          title="The pulse of the wilderness, the precision of Nairobi"
          description="Local destination knowledge, responsive service and carefully selected travel partners."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, i) => (
            <Reveal key={value.title} delay={i * 90}>
              <article className="h-full rounded-card border border-sand-200 bg-white p-7 transition-all duration-500 ease-soft hover:-translate-y-1 hover:border-amber-300 hover:shadow-card">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-forest-50 text-forest-700 [&>svg]:h-6 [&>svg]:w-6">
                  {ICONS[value.icon ?? ''] ?? ICONS.compass}
                </span>
                <h3 className="mb-3 text-lg">{value.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{value.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
