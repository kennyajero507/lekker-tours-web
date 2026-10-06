import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ContactLauncher } from '@/components/layout/ContactLauncher';
import { getSettings } from '@/lib/settings';
import { resolveBranding } from '@/lib/branding';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const whatsapp = settings.contact.whatsapp || settings.contact.phone;
  const branding = resolveBranding(settings);

  // Switched on with no text is treated as off: an empty bar is just a stripe.
  const { banner } = settings;
  const announcement =
    banner.active && banner.announcementText
      ? { text: banner.announcementText, ctaLabel: banner.ctaLabel, ctaLink: banner.ctaLink }
      : undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        phone={settings.contact.phone}
        whatsapp={settings.contact.whatsapp}
        siteName={branding.siteName}
        logoUrl={branding.logoUrl}
        announcement={announcement}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      {whatsapp ? <ContactLauncher phone={whatsapp} /> : null}
    </div>
  );
}
