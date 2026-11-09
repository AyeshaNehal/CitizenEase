import React from 'react';
import { I18N, Language } from '../lib/i18n';
import { ShieldCheck, Scale, ExternalLink } from 'lucide-react';

interface FooterProps {
  language: Language;
  onOpenSources: () => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onOpenSources }) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';

  return (
    <footer className="no-print mt-16 bg-stone-900 text-stone-300 border-t border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Core Regulatory Warning Bar */}
        <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-200 tracking-wide">
                {isUrdu ? 'قانونی انتباہ و خودمختاری' : 'LEGAL DISCLAIMER & CIVIC BOUNDARY'}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                {t.persistent_disclaimer}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenSources}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium whitespace-nowrap underline shrink-0 flex items-center gap-1"
          >
            <span>{isUrdu ? 'تمام قانونی ذرائع دیکھیں' : 'Review Legal Sources & Audit'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-stone-400">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white text-sm">{t.app_name}</span>
            </div>
            <p className="leading-relaxed">
              {isUrdu
                ? 'کراچی سندھ کے شہریوں کے لیے ڈومیسائل، پی آر سی اور نادرا شناختی کارڈ کے تقاضوں کی پیشگی جانچ۔'
                : 'A civic preparation layer empowering Karachi residents with deterministic requirements, transparent sources, and grounded guidance.'}
            </p>
            <p className="mt-3 text-stone-500">
              {isUrdu ? 'رازداری: کوئی شناختی کارڈ نمبر محفوظ نہیں کیا جاتا۔' : 'Privacy-First: Zero PII stored. No CNIC numbers collected.'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-stone-200 mb-2">
              {isUrdu ? 'بنیادی قانونی حوالہ جات' : 'Key Sindh Legal Foundations'}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://caselaw.shc.gov.pk"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-stone-200 flex items-center gap-1 transition-colors"
                >
                  <span>Sindh Permanent Residence Certificate Rules 1971 (caselaw.shc.gov.pk)</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <span className="text-stone-400">Pakistan Citizenship Act 1951 & Rules 1952 (Domicile)</span>
              </li>
              <li>
                <a
                  href="https://id.nadra.gov.pk"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-stone-200 flex items-center gap-1 transition-colors"
                >
                  <span>NADRA PakID Citizen Portal Regulations 2026</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-stone-200 mb-2">
              {isUrdu ? 'کراچی کے تمام اضلاع کا احاطہ' : 'Covering All 7 Karachi Districts'}
            </h4>
            <div className="text-stone-400 space-y-1">
              <p>Karachi South · Karachi East · Karachi Central</p>
              <p>Karachi West · Karachi Keamari · Karachi Korangi · Malir</p>
              <p className="text-stone-500 mt-2">
                {isUrdu ? 'ڈی سی نوٹس بورڈ معائنے کی تازہ ترین تاریخ: نومبر 2026' : 'Last on-site DC board audit: November 2026'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-800 text-center text-[11px] text-stone-500">
          CitizenEase Karachi · Independent Civic Preparation Tool · Muhammad & Team Hackathon MVP · Not affiliated with DC Office or NADRA.
        </div>
      </div>
    </footer>
  );
};
