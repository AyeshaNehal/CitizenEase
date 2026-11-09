'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar, ActiveNavView } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ServiceDiscovery } from '@/components/ServiceDiscovery';
import { ServiceDetailModal } from '@/components/ServiceDetailModal';
import { QuestionnaireModal } from '@/components/QuestionnaireModal';
import { ChecklistHub } from '@/components/ChecklistHub';
import { AssistantSlideOver } from '@/components/AssistantSlideOver';
import { AssistantPanel } from '@/components/AssistantPanel';
import { OfficeLocator } from '@/components/OfficeLocator';
import { SourcesLedger } from '@/components/SourcesLedger';
import { SourcesModal } from '@/components/SourcesModal';
import { Language, I18N } from '@/lib/i18n';
import { SERVICES } from '@/data/catalog';
import {
  generateChecklistFromAnswers,
  calculateReadinessScore,
  GeneratedChecklist,
  UserItemStatus
} from '@/lib/rulesEngine';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  MapPin,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Printer
} from 'lucide-react';

const STORAGE_KEY = 'citizenease_saved_checklist_v1';
const LANG_STORAGE_KEY = 'citizenease_lang_pref';
const THEME_STORAGE_KEY = 'citizenease_theme_pref';

type ServiceSlug = 'domicile_prc' | 'first_cnic' | 'passport' | 'frc';

const DEFAULT_ANSWERS: Record<ServiceSlug, Record<string, any>> = {
  domicile_prc: {
    application_type: 'both',
    district: 'karachi_south',
    is_applicant_minor: false,
    is_student: true,
    parent_domicile_available: 'yes',
    is_married_female: false
  },
  first_cnic: {
    age: 18,
    has_bform: true,
    is_bform_smart: true,
    parents_alive: true,
    parent_cnic_available: true,
    blood_relative_available: true
  },
  passport: {
    passport_application_type: 'renewal',
    passport_type: 'renewal',
    age_group: 'adult_18_plus',
    validity_duration: '10_years',
    page_count: '36_pages',
    delivery_speed: 'urgent',
    has_previous_passport: true,
    is_applicant_minor: false,
    is_government_employee: false
  },
  frc: {
    frc_category: 'by_birth',
    has_cnic: true,
    are_parents_registered: true,
    are_siblings_registered: true,
    is_marriage_registered: true
  }
};

