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
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-start justify-between gap-4 bg-stone-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 tracking-wide uppercase">
              <Scale className="w-4 h-4 text-emerald-700" />
              <span>{isUrdu ? 'قانونی شفافیت و ثبوت' : 'Verification Transparency Registry'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              {t.sources_heading}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {t.sources_subheading}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close sources modal"
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-stone-100 bg-white flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            All Sources ({Object.values(SOURCES).length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'verified'
                ? 'bg-emerald-800 text-white'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            Verified Only
          </button>
          <button
            onClick={() => setFilter('unverified')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'unverified'
                ? 'bg-amber-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            Unverified Leads
          </button>
        </div>

        {/* List of Evidence Records */}
        <div className="p-6 overflow-y-auto space-y-4 divide-y divide-stone-100">
          {sourcesList.map((source) => {
            const isVerified = source.verification_status === 'verified';
            return (
              <div key={source.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    {isVerified ? (
                      <span className="flex items-center gap-1 text-emerald-800 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Verified Primary Source</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-800 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Unverified / Secondary Lead</span>
                      </span>
                    )}
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="text-stone-500 uppercase tracking-wider text-[11px] font-mono">
                      [{source.id}] {source.source_type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Audited: {source.last_verified_on}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-stone-900">
                  {source.title}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>{source.issuing_authority}</span>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline flex items-center gap-0.5 ml-2"
                    >
                      <span>Direct Citation Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/70">
                  {source.notes}
                </p>

                {source.limitations && (
                  <p className="text-[11px] text-amber-800 italic">
                    ⚠️ Limitation note: {source.limitations}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Member 4 Field Audit Protocol · Strict Evidence Criteria</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Close Transparency Hub
          </button>
        </div>
      </div>
    </div>
  );
};
