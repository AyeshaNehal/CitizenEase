import React from 'react';
import { I18N, Language } from '../lib/i18n';
import { ShieldCheck, MapPin, FileCheck2, BookOpen, Sparkles } from 'lucide-react';

interface NavbarProps {
  language: Language;
  onToggleLanguage: () => void;
  activeView: 'home' | 'checklist' | 'offices' | 'sources';
  onNavigate: (view: 'home' | 'checklist' | 'offices' | 'sources') => void;
  hasActiveChecklist: boolean;
  onOpenAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  activeView,
  onNavigate,
  hasActiveChecklist,
  onOpenAssistant
}) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Display Face, Single Text Line) */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-[#0C3E2E] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#0C3E2E] whitespace-nowrap">
              {t.app_name}
            </span>
            <span className="text-[11px] font-medium text-stone-500 tracking-tight whitespace-nowrap -mt-0.5">
              {isUrdu ? 'کراچی شہری رہنمائی' : 'Karachi Citizen Layer'}
            </span>
          </div>
        </button>

        {/* Zone 2: 4 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors hover:text-[#0C3E2E] pb-0.5 border-b-2 ${
              activeView === 'home' ? 'border-[#0C3E2E] text-[#0C3E2E] font-semibold' : 'border-transparent'
            }`}
          >
            {t.nav_services}
          </button>

          {hasActiveChecklist && (
            <button
              onClick={() => onNavigate('checklist')}
              className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] pb-0.5 border-b-2 ${
                activeView === 'checklist' ? 'border-[#0C3E2E] text-[#0C3E2E] font-semibold' : 'border-transparent'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-emerald-700" />
              <span>{t.nav_saved}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('offices')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] pb-0.5 border-b-2 ${
              activeView === 'offices' ? 'border-[#0C3E2E] text-[#0C3E2E] font-semibold' : 'border-transparent'
            }`}
          >
            <MapPin className="w-4 h-4 text-stone-500" />
            <span>{t.nav_offices}</span>
          </button>

          <button
            onClick={() => onNavigate('sources')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] pb-0.5 border-b-2 ${
              activeView === 'sources' ? 'border-[#0C3E2E] text-[#0C3E2E] font-semibold' : 'border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 text-stone-500" />
            <span>{t.nav_sources}</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Ask AI Trigger Button */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0C3E2E] bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            title="Ask Grounded CitizenEase AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">{isUrdu ? 'اے آئی گائیڈ' : 'Ask Guide'}</span>
          </button>

          {/* Bilingual Language Switcher */}
          <button
            onClick={onToggleLanguage}
            aria-label="Toggle Urdu or English language"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors whitespace-nowrap min-h-[38px] min-w-[70px] justify-center"
          >
            <span className={language === 'en' ? 'text-[#0C3E2E] font-bold underline' : 'text-stone-500'}>EN</span>
            <span className="text-stone-400">/</span>
            <span className={language === 'ur' ? 'text-[#0C3E2E] font-bold underline font-urdu' : 'text-stone-500 font-urdu'}>اردو</span>
          </button>
        </div>
      </div>
    </header>
  );
};