function CitizenEaseMain() {
  const searchParams = useSearchParams();
  const initialViewParam = searchParams.get('view') as ActiveNavView | null;

  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return saved === 'ur' ? 'ur' : 'en';
    } catch {
      return 'en';
    }
  });

  // Dark / Light Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Default to 'all' for single-link all-in-one experience
  const [activeView, setActiveView] = useState<ActiveNavView>(
    initialViewParam || 'all'
  );
  const [activeServiceSlug, setActiveServiceSlug] = useState<ServiceSlug>('domicile_prc');

  // Modals state
  const [detailModalSlug, setDetailModalSlug] = useState<ServiceSlug | null>(null);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | undefined>(undefined);

  // Active checklist state
  const [checklist, setChecklist] = useState<GeneratedChecklist>(() => {
    if (typeof window === 'undefined') {
      return generateChecklistFromAnswers('domicile_prc', DEFAULT_ANSWERS.domicile_prc);
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Storage read failed:', e);
    }
    return generateChecklistFromAnswers('domicile_prc', DEFAULT_ANSWERS.domicile_prc);
  });

  // Sync RTL and language attributes with document root
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {}
  }, [language]);

  // Persist active checklist to localStorage
  useEffect(() => {
    if (checklist) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(checklist));
      } catch (e) {
        console.warn('Checklist persist failed:', e);
      }
    }
  }, [checklist]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ur' : 'en'));
  };

  const handleStartQuestionnaire = (serviceSlug: ServiceSlug) => {
    setActiveServiceSlug(serviceSlug);
    setIsQuestionnaireOpen(true);
  };

  const handleQuickSwitchService = (serviceSlug: ServiceSlug) => {
    setActiveServiceSlug(serviceSlug);
    const newChecklist = generateChecklistFromAnswers(serviceSlug, DEFAULT_ANSWERS[serviceSlug]);
    setChecklist(newChecklist);
  };

  const handleQuestionnaireComplete = (answers: Record<string, any>) => {
    setIsQuestionnaireOpen(false);
    const newChecklist = generateChecklistFromAnswers(activeServiceSlug, answers);
    setChecklist(newChecklist);

    // Scroll smoothly to checklist section
    setTimeout(() => {
      const chkEl = document.getElementById('checklist');
      if (chkEl) chkEl.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleUpdateItemStatus = (itemId: string, newStatus: UserItemStatus) => {
    if (!checklist) return;

    const updatedItems = checklist.items.map(item => {
      if (item.requirement_id === itemId) {
        return { ...item, user_status: newStatus };
      }
      return item;
    });

    const newReadiness = calculateReadinessScore(updatedItems);

    setChecklist({
      ...checklist,
      items: updatedItems,
      readiness: newReadiness
    });
  };

  const handleOpenAssistant = (prompt?: string) => {
    setAssistantInitialPrompt(prompt);
    setIsAssistantOpen(true);
  };

  const isUrdu = language === 'ur';
  const t = I18N[language];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#09130f] text-stone-900 dark:text-stone-100 selection:bg-emerald-200 dark:selection:bg-emerald-950 transition-colors">
      {/* Top Bar with Combined Navigation & Theme Toggle */}
      <Navbar
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        hasActiveChecklist={!!checklist}
        onOpenAssistant={() => handleOpenAssistant()}
      />

      {/* Unified Link Header / Mode Pill Banner */}
      <div className="bg-emerald-900 dark:bg-[#0a2219] text-white py-2 px-4 text-xs font-medium border-b border-emerald-800/40 dark:border-emerald-800/20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isUrdu
                ? 'سٹیزن ایز تمام فیچرز ایک لنک پر دستیاب ہیں — سروسز، چیک لسٹ، کراچی دفاتر، اے آئی گائیڈ اور قانونی ریکارڈ'
                : 'All CitizenEase features combined into this single link — Services, Checklist, Karachi Offices, AI Guide & Legal Provenance'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                activeView === 'all'
                  ? 'bg-white dark:bg-emerald-400 text-emerald-950 dark:text-stone-950 font-bold'
                  : 'bg-emerald-800 dark:bg-emerald-950/70 text-emerald-200 hover:bg-emerald-700 dark:hover:bg-emerald-900'
              }`}
            >
              {isUrdu ? 'تمام فیچرز (یکجا صفحہ)' : 'All-in-One Page'}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('checklist');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-800 dark:bg-emerald-950/70 text-emerald-200 hover:bg-emerald-700 dark:hover:bg-emerald-900 transition-colors cursor-pointer hidden sm:inline-block"
            >
              {isUrdu ? 'چیک لسٹ پر جائیں' : 'Jump to Checklist'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* SECTION 1: SERVICES & HERO */}
        {(activeView === 'all' || activeView === 'services') && (
          <section id="services" className="scroll-mt-20">
            <ServiceDiscovery
              language={language}
              onSelectService={handleStartQuestionnaire}
              onOpenServiceDetail={(slug) => setDetailModalSlug(slug)}
              onOpenOffices={() => {
                setActiveView('all');
                document.getElementById('offices')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenAssistant={handleOpenAssistant}
            />
          </section>
        )}

        {/* SECTION 2: REQUIREMENTS CHECKLIST & READINESS */}
        {(activeView === 'all' || activeView === 'checklist') && (
          <section id="checklist" className="scroll-mt-20 space-y-4">
            {/* Quick Service Switcher Bar */}
            <div className="bg-white dark:bg-[#11221b] rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {isUrdu ? 'سروس کا انتخاب کریں اور فوری چیک لسٹ دیکھیں:' : 'Select Service for Interactive Checklist:'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {isUrdu ? 'کسی بھی سروس پر کلک کر کے فوری تقاضے اور تیاری کا اسکور حاصل کریں' : 'Switch service to instantly calculate requirements & readiness score'}
                  </p>
                </div>
              </div>

              {/* 4 Service Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {(['domicile_prc', 'first_cnic', 'passport', 'frc'] as ServiceSlug[]).map((slug) => {
                  const s = SERVICES[slug];
                  const isActive = checklist.service_slug === slug;

                  return (
                    <button
                      key={slug}
                      onClick={() => handleQuickSwitchService(slug)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-[#0C3E2E] dark:bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30 dark:ring-emerald-400/40'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 dark:text-emerald-200" />}
                      <span>{isUrdu ? s.title_ur : s.title_en}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Render Checklist Hub */}
            <ChecklistHub
              checklist={checklist}
              language={language}
              onUpdateItemStatus={handleUpdateItemStatus}
              onOpenAssistant={handleOpenAssistant}
              onOpenOffices={() => {
                setActiveView('all');
                document.getElementById('offices')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onRestartQuestionnaire={() => handleStartQuestionnaire(checklist.service_slug)}
              onOpenSources={() => {
                setActiveView('all');
                document.getElementById('sources')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </section>
        )}

        {/* SECTION 3: KARACHI OFFICE LOCATOR */}
        {(activeView === 'all' || activeView === 'offices') && (
          <section id="offices" className="scroll-mt-20">
            <OfficeLocator
              language={language}
              preselectedDistrict={checklist?.answers_snapshot?.district}
              preselectedService={checklist?.service_slug}
            />
          </section>
        )}

        {/* SECTION 4: GROUNDED AI CITIZEN ASSISTANT */}
        {(activeView === 'all' || activeView === 'assistant') && (
          <section id="assistant" className="scroll-mt-20">
            <AssistantPanel
              language={language}
              checklistItems={checklist?.items}
            />
          </section>
        )}

        {/* SECTION 5: LEGAL PROVENANCE & VERIFICATION LEDGER */}
        {(activeView === 'all' || activeView === 'sources') && (
          <section id="sources" className="scroll-mt-20">
            <SourcesLedger language={language} />
          </section>
        )}
      </main>

      {/* Persistent Legal Boundary Footer */}
      <Footer
        language={language}
        onOpenSources={() => {
          setActiveView('all');
          document.getElementById('sources')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Slide-over Grounded AI Assistant Drawer (Always available as quick side drawer) */}
      <AssistantSlideOver
        isOpen={isAssistantOpen}
        language={language}
        onClose={() => setIsAssistantOpen(false)}
        checklistItems={checklist?.items}
        initialPrompt={assistantInitialPrompt}
      />

      {/* Service Detail & Court Ruling Modal */}
      {detailModalSlug && (
        <ServiceDetailModal
          serviceSlug={detailModalSlug}
          language={language}
          onClose={() => setDetailModalSlug(null)}
          onStartQuestionnaire={handleStartQuestionnaire}
        />
      )}

      {/* Guided Assessment Questionnaire Modal */}
      {isQuestionnaireOpen && (
        <QuestionnaireModal
          serviceSlug={activeServiceSlug}
          language={language}
          initialAnswers={checklist?.service_slug === activeServiceSlug ? checklist.answers_snapshot : undefined}
          onClose={() => setIsQuestionnaireOpen(false)}
          onComplete={handleQuestionnaireComplete}
        />
      )}

      {/* Sources & Transparency Audit Modal */}
      {isSourcesModalOpen && (
        <SourcesModal
          language={language}
          onClose={() => setIsSourcesModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-stone-500 dark:text-stone-400 bg-[#FAF8F5] dark:bg-[#09130f]">Loading CitizenEase Unified Hub...</div>}>
      <CitizenEaseMain />
    </Suspense>
  );
}
