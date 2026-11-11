import React, { useState } from 'react';
import { I18N, Language } from '../lib/i18n';
import { QUESTIONS, Question, SERVICES, KARACHI_DISTRICTS, ServiceSlug } from '../data/catalog';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  X,
  RotateCcw
} from 'lucide-react';

interface QuestionnaireModalProps {
  serviceSlug: ServiceSlug;
  language: Language;
  initialAnswers?: Record<string, any>;
  onClose: () => void;
  onComplete: (answers: Record<string, any>) => void;
}

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({
  serviceSlug,
  language,
  initialAnswers = {},
  onClose,
  onComplete
}) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';
  const service = SERVICES[serviceSlug];

  // Filter questions applicable to this service
  const serviceQuestions = QUESTIONS.filter(q => q.service_slug === serviceSlug).sort(
    (a, b) => a.order_index - b.order_index
  );

  const [answers, setAnswers] = useState<Record<string, any>>({ ...initialAnswers });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isReviewStep, setIsReviewStep] = useState(false);

  // Compute visible questions dynamically based on conditional logic
  const getVisibleQuestions = () => {
    return serviceQuestions.filter(q => {
      if (!q.condition) return true;
      const parentAnswer = answers[q.condition.depends_on_key];
      if (parentAnswer === undefined) return false;
      if (q.condition.operator === 'eq') return parentAnswer === q.condition.value;
      if (q.condition.operator === 'neq') return parentAnswer !== q.condition.value;
      if (q.condition.operator === 'in' && Array.isArray(q.condition.value)) {
        return q.condition.value.includes(parentAnswer);
      }
      return true;
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion: Question | undefined = visibleQuestions[currentQuestionIndex];

  const handleSelectOption = (value: any) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.key]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsReviewStep(true);
    }
  };

  const handleBack = () => {
    if (isReviewStep) {
      setIsReviewStep(false);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onComplete(answers);
  };

  const currentAnswerValue = currentQuestion ? answers[currentQuestion.key] : undefined;
  const isCurrentAnswered = currentAnswerValue !== undefined;

  const progressPercentage = visibleQuestions.length === 0
    ? 100
    : isReviewStep
    ? 100
    : Math.round(((currentQuestionIndex + 1) / visibleQuestions.length) * 100);

  const showKeamariAdvisory = answers.district === 'karachi_keamari';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#102019] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-4 bg-stone-50/50 dark:bg-[#0c1813]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isUrdu ? service.title_ur : service.title_en}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              {isUrdu ? 'تشخیصی سوالنامہ (درست دستاویزات کے لیے)' : 'Guided Requirements Assessment'}
            </h1>
          </div>

          <button
            onClick={onClose}
            aria-label="Close questionnaire"
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5">
          <div
            className="bg-[#0C3E2E] dark:bg-emerald-500 h-1.5 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Content Container */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          {!isReviewStep && currentQuestion ? (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium">
                <span>
                  {t.step_indicator} {currentQuestionIndex + 1} {t.of_steps} {visibleQuestions.length}
                </span>
                <span>{progressPercentage}% {isUrdu ? 'مکمل' : 'Complete'}</span>
              </div>

              {/* Question Text */}
              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {isUrdu ? currentQuestion.text_ur : currentQuestion.text_en}
                </h2>
                {currentQuestion.hint_en && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    {isUrdu ? currentQuestion.hint_ur : currentQuestion.hint_en}
                  </p>
                )}
              </div>

              {/* District Specific Advisory for Keamari */}
              {currentQuestion.key === 'district' && showKeamariAdvisory && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{isUrdu ? 'ضلع کیماڑی خصوصی رہنمائی' : 'District Keamari Transition Note'}</span>
                  </div>
                  <p>
                    {isUrdu
                      ? 'کیماڑی نیا ضلع بننے کے باعث اگر آپ کے والدین کا پرانا ڈومیسائل ڈی سی ویسٹ کا تھا تو ممکن ہے پرانی فائل کی تصدیق طلب کی جائے۔'
                      : 'Because District Keamari was bifurcated from Karachi West, check if your family records require migration verification from DC West.'}
                  </p>
                </div>
              )}

              {/* Options List */}
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = currentAnswerValue === option.value;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(option.value)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer min-h-[52px] ${
                        isSelected
                          ? 'border-[#0C3E2E] dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/60 ring-2 ring-[#0C3E2E]/20 dark:ring-emerald-400/20 text-[#0C3E2E] dark:text-emerald-300 font-semibold'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#13261e] text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {isUrdu ? option.label_ur : option.label_en}
                        </span>
                        {option.description_en && (
                          <span className="text-xs text-stone-500 dark:text-stone-400 font-normal mt-0.5">
                            {isUrdu ? option.description_ur : option.description_en}
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-[#0C3E2E] dark:border-emerald-500 bg-[#0C3E2E] dark:bg-emerald-600 text-white'
                            : 'border-stone-300 dark:border-stone-700'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Review Step */
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t.review_answers}
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {isUrdu
                    ? 'براہِ کرم تصدیق کریں کہ آپ کے جوابات درست ہیں تاکہ قوانین کا درست اطلاق ہو سکے۔'
                    : 'Verify your responses below. CitizenEase uses these to evaluate applicable rules.'}
                </p>
              </div>

              <div className="divide-y divide-stone-100 dark:divide-stone-800 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-[#13261e] overflow-hidden">
                {visibleQuestions.map((q, idx) => {
                  const val = answers[q.key];
                  const opt = q.options.find(o => o.value === val);
                  const displayLabel = opt
                    ? isUrdu
                      ? opt.label_ur
                      : opt.label_en
                    : String(val ?? 'Not answered');

                  return (
                    <div key={q.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs text-stone-500 dark:text-stone-400">{isUrdu ? q.text_ur : q.text_en}</p>
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{displayLabel}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsReviewStep(false);
                          setCurrentQuestionIndex(idx);
                        }}
                        className="text-xs text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 font-semibold px-2 py-1 rounded hover:bg-emerald-100/60 dark:hover:bg-emerald-950 transition-colors cursor-pointer"
                      >
                        {t.edit_answer}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Controls */}
        <div className="p-4 sm:p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-[#0c1813] flex items-center justify-between gap-3 transition-colors">
          <button
            onClick={handleBack}
            disabled={currentQuestionIndex === 0 && !isReviewStep}
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px] ${
              currentQuestionIndex === 0 && !isReviewStep
                ? 'text-stone-300 dark:text-stone-700 cursor-not-allowed'
                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/80 dark:hover:bg-stone-800 bg-white dark:bg-[#13261e] border border-stone-200 dark:border-stone-700'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.btn_back}</span>
          </button>

          {!isReviewStep ? (
            <button
              onClick={handleNext}
              disabled={!isCurrentAnswered}
              className={`px-6 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 min-h-[44px] ${
                isCurrentAnswered
                  ? 'bg-[#0C3E2E] hover:bg-[#0A3426] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white cursor-pointer shadow-xs'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
              }`}
            >
              <span>{t.btn_next}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-[#0C3E2E] hover:bg-[#093124] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{t.btn_generate_checklist}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
