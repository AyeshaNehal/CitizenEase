import React, { useState } from 'react';
import { I18N, Language } from '../lib/i18n';
import { SERVICES, ServiceDetail, ServiceSlug } from '../data/catalog';
import { discoverServiceIntent, IntentDiscoveryResult } from '../lib/geminiAssistant';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  MapPin,
  Scale,
  CreditCard
} from 'lucide-react';

interface ServiceDiscoveryProps {
  language: Language;
  onSelectService: (serviceSlug: ServiceSlug) => void;
  onOpenServiceDetail: (serviceSlug: ServiceSlug) => void;
  onOpenOffices: () => void;
  onOpenAssistant: (initialPrompt?: string) => void;
}

export const ServiceDiscovery: React.FC<ServiceDiscoveryProps> = ({
  language,
  onSelectService,
  onOpenServiceDetail,
  onOpenOffices,
  onOpenAssistant
}) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<IntentDiscoveryResult | null>(null);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const result = await discoverServiceIntent(searchQuery);
      setDiscoveryResult(result);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTagClick = (tagQuery: string) => {
    setSearchQuery(tagQuery);
    setIsSearching(true);
    discoverServiceIntent(tagQuery).then(res => {
      setDiscoveryResult(res);
      setIsSearching(false);
    });
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:py-12 px-4 sm:px-6 rounded-3xl bg-gradient-to-b from-[#0C3E2E]/8 to-[#0C3E2E]/2 dark:from-emerald-950/40 dark:to-emerald-950/10 border border-emerald-900/10 dark:border-emerald-800/30 transition-colors">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          {/* Unboxed Metadata Tagline */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400 tracking-wide uppercase">
            <span>{isUrdu ? 'کراچی پبلک سروس گائیڈ' : 'Karachi Civic Preparation'}</span>
            <span aria-hidden="true">·</span>
            <span>{isUrdu ? 'تصدیق شدہ دستاویزی ریکارڈ' : 'Deterministic Rules & Verified Evidence'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-tight text-balance">
            {t.hero_title_lead}{' '}
            <span className="text-[#0C3E2E] dark:text-emerald-400 block sm:inline underline decoration-emerald-500/40 decoration-wavy underline-offset-8">
              {t.hero_title_accent}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
            {t.hero_desc}
          </p>

          {/* AI Intent Search Box */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto">
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-white dark:bg-[#11221b] rounded-2xl shadow-md border border-stone-200 dark:border-stone-700/80 transition-colors">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-stone-400 dark:text-stone-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search_placeholder}
                  className="w-full pl-11 pr-4 py-3 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 bg-transparent rounded-xl focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-[#0C3E2E] hover:bg-[#0A3426] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer min-h-[44px]"
              >
                {isSearching ? (
                  <span className="inline-block animate-spin">⏳</span>
                ) : (
                  <Sparkles className="w-4 h-4 text-emerald-300 dark:text-emerald-100" />
                )}
                <span>{t.ask_ai_discovery_btn}</span>
              </button>
            </div>
          </form>

          {/* AI Discovery Match Banner (Appears if searched) */}
          {discoveryResult && discoveryResult.service_slug && (
            <div className="mt-6 p-5 text-left bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-300/80 dark:border-emerald-700/60 rounded-2xl animate-fade-in shadow-xs transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isUrdu ? discoveryResult.summary_ur : discoveryResult.summary_en}</span>
                  </div>
                  <p className="text-sm text-stone-700 dark:text-stone-300">
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      {isUrdu ? 'ضروری وضاحت: ' : 'Clarification: '}
                    </span>
                    {isUrdu ? discoveryResult.clarifying_question_ur : discoveryResult.clarifying_question_en}
                  </p>
                </div>
                <button
                  onClick={() => onSelectService(discoveryResult.service_slug!)}
                  className="px-4 py-2.5 bg-[#0C3E2E] hover:bg-[#093124] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap min-h-[44px]"
                >
                  <span>{isUrdu ? 'چیک لسٹ شروع کریں' : 'Start Checklist'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Discovery Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-600 dark:text-stone-400">
            <span className="text-stone-400 dark:text-stone-500 font-medium">{t.popular_searches}</span>
            <button
              onClick={() => handleTagClick('What is the difference between Domicile and PRC?')}
              className="px-2.5 py-1 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors text-stone-700 dark:text-stone-300 cursor-pointer"
            >
              {t.popular_tag_1}
            </button>
            <button
              onClick={() => handleTagClick('I am turning 18 and need my first CNIC from NADRA')}
              className="px-2.5 py-1 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors text-stone-700 dark:text-stone-300 cursor-pointer"
            >
              {t.popular_tag_2}
            </button>
            <button
              onClick={() => handleTagClick('Keamari district domicile transfer from DC West')}
              className="px-2.5 py-1 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors text-stone-700 dark:text-stone-300 cursor-pointer"
            >
              {t.popular_tag_3}
            </button>
          </div>
        </div>
      </section>

      {/* Critical Legal Distinction Callout (Sindh High Court Landmark Baseline) */}
      <section className="p-5 sm:p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-800/50 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                <span>{isUrdu ? 'سندھ ہائی کورٹ قانونی فیصلہ' : 'SINDH HIGH COURT LEGAL PRECEDENT'}</span>
                <span aria-hidden="true">·</span>
                <span>caselaw.shc.gov.pk</span>
              </div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                {isUrdu
                  ? 'ڈومیسائل اور پی آر سی الگ الگ قانونی دستاویزات ہیں'
                  : 'Domicile & PRC are Distinct Legal Instruments in Sindh'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 mt-1 leading-relaxed max-w-3xl">
                {isUrdu
                  ? 'ڈومیسائل وفاقی قانون (پاکستان سٹیزن شپ ایکٹ 1951) کے تحت بنتا ہے، جبکہ پی آر سی سندھ گورنمنٹ رولز 1971 کے تحت جاری ہوتا ہے۔ میڈیکل، انجینئرنگ کالج داخلوں اور سندھ جاب کوٹے کے لیے پی آر سی فارم سی لازمی ہے۔'
                  : 'A domicile certifies federal citizenship residence under the Pakistan Citizenship Act 1951. The Permanent Residence Certificate (PRC) is governed separately under the Sindh PRC Rules 1971. University admissions and public sector jobs in Sindh strictly require PRC Form-C.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenServiceDetail('domicile_prc')}
            className="text-xs font-semibold text-amber-900 dark:text-amber-200 hover:text-amber-800 dark:hover:text-amber-100 bg-amber-200/60 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 px-3.5 py-2 rounded-xl transition-colors shrink-0 whitespace-nowrap min-h-[40px] flex items-center gap-1 self-end md:self-center cursor-pointer"
          >
            <span>{isUrdu ? 'مکمل تفریق دیکھیں' : 'Read Full Comparison'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Services Grid (All 4 Services) */}
      <section className="space-y-6">
        <div className="text-left space-y-1">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {t.services_heading}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {t.services_subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Domicile & PRC */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 hover:border-emerald-700/40 dark:hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-md group">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-right text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-400">100% {isUrdu ? 'مصدقہ قواعد' : 'Verified Rules'}</span>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">{isUrdu ? 'آخری معائنہ: نومبر 2026' : 'Audited: Nov 2026'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#0C3E2E] dark:group-hover:text-emerald-400 transition-colors">
                  {isUrdu ? SERVICES.domicile_prc.title_ur : SERVICES.domicile_prc.title_en}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                  <span>{isUrdu ? SERVICES.domicile_prc.authority_ur : SERVICES.domicile_prc.authority_en}</span>
                </div>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {isUrdu ? SERVICES.domicile_prc.short_desc_ur : SERVICES.domicile_prc.short_desc_en}
              </p>

              {/* Status Summary */}
              <div className="pt-2 pb-1 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>8 {t.verified_rules_count}</span>
                </span>
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>2 {t.unverified_rules_count}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => onSelectService('domicile_prc')}
                className="w-full sm:flex-1 py-3 px-4 bg-[#0C3E2E] hover:bg-[#0A3426] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>{t.start_checklist_btn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenServiceDetail('domicile_prc')}
                className="w-full sm:w-auto py-3 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer min-h-[44px]"
              >
                {t.view_details_btn}
              </button>
            </div>
          </div>

          {/* Card 2: First-Time Adult CNIC */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 hover:border-emerald-700/40 dark:hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-md group">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-center text-teal-800 dark:text-teal-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-right text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-teal-800 dark:text-teal-400">{isUrdu ? 'نادرا پاک آئی ڈی ضوابط' : 'NADRA 2026 Rules'}</span>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">{isUrdu ? 'بائیو میٹرک شرائط فعال' : 'Biometric B-Form policy'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#0C3E2E] dark:group-hover:text-emerald-400 transition-colors">
                  {isUrdu ? SERVICES.first_cnic.title_ur : SERVICES.first_cnic.title_en}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                  <span>{isUrdu ? SERVICES.first_cnic.authority_ur : SERVICES.first_cnic.authority_en}</span>
                </div>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {isUrdu ? SERVICES.first_cnic.short_desc_ur : SERVICES.first_cnic.short_desc_en}
              </p>

              {/* Status Summary */}
              <div className="pt-2 pb-1 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>5 {t.verified_rules_count}</span>
                </span>
                <span className="text-stone-500 dark:text-stone-400">
                  {isUrdu ? 'خونی گواہ کی موجودگی لازمی' : 'Blood Relative Witness Required'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => onSelectService('first_cnic')}
                className="w-full sm:flex-1 py-3 px-4 bg-[#0C3E2E] hover:bg-[#0A3426] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>{t.start_checklist_btn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenServiceDetail('first_cnic')}
                className="w-full sm:w-auto py-3 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer min-h-[44px]"
              >
                {t.view_details_btn}
              </button>
            </div>
          </div>

          {/* Card 3: Machine Readable Passport (DGI&P) */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 hover:border-emerald-700/40 dark:hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-md group">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-800 dark:text-blue-300">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-right text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-blue-800 dark:text-blue-400">{isUrdu ? 'امیگریشن و پاسپورٹ قواعد' : 'DGI&P Official'}</span>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">{isUrdu ? 'تجدید و نیا پاسپورٹ' : 'Fresh & Renewal'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#0C3E2E] dark:group-hover:text-emerald-400 transition-colors">
                  {isUrdu ? SERVICES.passport.title_ur : SERVICES.passport.title_en}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                  <span>{isUrdu ? SERVICES.passport.authority_ur : SERVICES.passport.authority_en}</span>
                </div>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {isUrdu ? SERVICES.passport.short_desc_ur : SERVICES.passport.short_desc_en}
              </p>

              {/* Status Summary */}
              <div className="pt-2 pb-1 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>6 {t.verified_rules_count}</span>
                </span>
                <span className="text-stone-500 dark:text-stone-400">
                  {isUrdu ? 'بینک رسید یا ایپ واؤچر' : 'Bank Receipt / App Voucher'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => onSelectService('passport')}
                className="w-full sm:flex-1 py-3 px-4 bg-[#0C3E2E] hover:bg-[#0A3426] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>{t.start_checklist_btn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenServiceDetail('passport')}
                className="w-full sm:w-auto py-3 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer min-h-[44px]"
              >
                {t.view_details_btn}
              </button>
            </div>
          </div>

          {/* Card 4: Family Registration Certificate (FRC - NADRA) */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 hover:border-emerald-700/40 dark:hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-md group">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center text-indigo-800 dark:text-indigo-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-right text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-indigo-800 dark:text-indigo-400">{isUrdu ? 'نادرا خاندانی شجرہ' : 'NADRA Family Tree'}</span>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">{isUrdu ? 'پیدائشی و ازدواجی' : 'By Birth / By Marriage'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#0C3E2E] dark:group-hover:text-emerald-400 transition-colors">
                  {isUrdu ? SERVICES.frc.title_ur : SERVICES.frc.title_en}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                  <span>{isUrdu ? SERVICES.frc.authority_ur : SERVICES.frc.authority_en}</span>
                </div>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {isUrdu ? SERVICES.frc.short_desc_ur : SERVICES.frc.short_desc_en}
              </p>

              {/* Status Summary */}
              <div className="pt-2 pb-1 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>4 {t.verified_rules_count}</span>
                </span>
                <span className="text-stone-500 dark:text-stone-400">
                  {isUrdu ? 'کمپیوٹرائزڈ نکاح نامہ' : 'NADRA MRC Required for Marriage'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => onSelectService('frc')}
                className="w-full sm:flex-1 py-3 px-4 bg-[#0C3E2E] hover:bg-[#0A3426] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>{t.start_checklist_btn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenServiceDetail('frc')}
                className="w-full sm:w-auto py-3 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer min-h-[44px]"
              >
                {t.view_details_btn}
              </button>
            </div>
          </div>

          {/* Card 5: Birth Certificate (Union Council) */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 hover:border-emerald-700/40 dark:hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-md group">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-800 dark:text-amber-300">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-right text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-amber-800 dark:text-amber-400">{isUrdu ? 'بنیادی شہری رجسٹریشن' : 'Foundation Identity'}</span>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">{isUrdu ? 'یونین کونسل کراچی' : 'Union Council Karachi'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#0C3E2E] dark:group-hover:text-emerald-400 transition-colors">
                  {isUrdu ? SERVICES.birth_certificate.title_ur : SERVICES.birth_certificate.title_en}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                  <span>{isUrdu ? SERVICES.birth_certificate.authority_ur : SERVICES.birth_certificate.authority_en}</span>
                </div>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {isUrdu ? SERVICES.birth_certificate.short_desc_ur : SERVICES.birth_certificate.short_desc_en}
              </p>

              {/* Status Summary */}
              <div className="pt-2 pb-1 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>{isUrdu ? 'فیس و ضوابط دفتر سے تصدیق طلب' : 'Fees confirm with office'}</span>
                </span>
                <span className="text-stone-500 dark:text-stone-400">
                  {isUrdu ? 'ہسپتال پرچی لازمی' : 'Hospital Slip Required'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => onSelectService('birth_certificate')}
                className="w-full sm:flex-1 py-3 px-4 bg-[#0C3E2E] hover:bg-[#0A3426] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>{t.start_checklist_btn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenServiceDetail('birth_certificate')}
                className="w-full sm:w-auto py-3 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer min-h-[44px]"
              >
                {t.view_details_btn}
              </button>
            </div>
          </div>

          {/* Card 6: B-Form / Child Registration Certificate (NADRA) */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 hover:border-emerald-700/40 dark:hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-md group">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-center text-teal-800 dark:text-teal-300">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="text-right text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-teal-800 dark:text-teal-400">{isUrdu ? '18 سال سے کم عمر' : 'Under 18 Years'}</span>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">{isUrdu ? 'نادرا سی آر سی' : 'NADRA CRC'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#0C3E2E] dark:group-hover:text-emerald-400 transition-colors">
                  {isUrdu ? SERVICES.b_form.title_ur : SERVICES.b_form.title_en}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                  <span>{isUrdu ? SERVICES.b_form.authority_ur : SERVICES.b_form.authority_en}</span>
                </div>
              </div>

              {/* Do This First Callout */}
              <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 text-xs text-blue-950 dark:text-blue-200">
                <div className="font-bold flex items-center gap-1.5 text-blue-900 dark:text-blue-300">
                  <span>📌 {isUrdu ? 'پہلے یہ مکمل کریں:' : 'Do this first:'}</span>
                  <span>{isUrdu ? 'یونین کونسل برتھ سرٹیفکیٹ' : 'Union Council Birth Certificate'}</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                  {isUrdu
                    ? 'ب فارم سے پہلے متعلقہ یونین کونسل سے کمپیوٹرائزڈ برتھ سرٹیفکیٹ بنوانا لازمی ہے۔'
                    : 'A computerized UC birth certificate must be obtained before NADRA registration.'}
                </p>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {isUrdu ? SERVICES.b_form.short_desc_ur : SERVICES.b_form.short_desc_en}
              </p>

              {/* Status Summary */}
              <div className="pt-2 pb-1 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isUrdu ? 'مصدقہ نادرا قوانین' : 'Verified CRC Rules'}</span>
                </span>
                <span className="text-stone-500 dark:text-stone-400">
                  {isUrdu ? 'والدین کی بائیو میٹرک لازمی' : 'Parent Biometric Required'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => onSelectService('b_form')}
                className="w-full sm:flex-1 py-3 px-4 bg-[#0C3E2E] hover:bg-[#0A3426] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>{t.start_checklist_btn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenServiceDetail('b_form')}
                className="w-full sm:w-auto py-3 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer min-h-[44px]"
              >
                {t.view_details_btn}
              </button>
            </div>
          </div>

          {/* Card 7: Smart CNIC / SNIC (NADRA) */}
          <div className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 hover:border-emerald-700/40 dark:hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-md group">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/80 dark:border-cyan-800/60 flex items-center justify-center text-cyan-800 dark:text-cyan-300">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-right text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-cyan-800 dark:text-cyan-400">{isUrdu ? 'چپ والا سمارٹ کارڈ' : 'Microchip Security'}</span>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">{isUrdu ? 'آئی سی اے او معیار' : 'ICAO Standard'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#0C3E2E] dark:group-hover:text-emerald-400 transition-colors">
                  {isUrdu ? SERVICES.smart_card.title_ur : SERVICES.smart_card.title_en}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                  <span>{isUrdu ? SERVICES.smart_card.authority_ur : SERVICES.smart_card.authority_en}</span>
                </div>
              </div>

              {/* Do This First Callout */}
              <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 text-xs text-blue-950 dark:text-blue-200">
                <div className="font-bold flex items-center gap-1.5 text-blue-900 dark:text-blue-300">
                  <span>📌 {isUrdu ? 'پہلے یہ مکمل کریں:' : 'Do this first:'}</span>
                  <span>{isUrdu ? 'پہلا شناختی کارڈ یا نادرا ریکارڈ' : 'First-time CNIC or B-Form Record'}</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                  {isUrdu
                    ? 'سمارٹ کارڈ کے لیے سابقہ شناختی کارڈ یا نادرا میں تصدیق شدہ پیدائشی ریکارڈ لازمی ہے۔'
                    : 'Must hold previous CNIC or established NADRA citizen record.'}
                </p>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                {isUrdu ? SERVICES.smart_card.short_desc_ur : SERVICES.smart_card.short_desc_en}
              </p>

              {/* Status Summary */}
              <div className="pt-2 pb-1 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isUrdu ? '100% مصدقہ قواعد' : '100% Verified Rules'}</span>
                </span>
                <span className="text-stone-500 dark:text-stone-400">
                  {isUrdu ? 'نارمل فیس: 750 روپے' : 'Normal Fee: Rs. 750'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => onSelectService('smart_card')}
                className="w-full sm:flex-1 py-3 px-4 bg-[#0C3E2E] hover:bg-[#0A3426] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <span>{t.start_checklist_btn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenServiceDetail('smart_card')}
                className="w-full sm:w-auto py-3 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer min-h-[44px]"
              >
                {t.view_details_btn}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Step Flow */}
      <section className="pt-6 pb-2 border-t border-stone-200 dark:border-stone-800">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {isUrdu ? 'سٹیزن ایز کیسے کام کرتا ہے؟' : 'How CitizenEase Works'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            {isUrdu
              ? 'قطار میں گھنٹوں ضائع ہونے سے بچنے کے لیے تین آسان مراحل'
              : 'Three transparent steps designed to eliminate wasted counter trips and missing papers'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
              {isUrdu ? '1. رہائشی صورتحال کا جائزہ' : '1. Answer Specific Questions'}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {isUrdu
                ? 'اپنا ضلع، تعلیمی حیثیت اور والدین کے ریکارڈ کے متعلق چند سوالات کے جوابات دیں، جس سے متعلقہ قواعد کا تعین ہو۔'
                : 'Select your Karachi district, applicant type (student/employed), and parental records. Deterministic rules decide what applies.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
              {isUrdu ? '2. تصدیق شدہ چیک لسٹ اور اسکور' : '2. Personalized Checklist & Score'}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {isUrdu
                ? 'اپنے پاس موجود دستاویزات پر نشان لگائیں اور تیاری کا درست اسکور دیکھیں۔ غیر تصدیق شدہ امور الگ نمایاں کیے جاتے ہیں۔'
                : 'Tick off what you have. Your readiness score is calculated strictly over verified rules so you have realistic certainty.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 space-y-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
              {isUrdu ? '3. دفتر کا پتہ اور اے آئی رہنمائی' : '3. Locate Office & Ask AI'}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {isUrdu
                ? 'اپنے ضلع کے ڈپٹی کمشنر یا نادرا سینٹر کا نقشہ اور راستہ دیکھیں، یا کسی بھی دستاویز کی قانونی وجہ اے آئی سے معلوم کریں۔'
                : 'Get the exact address and Google Maps directions for your district DC office, or ask our grounded AI guide any question.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
