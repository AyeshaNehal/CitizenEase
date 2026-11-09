import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { I18N, Language } from '../lib/i18n';
import { GeneratedChecklist, EvaluatedChecklistItem, UserItemStatus } from '../lib/rulesEngine';
import { SERVICES } from '../data/catalog';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Printer,
  Sparkles,
  MapPin,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ExternalLink,
  Scale,
  FileCheck2,
  Clock
} from 'lucide-react';

interface ChecklistHubProps {
  checklist: GeneratedChecklist;
  language: Language;
  onUpdateItemStatus: (itemId: string, newStatus: UserItemStatus) => void;
  onOpenAssistant: (initialPrompt?: string) => void;
  onOpenOffices: () => void;
  onRestartQuestionnaire: () => void;
  onOpenSources: () => void;
}

export const ChecklistHub: React.FC<ChecklistHubProps> = ({
  checklist,
  language,
  onUpdateItemStatus,
  onOpenAssistant,
  onOpenOffices,
  onRestartQuestionnaire,
  onOpenSources
}) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';
  const service = SERVICES[checklist.service_slug];
  const readiness = checklist.readiness;

  // Track expanded "Why Needed" accordions
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleStatusChange = (itemId: string, status: UserItemStatus) => {
    onUpdateItemStatus(itemId, status);

    // If this pushes readiness to 100%, fire celebratory confetti!
    if (
      status === 'have' &&
      readiness.total_count > 0 &&
      readiness.ready_count + 1 === readiness.total_count
    ) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Group items
  const mandatoryVerified = checklist.items.filter(
    i => i.verification_status === 'verified' && i.applicability === 'mandatory'
  );
  const conditionalItems = checklist.items.filter(
    i => i.verification_status === 'verified' && i.applicability === 'conditional'
  );
  const unverifiedItems = checklist.items.filter(i => i.verification_status === 'unverified');

  const score = readiness.score;
  const isComplete = score === 100;

  return (
    <div className="space-y-8 print-page">
      {/* Top Banner & Hub Controls */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400 tracking-wide uppercase">
            <span>{isUrdu ? 'ذاتی چیک لسٹ ہب' : 'Personalized Checklist Hub'}</span>
            <span aria-hidden="true">·</span>
            <span>{checklist.rules_version}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
            {isUrdu ? service.title_ur : service.title_en}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {isUrdu
              ? 'مطلوبہ دستاویزات کو چیک کریں اور تیاری کے اسکور کا مشاہدہ کریں۔'
              : 'Review requirements, toggle documents in your possession, and monitor verified readiness.'}
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer min-h-[44px]"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 text-stone-600 dark:text-stone-400" />
            <span>{t.btn_print}</span>
          </button>

          <button
            onClick={onOpenOffices}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-[#0C3E2E] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors cursor-pointer min-h-[44px]"
          >
            <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>{t.btn_locate_office}</span>
          </button>

          <button
            onClick={() => onOpenAssistant()}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#0C3E2E] hover:bg-[#0A3426] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl transition-all shadow-xs cursor-pointer min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-emerald-300 dark:text-emerald-100" />
            <span>{t.btn_open_assistant}</span>
          </button>

          <button
            onClick={onRestartQuestionnaire}
            className="p-2.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Edit situation answers"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Readiness Score Card */}
      <section className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          {/* Left: Circular Ring & Metrics */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Score Ring */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              {score !== null ? (
                <>
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      className="text-stone-200 dark:text-stone-800"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={isComplete ? '#059669' : '#10b981'}
                      strokeWidth="10"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * score) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                      {score}%
                    </span>
                    <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-tight">
                      Ready
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-center p-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                  Pending
                </div>
              )}
            </div>

            {/* Explanation & Counts */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  {t.readiness_score}
                </span>
                <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                  {readiness.ready_count} of {readiness.total_count} Verified Done
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                {isUrdu ? readiness.explanation_ur : readiness.explanation_en}
              </h2>

              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xl leading-relaxed">
                {t.score_formula_note}
              </p>

              {/* Legal Warning Notice */}
              <div className="pt-1 flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-400">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-medium">
                  {isUrdu
                    ? 'یہ تیاری کی جانچ ہے، قانونی منظوری کی حتمی ضمانت نہیں۔'
                    : 'This measures citizen paperwork readiness, not legal government approval.'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Strip */}
          <div className="w-full md:w-auto p-4 rounded-2xl bg-stone-50 dark:bg-[#13261e] border border-stone-200/80 dark:border-stone-800 flex flex-col gap-2 text-xs transition-colors">
            <span className="font-bold text-stone-700 dark:text-stone-200">
              {isUrdu ? 'خلاصہ کیفیت:' : 'Checklist Breakdown:'}
            </span>
            <div className="flex items-center justify-between gap-4 text-stone-600 dark:text-stone-300">
              <span>{isUrdu ? 'موجود دستاویزات:' : 'Have in hand:'}</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{readiness.ready_count}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-stone-600 dark:text-stone-300">
              <span>{isUrdu ? 'لازمی باقی:' : 'Verified Missing:'}</span>
              <span className="font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                {readiness.total_count - readiness.ready_count}
              </span>
            </div>
            {unverifiedItems.length > 0 && (
              <div className="flex items-center justify-between gap-4 text-stone-600 dark:text-stone-300 pt-1 border-t border-stone-200 dark:border-stone-800">
                <span>{isUrdu ? 'دفتر سے تصدیق طلب:' : 'Office check needed:'}</span>
                <span className="font-bold text-stone-700 dark:text-stone-300 tabular-nums">{unverifiedItems.length}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 1: Verified Mandatory Documents */}
      <section className="space-y-4 print-break-inside-avoid">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t.sec_verified_mandatory}</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {t.sec_verified_mandatory_desc}
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            {mandatoryVerified.filter(i => i.user_status === 'have').length} / {mandatoryVerified.length} Ready
          </span>
        </div>

        <div className="space-y-3">
          {mandatoryVerified.map(item => (
            <ChecklistItemCard
              key={item.item_id}
              item={item}
              language={language}
              isExpanded={!!expandedItems[item.item_id]}
              onToggleExpand={() => toggleExpand(item.item_id)}
              onStatusChange={status => handleStatusChange(item.requirement_id, status)}
              onAskAI={() => onOpenAssistant(`Why do I need: ${item.title_en}?`)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 2: Conditional Documents */}
      {conditionalItems.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800 print-break-inside-avoid">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-400 uppercase tracking-wide">
                <FileCheck2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>{t.sec_conditional}</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {t.sec_conditional_desc}
              </p>
            </div>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {conditionalItems.filter(i => i.user_status === 'have').length} / {conditionalItems.length} Ready
            </span>
          </div>

          <div className="space-y-3">
            {conditionalItems.map(item => (
              <ChecklistItemCard
                key={item.item_id}
                item={item}
                language={language}
                isExpanded={!!expandedItems[item.item_id]}
                onToggleExpand={() => toggleExpand(item.item_id)}
                onStatusChange={status => handleStatusChange(item.requirement_id, status)}
                onAskAI={() => onOpenAssistant(`Why do I need: ${item.title_en}?`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: Unverified / Needs Office Confirmation */}
      {unverifiedItems.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-amber-200/80 dark:border-amber-800/50 print-break-inside-avoid">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t.sec_unverified}</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              {t.sec_unverified_desc}
            </p>
          </div>

          <div className="space-y-3">
            {unverifiedItems.map(item => (
              <ChecklistItemCard
                key={item.item_id}
                item={item}
                language={language}
                isExpanded={!!expandedItems[item.item_id]}
                onToggleExpand={() => toggleExpand(item.item_id)}
                onStatusChange={status => handleStatusChange(item.requirement_id, status)}
                onAskAI={() => onOpenAssistant(`Explain the unverified requirement: ${item.title_en}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// ---------------- SUB-COMPONENT: Single Item Card ----------------
interface ChecklistItemCardProps {
  item: EvaluatedChecklistItem;
  language: Language;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (status: UserItemStatus) => void;
  onAskAI: () => void;
}

const ChecklistItemCard: React.FC<ChecklistItemCardProps> = ({
  item,
  language,
  isExpanded,
  onToggleExpand,
  onStatusChange,
  onAskAI
}) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';

  const isVerified = item.verification_status === 'verified';
  const isHave = item.user_status === 'have';
  const isMissing = item.user_status === 'missing';
  const isNotSure = item.user_status === 'not_sure';

  return (
    <div
      className={`rounded-2xl border transition-all p-4 sm:p-5 bg-white dark:bg-[#102019] ${
        isHave
          ? 'border-emerald-300/80 dark:border-emerald-600/70 bg-emerald-50/20 dark:bg-emerald-950/30 shadow-xs'
          : isVerified
          ? 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
          : 'border-amber-200 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Title & Metadata */}
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {isVerified ? (
              <span className="flex items-center gap-1 text-emerald-800 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t.status_verified}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-800 dark:text-amber-400 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{t.status_unverified}</span>
              </span>
            )}
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
            <span className="text-stone-500 dark:text-stone-400 font-mono text-[11px]">{item.code}</span>
            <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
            <span className="text-stone-500 dark:text-stone-400 capitalize">
              {item.kind === 'document' ? (isUrdu ? 'دستاویز' : 'Document') : (isUrdu ? 'عملی مرحلہ' : 'Action Step')}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
            {isUrdu ? item.title_ur : item.title_en}
          </h3>

          {/* Quick Accordion Trigger */}
          <button
            onClick={onToggleExpand}
            className="text-xs font-semibold text-[#0C3E2E] dark:text-emerald-400 hover:text-[#093124] dark:hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? (isUrdu ? 'تفصیل چھپائیں' : 'Hide Legal Rationale') : (isUrdu ? 'قانونی وجہ دیکھیں' : 'Why is this required?')}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right: Functional Segmented Status Buttons */}
        <div className="no-print flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800/90 rounded-xl shrink-0 self-start transition-colors">
          <button
            onClick={() => onStatusChange('have')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
              isHave
                ? 'bg-[#0C3E2E] dark:bg-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.status_have}</span>
          </button>

          <button
            onClick={() => onStatusChange('missing')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
              isMissing
                ? 'bg-amber-700 dark:bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-700'
            }`}
          >
            <span>{t.status_missing}</span>
          </button>

          <button
            onClick={() => onStatusChange('not_sure')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
              isNotSure
                ? 'bg-stone-700 dark:bg-stone-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.status_not_sure}</span>
          </button>
        </div>
      </div>

      {/* Expandable Legal Foundation & Source Block */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3 text-xs text-stone-700 dark:text-stone-300 animate-fade-in">
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-[#13261e] border border-stone-200/80 dark:border-stone-800 space-y-1.5">
            <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
              <span>{isUrdu ? 'قانونی و دفتری بنیاد:' : 'Legal Rationale & Context:'}</span>
            </div>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
              {isUrdu ? item.why_needed_ur : item.why_needed_en}
            </p>
          </div>

          {/* Primary Source Citation */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-stone-500 dark:text-stone-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-700 dark:text-stone-300">{t.source_label}</span>
              <span>{item.source.title}</span>
              <span aria-hidden="true">·</span>
              <span>{item.source.issuing_authority}</span>
              <span aria-hidden="true">·</span>
              <span>{t.last_verified} {item.source.last_verified_on}</span>
            </div>

            <button
              onClick={onAskAI}
              className="no-print text-[#0C3E2E] dark:text-emerald-400 hover:text-[#093124] dark:hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
              <span>{isUrdu ? 'اس پر اے آئی سے پوچھیں' : 'Ask AI Guide'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
