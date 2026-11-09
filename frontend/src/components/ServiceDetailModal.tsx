import React from 'react';
import { I18N, Language } from '../lib/i18n';
import { SERVICES, ServiceDetail } from '../data/catalog';
import {
  X,
  Scale,
  Building2,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  FileCheck
} from 'lucide-react';

interface ServiceDetailModalProps {
  serviceSlug: 'domicile_prc' | 'first_cnic' | 'passport' | 'frc';
  language: Language;
  onClose: () => void;
  onStartQuestionnaire: (serviceSlug: 'domicile_prc' | 'first_cnic' | 'passport' | 'frc') => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  serviceSlug,
  language,
  onClose,
  onStartQuestionnaire
}) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';
  const service = SERVICES[serviceSlug];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#102019] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 dark:border-stone-800 transition-colors">
        {/* Modal Header */}
        <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
              <Building2 className="w-4 h-4" />
              <span>{isUrdu ? service.authority_ur : service.authority_en}</span>
            </div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              {isUrdu ? service.title_ur : service.title_en}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm text-stone-700 dark:text-stone-300">
          {/* Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1.5">
              {isUrdu ? 'بنیادی مقصد و استعمال' : 'Purpose & Overview'}
            </h3>
            <p className="leading-relaxed text-stone-800 dark:text-stone-200">
              {isUrdu ? service.full_desc_ur : service.full_desc_en}
            </p>
          </div>

          {/* Sindh High Court Ruling Callout (For Domicile & PRC) */}
          {service.court_distinction_en && (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-800/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                <Scale className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>{isUrdu ? 'سندھ ہائی کورٹ کا فیصلہ' : 'Sindh High Court Legal Distinction'}</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-800 dark:text-stone-200">
                {isUrdu ? service.court_distinction_ur : service.court_distinction_en}
              </p>
              <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-300 font-medium">
                Citation: High Court of Sindh Landmark Case law (caselaw.shc.gov.pk)
              </div>
            </div>
          )}

          {/* Key Facts / Who Needs It */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              {isUrdu ? 'یہ دستاویزات کس کے لیے لازمی ہیں؟' : 'Who Typically Needs This?'}
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isUrdu
                    ? 'سندھ کے میڈیکل کالجز، انجینئرنگ یونیورسٹیز (این ای ڈی، ڈاؤ وغیرہ) میں داخلے کے خواہشمند طلباء۔'
                    : 'Students seeking open merit or district quota seats in Sindh public medical & engineering colleges (NED, Dow, etc.).'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isUrdu
                    ? 'سندھ پبلک سروس کمیشن (SPSC) اور صوبائی سرکاری نوکریوں کے امیدوار۔'
                    : 'Applicants for Sindh Public Service Commission (SPSC) positions and provincial civil government jobs.'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  {isUrdu
                    ? '18 سال کی عمر کو پہنچنے والے پاکستانی شہری جنہیں قانونی شناخت اور ووٹ کا حق حاصل کرنا ہو۔'
                    : 'Pakistani citizens turning 18 needing primary legal identification, banking, and voter registration.'}
                </span>
              </li>
            </ul>
          </div>

          {/* Fee Policy Disclaimer */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-[#0c1813] border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{isUrdu ? 'فیس کے متعلق اہم انتباہ' : 'Official Treasury Fee Policy'}</span>
            </div>
            <p>
              {isUrdu ? service.official_fee_note_ur : service.official_fee_note_en}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/50 dark:bg-[#0c1813] rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            {isUrdu ? 'بند کریں' : 'Cancel & Close'}
          </button>
          <button
            onClick={() => {
              onClose();
              onStartQuestionnaire(serviceSlug);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-[#0C3E2E] hover:bg-[#0A3426] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <FileCheck className="w-4 h-4" />
            <span>{isUrdu ? 'سوالنامہ اور چیک لسٹ شروع کریں' : 'Start Assessment Questionnaire'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
