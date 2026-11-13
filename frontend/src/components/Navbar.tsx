'use client';

import React, { useState, useEffect } from 'react';
import { I18N, Language } from '../lib/i18n';
import { supabase } from '../lib/supabaseClient';
import { AuthModal } from './AuthModal';
import {
  ShieldCheck,
  MapPin,
  FileCheck2,
  BookOpen,
  Sparkles,
  Layers,
  Sun,
  Moon,
  Calculator,
  User,
  LogOut,
  LogIn
} from 'lucide-react';

export type ActiveNavView = 'all' | 'home' | 'services' | 'checklist' | 'cost' | 'offices' | 'assistant' | 'sources';

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

  const [currentUser, setCurrentUser] = useState<{ email?: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setCurrentUser({ email: session.user.email });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setCurrentUser({ email: session.user.email });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setCurrentUser(null);
    }
  };

  const scrollToSection = (id: string, view: ActiveNavView) => {
    onNavigate(view);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#0c1813]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-2 xl:gap-3">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => scrollToSection('services', 'all')}
          className="flex items-center gap-2 text-left focus:outline-none group shrink-0 cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#0C3E2E] dark:bg-emerald-900 border border-emerald-700/40 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#0C3E2E] dark:text-emerald-400 whitespace-nowrap">
              {t.app_name}
            </span>
            <span className="hidden xl:inline text-[11px] font-medium text-stone-500 dark:text-stone-400 tracking-tight whitespace-nowrap -mt-0.5">
              {isUrdu ? 'کراچی شہری رہنمائی · یکجا لنک' : 'Karachi Unified Hub'}
            </span>
          </div>
        </button>

        {/* Zone 2: All Features Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2.5 2xl:gap-3.5 text-xs xl:text-sm font-medium text-stone-600 dark:text-stone-300 min-w-0 shrink">
          <button
            onClick={() => scrollToSection('services', 'all')}
            className={`flex items-center gap-1 xl:gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer px-1 xl:px-1.5 ${
              activeView === 'all'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-bold'
                : 'border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{isUrdu ? 'تمام فیچرز' : 'All Features'}</span>
          </button>

          <button
            onClick={() => scrollToSection('services', 'services')}
            className={`whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer px-1 xl:px-1.5 ${
              activeView === 'services' || activeView === 'home'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-semibold'
                : 'border-transparent'
            }`}
          >
            {t.nav_services}
          </button>

          <button
            onClick={() => scrollToSection('checklist', 'checklist')}
            className={`flex items-center gap-1 xl:gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer px-1 xl:px-1.5 ${
              activeView === 'checklist'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-semibold'
                : 'border-transparent'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{isUrdu ? 'چیک لسٹ' : 'Checklist'}</span>
          </button>

          <button
            onClick={() => scrollToSection('cost', 'cost')}
            className={`flex items-center gap-1 xl:gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer px-1 xl:px-1.5 ${
              activeView === 'cost'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-semibold'
                : 'border-transparent'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{isUrdu ? 'لاگت' : 'Calculator'}</span>
          </button>

          <button
            onClick={() => scrollToSection('offices', 'offices')}
            className={`flex items-center gap-1 xl:gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer px-1 xl:px-1.5 ${
              activeView === 'offices'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-semibold'
                : 'border-transparent'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-stone-500 dark:text-stone-400 shrink-0" />
            <span>{isUrdu ? 'دفاتر' : 'Offices'}</span>
          </button>

          <button
            onClick={() => scrollToSection('assistant', 'assistant')}
            className={`flex items-center gap-1 xl:gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer px-1 xl:px-1.5 ${
              activeView === 'assistant'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-semibold'
                : 'border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{isUrdu ? 'اے آئی' : 'Assistant'}</span>
          </button>

          <button
            onClick={() => scrollToSection('sources', 'sources')}
            className={`flex items-center gap-1 xl:gap-1.5 whitespace-nowrap transition-colors hover:text-[#0C3E2E] dark:hover:text-emerald-400 pb-0.5 border-b-2 cursor-pointer px-1 xl:px-1.5 ${
              activeView === 'sources'
                ? 'border-[#0C3E2E] dark:border-emerald-400 text-[#0C3E2E] dark:text-emerald-400 font-semibold'
                : 'border-transparent'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-stone-500 dark:text-stone-400 shrink-0" />
            <span>{isUrdu ? 'ذرائع' : 'Sources'}</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Supabase User Auth Button / Indicator */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl px-2.5 py-1.5 text-xs shadow-xs shrink-0">
              <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-[130px] text-emerald-900 dark:text-emerald-300 font-medium">
                {currentUser.email?.split('@')[0]}
              </span>
              <button
                onClick={handleSignOut}
                className="text-stone-400 hover:text-red-600 dark:hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors shrink-0"
                title={isUrdu ? 'لاگ آؤٹ کریں' : 'Sign Out'}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-[#0C3E2E] dark:text-emerald-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 rounded-xl transition-colors whitespace-nowrap shadow-xs cursor-pointer shrink-0"
              title="Sign In / Register"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>{isUrdu ? 'لاگ ان' : 'Sign In'}</span>
            </button>
          )}

          {/* Ask AI Quick Drawer */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-[#0C3E2E] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-700/50 rounded-xl transition-colors whitespace-nowrap shadow-xs cursor-pointer shrink-0"
            title="Ask Grounded CitizenEase AI Drawer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span className="hidden xl:inline">{isUrdu ? 'چیٹ ڈراور' : 'Chat Drawer'}</span>
          </button>

          {/* Dark / Light Mode Switcher */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-1.5 sm:p-2 text-stone-600 dark:text-amber-400 hover:text-stone-900 dark:hover:text-amber-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] sm:min-h-[38px] sm:min-w-[38px] flex items-center justify-center shadow-xs shrink-0"
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
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 transition-colors whitespace-nowrap min-h-[36px] min-w-[62px] sm:min-h-[38px] sm:min-w-[68px] justify-center cursor-pointer shadow-xs shrink-0"
          >
            <span className={language === 'en' ? 'text-[#0C3E2E] dark:text-emerald-400 font-bold underline' : 'text-stone-500 dark:text-stone-400'}>EN</span>
            <span className="text-stone-400 dark:text-stone-500">/</span>
            <span className={language === 'ur' ? 'text-[#0C3E2E] dark:text-emerald-400 font-bold underline font-urdu' : 'text-stone-500 dark:text-stone-400 font-urdu'}>اردو</span>
          </button>
        </div>
      </div>
    </header>

    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      language={language}
      onAuthSuccess={(email) => setCurrentUser({ email })}
    />
  </>
);
};
