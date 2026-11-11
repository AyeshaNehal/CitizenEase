'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar, ActiveNavView } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ServiceDiscovery } from '@/components/ServiceDiscovery';
import { ServiceDetailModal } from '@/components/ServiceDetailModal';
import { QuestionnaireModal } from '@/components/QuestionnaireModal';
import { ChecklistHub } from '@/components/ChecklistHub';
import { CostCalculator } from '@/components/CostCalculator';
import { AssistantSlideOver } from '@/components/AssistantSlideOver';
import { AssistantPanel } from '@/components/AssistantPanel';
import { OfficeLocator } from '@/components/OfficeLocator';
import { SourcesLedger } from '@/components/SourcesLedger';
import { SourcesModal } from '@/components/SourcesModal';
import { Language, I18N } from '@/lib/i18n';
import { SERVICES, ServiceSlug } from '@/data/catalog';
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
  Calculator,
  HelpCircle,
  FileQuestion,
  ChevronRight,
  Building2
} from 'lucide-react';

const STORAGE_KEY = 'citizenease_saved_checklist_v2';
const HAS_CHECKLIST_KEY = 'citizenease_has_generated_checklist';
const LANG_STORAGE_KEY = 'citizenease_lang_pref';
const THEME_STORAGE_KEY = 'citizenease_theme_pref';
const TAB_STORAGE_KEY = 'citizenease_active_tab_v2';

export type TabKey = 'services' | 'checklist' | 'cost' | 'offices' | 'assistant' | 'sources';

const VALID_TABS: TabKey[] = ['services', 'checklist', 'cost', 'offices', 'assistant', 'sources'];

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
  },
  b_form: {
    has_birth_certificate: true,
    parents_marital_status_updated: true,
    parent_available_bform: true
  },
  birth_certificate: {
    birth_place_type: 'hospital',
    has_hospital_slip: true,
    parents_cnic_valid: true,
    has_parents_nikahnama: true
  },
  smart_card: {
    smart_card_purpose: 'fresh_18',
    has_existing_id_doc: true,
    blood_relative_available: true
  }
};

