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
      <div className="bg-white dark:bg-[#102019] rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Scale className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'قانونی شفافیت اور تصدیق کا نظام' : 'Legal Provenance & Verification Ledger'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              {t.sources_heading}
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-3xl leading-relaxed">
              {t.sources_subheading}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block">{verifiedCount} Verified</span>
                <span className="text-stone-500 dark:text-stone-400 text-[10px]">Official Gazettes & Acts</span>
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/60 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <div className="text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-300 block">{unverifiedCount} Cautionary</span>
                <span className="text-stone-500 dark:text-stone-400 text-[10px]">Excluded from Readiness</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 mr-2">
            {isUrdu ? 'فلٹر کریں:' : 'Filter Sources:'}
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            All Sources ({Object.values(SOURCES).length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'verified'
                ? 'bg-emerald-800 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Statutory ({verifiedCount})
          </button>
          <button
            onClick={() => setFilter('unverified')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'unverified'
                ? 'bg-amber-600 dark:bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
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
                    ? 'bg-white dark:bg-[#13261e] border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-sm'
                    : 'bg-amber-50/20 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/60 hover:border-amber-300 dark:hover:border-amber-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-mono text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {source.id}
                    </span>
                    <span className="text-xs font-medium text-stone-500 dark:text-stone-400 capitalize">
                      {source.source_type.replace('_', ' ')}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      isVerified
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {isVerified ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Verified
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        Unverified
                      </>
                    )}
                  </span>
                </div>

                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-2.5 leading-snug">
                  {source.title}
                </h3>

                <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-stone-400 dark:text-stone-500" />
                  <span>{source.issuing_authority}</span>
                </div>

                {source.notes && (
                  <p className="mt-3 text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-[#0c1813] p-3 rounded-xl border border-stone-100 dark:border-stone-800 leading-relaxed">
                    {source.notes}
                  </p>
                )}

                {source.limitations && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-100/80 dark:border-amber-800/40">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{source.limitations}</span>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Verified: {source.last_verified_on}</span>
                  </div>

                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#0C3E2E] dark:text-emerald-400 hover:underline font-semibold"
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
