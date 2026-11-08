'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [discovering, setDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setDiscovering(true);
    try {
      const res = await api.discoverIntent(query);
      setDiscoveryResult(res);
      if (res.service_slug) {
        // Auto-suggest navigation
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <div className="space-y-10 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span>Karachi, Sindh Edition</span>
          <span>•</span>
          <span>Verified Government Checklists</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
          Never waste a trip to the DC Office or NADRA.
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          CitizenEase tells you exactly what to bring, what is missing, and where to go before you queue, in Urdu or English.
        </p>

        {/* AI Intent Discovery / Search Box */}
        <form onSubmit={handleDiscover} className="relative mt-4 max-w-xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your need: 'I need proof I belong to Karachi' or 'turning 18'..."
            className="w-full px-4 py-3.5 pr-28 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={discovering}
            className="absolute right-2 top-2 bottom-2 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center"
          >
            {discovering ? 'Analyzing...' : 'Find Guide'}
          </button>
        </form>

        {discoveryResult && (
          <div className="mt-4 p-4 rounded-xl border border-accent/20 bg-accent/5 text-left text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-primary">Recommendation</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                {Math.round(discoveryResult.confidence * 100)}% match
              </span>
            </div>
            {discoveryResult.clarifying_question && (
              <p className="text-gray-700">{discoveryResult.clarifying_question}</p>
            )}
            {discoveryResult.service_slug && (
              <div className="pt-2">
                <Link
                  href={`/services/${discoveryResult.service_slug}`}
                  className="inline-block px-4 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Start Preparing for {discoveryResult.service_slug === 'domicile_prc' ? 'Domicile & PRC' : 'First CNIC'} →
                </Link>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Two Core Services Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-primary">Government Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service 1: Domicile & PRC */}
          <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">Karachi DC Office</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                  Stricter Rules Active
                </span>
              </div>
              <h3 className="text-xl font-bold text-primary">Domicile & PRC (Karachi)</h3>
              <p className="text-sm text-gray-600 mt-2">
                Sindh High Court case law distinctions, district-specific document requirements, PRC Form C for admissions and provincial job quotas.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">6 questionnaire steps</span>
              <Link
                href="/services/domicile_prc"
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                Start Checklist →
              </Link>
            </div>
          </div>

          {/* Service 2: First-Time CNIC */}
          <div className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">NADRA Pakistan</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                  2026 Biometric Rules
                </span>
              </div>
              <h3 className="text-xl font-bold text-primary">First-Time CNIC (Age 18)</h3>
              <p className="text-sm text-gray-600 mt-2">
                Complete preparation for turning 18: B-Form requirements, parent presence protocol, and nearest 24/7 Mega Centre locations in Karachi.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">3 questionnaire steps</span>
              <Link
                href="/services/first_cnic"
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                Start Checklist →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Core Values */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
        <h2 className="text-lg font-bold text-primary">How CitizenEase Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <span className="font-bold text-primary">1. Answer 4-6 questions</span>
            <p className="text-gray-600 text-xs">
              Tell us your district, purpose (job/admission), and document status. No personal names or CNIC numbers needed.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-primary">2. Get personalized checklist</span>
            <p className="text-gray-600 text-xs">
              Our deterministic rules engine builds your exact list with verified source citations and readiness score.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-primary">3. Know where to submit</span>
            <p className="text-gray-600 text-xs">
              Find your designated DC or NADRA office with map directions and submission counter hours before leaving home.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
