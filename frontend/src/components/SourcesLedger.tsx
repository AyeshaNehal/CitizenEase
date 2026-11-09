'use client';

import React, { useState } from 'react';
import { I18N, Language } from '../lib/i18n';
import { SOURCES, Source } from '../data/catalog';
import {
  BookOpen,
  ShieldCheck,
  AlertCircle,
  Scale,
  Building2,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SourcesLedgerProps {
  language: Language;
}

export const SourcesLedger: React.FC<SourcesLedgerProps> = ({ language }) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';

  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  const sourcesList = Object.values(SOURCES).filter((s) => {
    if (filter === 'all') return true;
    return s.verification_status === filter;
  });

  const verifiedCount = Object.values(SOURCES).filter(s => s.verification_status === 'verified').length;
  const unverifiedCount = Object.values(SOURCES).filter(s => s.verification_status === 'unverified').length;

  return (
    <section id="sources" className="space-y-6 scroll-mt-24">
      {/* Section Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <Scale className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'قانونی شفافیت اور تصدیق کا نظام' : 'Legal Provenance & Verification Ledger'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {t.sources_heading}
            </h2>
            <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">
              {t.sources_subheading}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <div className="text-xs">
                <span className="font-bold text-emerald-900 block">{verifiedCount} Verified</span>
                <span className="text-stone-500 text-[10px]">Official Gazettes & Acts</span>
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <div className="text-xs">
                <span className="font-bold text-amber-900 block">{unverifiedCount} Cautionary</span>
                <span className="text-stone-500 text-[10px]">Excluded from Readiness</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 pt-6 border-t border-stone-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-stone-500 mr-2">
            {isUrdu ? 'فلٹر کریں:' : 'Filter Sources:'}
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Sources ({Object.values(SOURCES).length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'verified'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Statutory ({verifiedCount})
          </button>
          <button
            onClick={() => setFilter('unverified')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'unverified'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Cautionary News/Secondary ({unverifiedCount})
          </button>
        </div>

        {/* Sources Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {sourcesList.map((source) => {
            const isVerified = source.verification_status === 'verified';

            return (
              <div
                key={source.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isVerified
                    ? 'bg-white border-stone-200 hover:border-emerald-300 hover:shadow-sm'
                    : 'bg-amber-50/20 border-amber-200/80 hover:border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 font-mono text-xs font-semibold text-stone-700">
                      {source.id}
                    </span>
                    <span className="text-xs font-medium text-stone-500 capitalize">
                      {source.source_type.replace('_', ' ')}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isVerified ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Unverified
                      </>
                    )}
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 mt-2.5 leading-snug">
                  {source.title}
                </h3>

                <div className="mt-2 text-xs text-stone-500 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                  <span>{source.issuing_authority}</span>
                </div>

                {source.notes && (
                  <p className="mt-3 text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100 leading-relaxed">
                    {source.notes}
                  </p>
                )}

                {source.limitations && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/80">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{source.limitations}</span>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Verified: {source.last_verified_on}</span>
                  </div>

                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#0C3E2E] hover:underline font-semibold"
                    >
                      <span>Official Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
