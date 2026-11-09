import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ServiceDiscovery } from './components/ServiceDiscovery';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { QuestionnaireModal } from './components/QuestionnaireModal';
import { ChecklistHub } from './components/ChecklistHub';
import { AssistantSlideOver } from './components/AssistantSlideOver';
import { OfficeLocator } from './components/OfficeLocator';
import { SourcesModal } from './components/SourcesModal';
import { Language, I18N } from './lib/i18n';
import {
  generateChecklistFromAnswers,
  calculateReadinessScore,
  GeneratedChecklist,
  UserItemStatus
} from './lib/rulesEngine';

const STORAGE_KEY = 'citizenease_saved_checklist_v1';
const LANG_STORAGE_KEY = 'citizenease_lang_pref';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return saved === 'ur' ? 'ur' : 'en';
    } catch {
      return 'en';
    }
  });

  const [activeView, setActiveView] = useState<'home' | 'checklist' | 'offices' | 'sources'>('home');
  const [activeServiceSlug, setActiveServiceSlug] = useState<'domicile_prc' | 'first_cnic'>('domicile_prc');

  // Modals state
  const [detailModalSlug, setDetailModalSlug] = useState<'domicile_prc' | 'first_cnic' | null>(null);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | undefined>(undefined);

  // Active checklist state
  const [checklist, setChecklist] = useState<GeneratedChecklist | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Storage read failed:', e);
    }
    // Default initial seeded checklist for first-time Domicile/PRC applicant in Karachi South
    return generateChecklistFromAnswers(
      'domicile_prc',
      {
        application_type: 'both',
        district: 'karachi_south',
        is_applicant_minor: false,
        is_student: true,
        parent_domicile_available: 'yes',
        is_married_female: false
      },
      {
        REQ_CNIC_COPIES: 'have',
        REQ_PASSPORT_PHOTOS: 'have'
      }
    );
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

  const handleStartQuestionnaire = (serviceSlug: 'domicile_prc' | 'first_cnic') => {
    setActiveServiceSlug(serviceSlug);
    setIsQuestionnaireOpen(true);
  };

  const handleQuestionnaireComplete = (answers: Record<string, any>) => {
    setIsQuestionnaireOpen(false);
    const newChecklist = generateChecklistFromAnswers(activeServiceSlug, answers);
    setChecklist(newChecklist);
    setActiveView('checklist');
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900">
      {/* Top Bar with 3-Zone Contract */}
      <Navbar
        language={language}
        onToggleLanguage={toggleLanguage}
        activeView={activeView}
        onNavigate={(view) => {
          if (view === 'sources') {
            setIsSourcesOpen(true);
          } else {
            setActiveView(view);
          }
        }}
        hasActiveChecklist={!!checklist}
        onOpenAssistant={() => handleOpenAssistant()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'home' && (
          <ServiceDiscovery
            language={language}
            onSelectService={handleStartQuestionnaire}
            onOpenServiceDetail={(slug) => setDetailModalSlug(slug)}
            onOpenOffices={() => setActiveView('offices')}
            onOpenAssistant={handleOpenAssistant}
          />
        )}

        {activeView === 'checklist' && checklist && (
          <ChecklistHub
            checklist={checklist}
            language={language}
            onUpdateItemStatus={handleUpdateItemStatus}
            onOpenAssistant={handleOpenAssistant}
            onOpenOffices={() => setActiveView('offices')}
            onRestartQuestionnaire={() => handleStartQuestionnaire(checklist.service_slug)}
            onOpenSources={() => setIsSourcesOpen(true)}
          />
        )}

        {activeView === 'offices' && (
          <OfficeLocator
            language={language}
            preselectedDistrict={checklist?.answers_snapshot?.district}
            preselectedService={checklist?.service_slug}
          />
        )}
      </main>

      {/* Persistent Legal Boundary Footer */}
      <Footer
        language={language}
        onOpenSources={() => setIsSourcesOpen(true)}
      />

      {/* Slide-over Grounded AI Assistant */}
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
      {isSourcesOpen && (
        <SourcesModal
          language={language}
          onClose={() => setIsSourcesOpen(false)}
        />
      )}
    </div>
  );
}
