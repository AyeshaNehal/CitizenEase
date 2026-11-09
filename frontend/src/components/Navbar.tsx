'use client';

import React from 'react';
import { I18N, Language } from '../lib/i18n';
import {
  ShieldCheck,
  MapPin,
  FileCheck2,
  BookOpen,
  Sparkles,
  Layers,
  Sun,
  Moon
} from 'lucide-react';

export type ActiveNavView = 'all' | 'home' | 'services' | 'checklist' | 'offices' | 'assistant' | 'sources';

interface NavbarProps {
  language: Language;
  onToggleLanguage: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  activeView: ActiveNavView;
  onNavigate: (view: ActiveNavView) => void;
  hasActiveChecklist: boolean;
  onOpenAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  theme = 'light',
  onToggleTheme,
  activeView,
  onNavigate,
  hasActiveChecklist,
  onOpenAssistant
}) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';
  const isDark = theme === 'dark';

  const scrollToSection = (id: string, view: ActiveNavView) => {
    onNavigate(view);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#0c1813]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => scrollToSection('services', 'all')}
          className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#0C3E2E] dark:bg-emerald-900 border border-emerald-700/40 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#0C3E2E] dark:text-emerald-400 whitespace-nowrap">
              {t.app_name}
            </span>
            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 tracking-tight whitespace-nowrap -mt-0.5">
              {isUrdu ? 'کراچی شہری رہنمائی · یکجا لنک' : 'Karachi Unified Hub'}
            </span>
          </div>
        </button>

        {/* Zone 2: All Features Nav Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={() => scrollToSection('services', 'all')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer ${
              activeView === 'all'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-bold'
                : 'border-transparent'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>{isUrdu ? 'تمام فیچرز (یکجا)' : 'All Features (Combined)'}</span>
          </button>

          <button
            onClick={() => scrollToSection('services', 'services')}
            className={`whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer ${
              activeView === 'services' || activeView === 'home'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-semibold'
                : 'border-transparent'
            }`}
          >
            {t.nav_services}
          </button>

          <button
            onClick={() => scrollToSection('checklist', 'checklist')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer ${
              activeView === 'checklist'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-semibold'
                : 'border-transparent'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>{t.nav_saved}</span>
          </button>

          <button
            onClick={() => scrollToSection('offices', 'offices')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer ${
              activeView === 'offices'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-semibold'
                : 'border-transparent'
            }`}
          >
            <MapPin className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <span>{t.nav_offices}</span>
          </button>

          <button
            onClick={() => scrollToSection('assistant', 'assistant')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer ${
              activeView === 'assistant'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-semibold'
                : 'border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isUrdu ? 'اے آئی گائیڈ' : 'AI Assistant'}</span>
          </button>

          <button
            onClick={() => scrollToSection('sources', 'sources')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer ${
              activeView === 'sources'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-semibold'
                : 'border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <span>{t.nav_sources}</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Ask AI Quick Drawer */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0C3E2E] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-700/50 rounded-xl transition-colors whitespace-nowrap shadow-xs cursor-pointer"
            title="Ask Grounded CitizenEase AI Drawer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span className="hidden sm:inline">{isUrdu ? 'چیٹ ڈراور' : 'Chat Drawer'}</span>
          </button>

          {/* Dark / Light Mode Switcher */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-stone-600 dark:text-amber-400 hover:text-stone-900 dark:hover:text-amber-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 rounded-xl transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shadow-xs"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
              )}
            </button>
          )}

          {/* Bilingual Language Switcher */}
          <button
            onClick={onToggleLanguage}
            aria-label="Toggle Urdu or English language"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 transition-colors whitespace-nowrap min-h-[38px] min-w-[70px] justify-center cursor-pointer shadow-xs"
          >
            <span className={language === 'en' ? 'text-[#0C3E2E] dark:text-emerald-400 font-bold underline' : 'text-stone-500 dark:text-stone-400'}>EN</span>
            <span className="text-stone-400 dark:text-stone-500">/</span>
            <span className={language === 'ur' ? 'text-[#0C3E2E] dark:text-emerald-400 font-bold underline font-urdu' : 'text-stone-500 dark:text-stone-400 font-urdu'}>اردو</span>
          </button>
        </div>
      </div>
    </header>
  );
};
