'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Question, Progress } from '@/lib/types';
import Link from 'next/link';

function QuestionnaireContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get('service') || 'domicile_prc';

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState<Progress>({ current_step: 0, total_estimated: 0 });
  const [answer, setAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<Array<{ question: Question; answer: any }>>([]);

  // Initialize session
  useEffect(() => {
    api.startQuestionnaire(serviceSlug)
      .then((res) => {
        setSessionId(res.session_id);
        setCurrentQuestion(res.question);
        setProgress(res.progress);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [serviceSlug]);

  const handleNext = async () => {
    if (!sessionId || !currentQuestion || answer === null || answer === undefined) return;

    setSubmitting(true);
    try {
      const res = await api.answerQuestion(sessionId, currentQuestion.key, answer);
      
      // Save history for back navigation
      setHistory((prev) => [...prev, { question: currentQuestion, answer }]);

      if (res.done || !res.next_question) {
        // Generate checklist
        const chk = await api.generateChecklist(sessionId);
        router.push(`/checklist/${chk.checklist_id}`);
      } else {
        setCurrentQuestion(res.next_question);
        setProgress(res.progress);
        setAnswer(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const lastItem = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setCurrentQuestion(lastItem.question);
    setAnswer(lastItem.answer);
  };

  if (loading) {
    return <div className="text-center py-16 text-sm text-gray-500">Starting guided questionnaire...</div>;
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-gray-600">No active questions available for this service.</p>
        <Link href="/services" className="text-xs text-primary underline">← Back to services</Link>
      </div>
    );
  }

  const pct = progress.total_estimated > 0 ? (progress.current_step / progress.total_estimated) * 100 : 0;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4">
      {/* Step Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Question {progress.current_step} of {progress.total_estimated}</span>
          <span>{Math.round(pct)}% Completed</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-1">
            Question
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-primary">
            {currentQuestion.text_en}
          </h2>
          <p className="text-sm font-nastaliq text-gray-600 mt-2">
            {currentQuestion.text_ur}
          </p>
        </div>

        {/* Dynamic Inputs according to input_type */}
        <div className="space-y-3">
          {currentQuestion.input_type === 'boolean' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAnswer(true)}
                className={`py-3.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  answer === true
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                }`}
              >
                Yes (جی ہاں)
              </button>
              <button
                type="button"
                onClick={() => setAnswer(false)}
                className={`py-3.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
                  answer === false
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                }`}
              >
                No (نہیں)
              </button>
            </div>
          )}

          {(currentQuestion.input_type === 'single_choice' || currentQuestion.input_type === 'district') && (
            <div className="space-y-2">
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAnswer(opt.value)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between ${
                    answer === opt.value
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{opt.label_en}</span>
                  <span className="text-xs font-nastaliq text-gray-500">{opt.label_ur}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={history.length === 0 || submitting}
            className={`px-4 py-2 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 transition-colors ${
              history.length === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={answer === null || answer === undefined || submitting}
            className={`px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl transition-colors ${
              answer === null || answer === undefined || submitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-primary-dark shadow-sm'
            }`}
          >
            {submitting ? 'Processing...' : 'Next Step →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-sm text-gray-500">Starting guided questionnaire...</div>}>
      <QuestionnaireContent />
    </Suspense>
  );
}
