'use client';

import React, { Suspense } from 'react';
import { OfficeLocator } from '@/components/OfficeLocator';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useRouter } from 'next/navigation';

export default function OfficesRoute() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900">
      <Navbar
        language="en"
        onToggleLanguage={() => {}}
        activeView="offices"
        onNavigate={(view) => {
          if (view === 'home') router.push('/');
          else if (view === 'checklist') router.push('/?view=checklist');
          else if (view === 'sources') router.push('/sources');
        }}
        hasActiveChecklist={true}
        onOpenAssistant={() => router.push('/?view=checklist')}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="text-center py-12 text-sm text-stone-500">Loading office locator...</div>}>
          <OfficeLocator language="en" />
        </Suspense>
      </main>
      <Footer language="en" onOpenSources={() => router.push('/sources')} />
    </div>
  );
}
