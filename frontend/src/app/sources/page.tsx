'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { SourcesModal } from '@/components/SourcesModal';
import { useRouter } from 'next/navigation';

export default function SourcesRoute() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900">
      <Navbar
        language="en"
        onToggleLanguage={() => {}}
        activeView="sources"
        onNavigate={(view) => {
          if (view === 'home') router.push('/');
          else if (view === 'checklist') router.push('/?view=checklist');
          else if (view === 'offices') router.push('/offices');
        }}
        hasActiveChecklist={true}
        onOpenAssistant={() => router.push('/')}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-sm text-center space-y-4">
          <h1 className="text-2xl font-bold text-stone-900">Sources & Legal Evidence Archive</h1>
          <p className="text-sm text-stone-600 max-w-xl mx-auto">
            Review primary case law citations, gazette notifications, and verified DC inspection evidence.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 bg-emerald-800 text-white font-semibold rounded-xl hover:bg-emerald-900 transition-colors"
          >
            Open Full Verification Registry
          </button>
        </div>
      </main>
      <Footer language="en" onOpenSources={() => setModalOpen(true)} />
      {modalOpen && (
        <SourcesModal
          language="en"
          onClose={() => router.push('/')}
        />
      )}
    </div>
  );
}
