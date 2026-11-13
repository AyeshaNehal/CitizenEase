import './globals.css';
import { ReactNode } from 'react';
import { DeveloperFooter } from '@/components/DeveloperFooter';

export const metadata = {
  title: 'CitizenEase — Karachi Domicile, PRC & CNIC Preparation',
  description: 'CitizenEase tells a Karachi citizen exactly what to bring, what is still missing, and where to go before queuing, in Urdu or English.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-[#FAF8F5] text-stone-900 antialiased selection:bg-emerald-100 selection:text-emerald-900 min-h-screen flex flex-col" suppressHydrationWarning>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <DeveloperFooter />
      </body>
    </html>
  );
}