function CitizenEaseMain() {
  const searchParams = useSearchParams();

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

  // Active Tab state with localStorage and hash synchronization
  const [activeTab, setActiveTabState] = useState<TabKey>(() => {
    if (typeof window === 'undefined') return 'services';
    try {
      const hash = window.location.hash.replace('#', '') as TabKey;
      if (VALID_TABS.includes(hash)) return hash;
      const saved = localStorage.getItem(TAB_STORAGE_KEY) as TabKey;
      if (VALID_TABS.includes(saved)) return saved;
    } catch {}
    return 'services';
  });

  const setActiveTab = (tab: TabKey) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem(TAB_STORAGE_KEY, tab);
      if (window.location.hash !== `#${tab}`) {
        window.history.replaceState(null, '', `#${tab}`);
      }
    } catch {}
  };

  // Listen to external hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as TabKey;
      if (VALID_TABS.includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [activeServiceSlug, setActiveServiceSlug] = useState<ServiceSlug>('domicile_prc');

  // Modals state
  const [detailModalSlug, setDetailModalSlug] = useState<ServiceSlug | null>(null);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | undefined>(undefined);

  // Track if user has actively completed or selected a checklist
  const [hasUserChecklist, setHasUserChecklist] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(HAS_CHECKLIST_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Active checklist state
  const [checklist, setChecklist] = useState<GeneratedChecklist | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Storage read failed:', e);
    }
    return null;
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
        localStorage.setItem(HAS_CHECKLIST_KEY, 'true');
        setHasUserChecklist(true);
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
    setHasUserChecklist(true);
  };

  const handleQuestionnaireComplete = (answers: Record<string, any>) => {
    setIsQuestionnaireOpen(false);
    const newChecklist = generateChecklistFromAnswers(activeServiceSlug, answers);
    setChecklist(newChecklist);
    setHasUserChecklist(true);
    // Switch to checklist tab
    setActiveTab('checklist');
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

  // Keyboard navigation for tablist
  const handleTabKeyDown = (e: React.KeyboardEvent, currentTab: TabKey) => {
    const currentIndex = VALID_TABS.indexOf(currentTab);
    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      nextIndex = isUrdu
        ? (currentIndex - 1 + VALID_TABS.length) % VALID_TABS.length
        : (currentIndex + 1) % VALID_TABS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = isUrdu
        ? (currentIndex + 1) % VALID_TABS.length
        : (currentIndex - 1 + VALID_TABS.length) % VALID_TABS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = VALID_TABS.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = VALID_TABS[nextIndex];
    setActiveTab(nextTab);
    const el = document.getElementById(`tab-${nextTab}`);
    el?.focus();
  };

  const allServiceSlugs: ServiceSlug[] = [
    'domicile_prc',
    'first_cnic',
    'passport',
    'frc',
    'b_form',
    'birth_certificate',
    'smart_card'
  ];

  // Tab definitions
  const tabs = [
    {
      id: 'services' as TabKey,
      label_en: 'Services',
      label_ur: 'سروسز',
      icon: Layers,
      count: 7
    },
    {
      id: 'checklist' as TabKey,
      label_en: 'My Checklist',
      label_ur: 'میری چیک لسٹ',
      icon: FileCheck2,
      badge: checklist ? `${checklist.readiness.ready_count}/${checklist.readiness.total_count}` : null
    },
    {
      id: 'cost' as TabKey,
      label_en: 'Cost Calculator',
      label_ur: 'لاگت کیلکولیٹر',
      icon: Calculator
    },
    {
      id: 'offices' as TabKey,
      label_en: 'Offices',
      label_ur: 'کراچی دفاتر',
      icon: MapPin
    },
    {
      id: 'assistant' as TabKey,
      label_en: 'Assistant',
      label_ur: 'سٹیزن گائیڈ',
      icon: Sparkles
    },
    {
      id: 'sources' as TabKey,
      label_en: 'Sources',
      label_ur: 'قانونی ثبوت',
      icon: BookOpen
    }
  ];

  // Compute current step for persistent indicator
  const currentStepNumber = !hasUserChecklist ? 1 : activeTab === 'services' ? 1 : activeTab === 'checklist' ? 3 : 2;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#09130f] text-stone-900 dark:text-stone-100 selection:bg-emerald-200 dark:selection:bg-emerald-950 transition-colors overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        language={language}
        onToggleLanguage={toggleLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeView={activeTab as ActiveNavView}
        onNavigate={(view) => {
          if (view === 'all') {
            setActiveTab('services');
          } else if (VALID_TABS.includes(view as TabKey)) {
            setActiveTab(view as TabKey);
          }
        }}
        hasActiveChecklist={!!checklist}
        onOpenAssistant={() => handleOpenAssistant()}
      />

      {/* Persistent Step Indicator Bar (Visible on all tabs) */}
      <div className="bg-emerald-950 dark:bg-[#06150f] text-stone-300 py-2.5 px-4 text-xs border-b border-emerald-900/60 dark:border-emerald-800/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Workflow Steps Indicator */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-0.5 text-[11px] sm:text-xs">
            <div className={`flex items-center gap-1.5 font-bold ${currentStepNumber >= 1 ? 'text-emerald-300' : 'text-stone-500'}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-800/80 text-white flex items-center justify-center text-[10px]">1</span>
              <span>{isUrdu ? 'سروس کا انتخاب' : 'Select Service'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600 shrink-0 rtl:rotate-180" />
            <div className={`flex items-center gap-1.5 font-bold ${currentStepNumber >= 2 ? 'text-emerald-300' : 'text-stone-400'}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-800/80 text-white flex items-center justify-center text-[10px]">2</span>
              <span>{isUrdu ? '3-4 سوالات کے جواب' : 'Assessment'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600 shrink-0 rtl:rotate-180" />
            <div className={`flex items-center gap-1.5 font-bold ${currentStepNumber >= 3 ? 'text-emerald-300' : 'text-stone-400'}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-800/80 text-white flex items-center justify-center text-[10px]">3</span>
              <span>{isUrdu ? 'مصدقہ چیک لسٹ و اسکور' : 'Verified Checklist'}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600 shrink-0 rtl:rotate-180" />
            <div className={`flex items-center gap-1.5 font-bold ${currentStepNumber >= 4 ? 'text-emerald-300' : 'text-stone-400'}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-800/80 text-white flex items-center justify-center text-[10px]">4</span>
              <span>{isUrdu ? 'دفتر حاضری مکمل تیاری کے ساتھ' : 'Visit Office Prepared'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-200">
              {isUrdu ? 'تمام 7 سرکاری خدمات فعال' : '7 Karachi Civil Services Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Bar (Mobile-first, horizontally scrollable, 44px min touch target, logical CSS, tablist role) */}
      <nav
        aria-label="CitizenEase Hub Navigation"
        className="sticky top-16 z-30 bg-white/95 dark:bg-[#0d1c16]/95 backdrop-blur-md border-b border-stone-200/90 dark:border-stone-800 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            role="tablist"
            aria-label="CitizenEase Primary Tabs"
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2.5 scrollbar-thin scroll-smooth focus:outline-none"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                    isSelected
                      ? 'bg-[#0C3E2E] dark:bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                      : 'bg-stone-100/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-300 hover:bg-stone-200/80 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-300' : 'text-stone-500 dark:text-stone-400'}`} />
                  <span>{isUrdu ? tab.label_ur : tab.label_en}</span>

                  {/* Badges */}
                  {tab.count !== undefined && (
                    <span className={`ms-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isSelected ? 'bg-emerald-800/80 text-emerald-200' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className={`ms-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Container with Accessible Tabpanels */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TABPANEL 1: SERVICES */}
        <div
          id="panel-services"
          role="tabpanel"
          aria-labelledby="tab-services"
          hidden={activeTab !== 'services'}
          className={activeTab === 'services' ? 'block' : 'hidden'}
        >
          <ServiceDiscovery
            language={language}
            onSelectService={handleStartQuestionnaire}
            onOpenServiceDetail={(slug) => setDetailModalSlug(slug)}
            onOpenOffices={() => setActiveTab('offices')}
            onOpenAssistant={handleOpenAssistant}
          />
        </div>

        {/* TABPANEL 2: MY CHECKLIST */}
        <div
          id="panel-checklist"
          role="tabpanel"
          aria-labelledby="tab-checklist"
          hidden={activeTab !== 'checklist'}
          className={activeTab === 'checklist' ? 'block space-y-6' : 'hidden'}
        >
          {/* Quick Service Switcher Bar */}
          <div className="bg-white dark:bg-[#11221b] rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {isUrdu ? 'سروس کا انتخاب کریں اور فوری چیک لسٹ دیکھیں:' : 'Select Service for Interactive Checklist:'}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {isUrdu ? 'کسی بھی سروس پر کلک کر کے فوری تقاضے اور تیاری کا اسکور حاصل کریں' : 'Switch service to instantly calculate requirements & readiness score'}
                </p>
              </div>
            </div>

            {/* 7 Service Pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {allServiceSlugs.map((slug) => {
                const s = SERVICES[slug];
                const isActive = checklist?.service_slug === slug;

                return (
                  <button
                    key={slug}
                    onClick={() => handleQuickSwitchService(slug)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px] ${
                      isActive
                        ? 'bg-[#0C3E2E] dark:bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                    <span>{isUrdu ? s?.title_ur || slug : s?.title_en || slug}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empty State vs Checklist View */}
          {checklist ? (
            <ChecklistHub
              checklist={checklist}
              language={language}
              onUpdateItemStatus={handleUpdateItemStatus}
              onOpenAssistant={handleOpenAssistant}
              onOpenOffices={() => setActiveTab('offices')}
              onRestartQuestionnaire={() => handleStartQuestionnaire(checklist.service_slug)}
              onOpenSources={() => setActiveTab('sources')}
            />
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-4 max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300 mx-auto">
                <FileQuestion className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {isUrdu ? 'ابھی تک کوئی چیک لسٹ تیار نہیں ہوئی' : 'No Checklist Generated Yet'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                  {isUrdu
                    ? 'سروسز ٹیب سے اپنی مطلوبہ سروس منتخب کر کے 3-4 آسان سوالات کے جواب دیں تاکہ آپ کی ذاتی مصدقہ چیک لسٹ تیار ہو سکے۔'
                    : 'Select a service from the Services tab and answer a few quick questions to generate your tailored, verified readiness checklist.'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('services')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0C3E2E] dark:bg-emerald-600 text-white font-bold text-sm shadow-sm hover:bg-[#0A3426] dark:hover:bg-emerald-500 transition-all cursor-pointer min-h-[44px]"
              >
                <Layers className="w-4 h-4" />
                <span>{isUrdu ? 'سروسز ٹیب پر جائیں' : 'Browse Services & Start'}</span>
              </button>
            </div>
          )}
        </div>

        {/* TABPANEL 3: COST CALCULATOR */}
        <div
          id="panel-cost"
          role="tabpanel"
          aria-labelledby="tab-cost"
          hidden={activeTab !== 'cost'}
          className={activeTab === 'cost' ? 'block' : 'hidden'}
        >
          <CostCalculator
            language={language}
            defaultServiceSlug={checklist?.service_slug || 'passport'}
          />
        </div>

        {/* TABPANEL 4: KARACHI OFFICES */}
        <div
          id="panel-offices"
          role="tabpanel"
          aria-labelledby="tab-offices"
          hidden={activeTab !== 'offices'}
          className={activeTab === 'offices' ? 'block' : 'hidden'}
        >
          <OfficeLocator
            language={language}
            preselectedDistrict={checklist?.answers_snapshot?.district}
            preselectedService={checklist?.service_slug}
          />
        </div>

        {/* TABPANEL 5: GROUNDED AI CITIZEN ASSISTANT */}
        <div
          id="panel-assistant"
          role="tabpanel"
          aria-labelledby="tab-assistant"
          hidden={activeTab !== 'assistant'}
          className={activeTab === 'assistant' ? 'block' : 'hidden'}
        >
          <AssistantPanel
            language={language}
            checklistItems={checklist?.items}
          />
        </div>

        {/* TABPANEL 6: LEGAL PROVENANCE & SOURCES LEDGER */}
        <div
          id="panel-sources"
          role="tabpanel"
          aria-labelledby="tab-sources"
          hidden={activeTab !== 'sources'}
          className={activeTab === 'sources' ? 'block' : 'hidden'}
        >
          <SourcesLedger language={language} />
        </div>
      </main>

      {/* Persistent Legal Boundary Footer */}
      <Footer
        language={language}
        onOpenSources={() => setActiveTab('sources')}
      />

      {/* Slide-over Grounded AI Assistant Drawer (Always accessible from quick toggle) */}
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-stone-500 dark:text-stone-400 bg-[#FAF8F5] dark:bg-[#09130f]">Loading CitizenEase Hub...</div>}>
      <CitizenEaseMain />
    </Suspense>
  );
}
