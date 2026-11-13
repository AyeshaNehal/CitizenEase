import React, { useState } from 'react';
import { I18N, Language } from '../lib/i18n';
import { SOURCES, Source } from '../data/catalog';
import {
  X,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  Scale,
  Building2,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface SourcesModalProps {
  language: Language;
  onClose: () => void;
}

export const SourcesModal: React.FC<SourcesModalProps> = ({ language, onClose }) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';

  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  const sourcesList = Object.values(SOURCES).filter((s) => {
    if (filter === 'all') return true;
    return s.verification_status === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#102019] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-start justify-between gap-4 bg-stone-50/50 dark:bg-[#0c1813]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 tracking-wide uppercase">
              <Scale className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{isUrdu ? 'قانونی شفافیت و ثبوت' : 'Verification Transparency Registry'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              {t.sources_heading}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {t.sources_subheading}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close sources modal"
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-stone-100 dark:border-stone-800 bg-white dark:bg-[#102019] flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            All Sources ({Object.values(SOURCES).length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'verified'
                ? 'bg-emerald-800 dark:bg-emerald-600 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Verified Only
          </button>
          <button
            onClick={() => setFilter('unverified')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'unverified'
                ? 'bg-amber-700 dark:bg-amber-600 text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Unverified Leads
          </button>
        </div>

        {/* Sources List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {sourcesList.map((source) => {
            const isVerified = source.verification_status === 'verified';
            return (
              <div
                key={source.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all h-full flex flex-col justify-between ${
                  isVerified
                    ? 'bg-white dark:bg-[#13261e] border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-600'
                    : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                }`}
              >
                <div className="flex-1 flex flex-col">
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
                          Unverified Lead
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-2">
                    {source.title}
                  </h3>

                  <div className="mt-1 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                    <span>{source.issuing_authority}</span>
                  </div>

                  {source.notes && (
                    <p className="mt-2.5 text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-[#0c1813] p-3 rounded-xl border border-stone-100 dark:border-stone-800 leading-relaxed">
                      {source.notes}
                    </p>
                  )}

                  {source.limitations && (
                    <div className="mt-auto pt-3">
                      <div className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200/70 dark:border-amber-800/40">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <span>{source.limitations}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400 dark:text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Verified: {source.last_verified_on} ({source.verified_by})</span>
                  </div>

                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#0C3E2E] dark:text-emerald-400 hover:underline font-semibold"
                    >
                      <span>Official Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-[#0c1813] border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-semibold text-xs rounded-xl hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer min-h-[44px]"
          >
            {isUrdu ? 'بند کریں' : 'Close Registry'}
          </button>
        </div>
      </div>
    </div>
  );
};
