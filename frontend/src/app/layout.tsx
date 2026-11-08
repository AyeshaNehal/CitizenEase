import './globals.css';
import Link from 'next/link';
import { ReactNode } from 'react';

export const metadata = {
  title: 'CitizenEase — Karachi Citizen Preparation & Guidance',
  description: 'Know what documents to bring, what is missing, and where to go before you queue in Karachi, Sindh.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-surface-bg text-primary">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-surface-muted px-4 py-3 sm:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-lg bg-primary text-white font-bold flex items-center justify-center text-lg shadow-sm">
                CE
              </span>
              <div>
                <span className="font-bold text-lg text-primary block leading-none">CitizenEase</span>
                <span className="text-xs text-accent-light font-medium">Karachi Citizen Layer</span>
              </div>
            </Link>

            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/services" className="text-gray-700 hover:text-primary transition-colors">
                Services
              </Link>
              <Link href="/offices" className="text-gray-700 hover:text-primary transition-colors">
                Offices
              </Link>
              <Link href="/sources" className="text-gray-700 hover:text-primary transition-colors">
                Sources
              </Link>
              <div className="border-l border-gray-300 h-5" />
              <button 
                type="button" 
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
                title="Language Toggle (English / اردو)"
              >
                EN / اردو
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content Hub */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>

        {/* Persistent Footer Disclaimer */}
        <footer className="border-t border-surface-muted bg-white text-xs text-gray-500 py-6 px-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="font-semibold text-gray-700">
                ⚠️ Guidance only. Not an official government service.
              </p>
              <p className="mt-0.5">
                CitizenEase does not store CNIC numbers or personal identity data. Legal eligibility is decided solely by issuing government authorities.
              </p>
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">
              Sindh / Karachi Edition • 2026
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
