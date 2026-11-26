'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Language } from '@/lib/i18n';
import { X, Lock, Mail, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAuthSuccess?: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onAuthSuccess,
}) => {
  const isUrdu = language === 'ur';
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured() || !supabase) {
      setErrorMsg(
        isUrdu
          ? 'براہ کرم .env.local میں NEXT_PUBLIC_SUPABASE_URL اور KEY سیٹ کریں'
          : 'Supabase credentials are not configured in frontend/.env.local'
      );
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg(
            isUrdu
              ? 'اکاؤنٹ بن گیا ہے! تصدیقی ای میل چیک کریں یا لاگ ان کریں۔'
              : 'Account created! Please check your email to confirm or sign in.'
          );
          if (data?.user?.email && onAuthSuccess) {
            onAuthSuccess(data.user.email);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg(isUrdu ? 'کامیابی سے لاگ ان ہو گئے!' : 'Signed in successfully!');
          if (data?.user?.email && onAuthSuccess) {
            onAuthSuccess(data.user.email);
          }
          setTimeout(() => {
            onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full max-w-md my-auto bg-[#FAF8F5] dark:bg-[#0c1813] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-stone-900 dark:text-stone-100 max-h-[90vh] overflow-y-auto ${
          isUrdu ? 'rtl font-urdu' : 'ltr'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-[#0C3E2E] dark:text-emerald-400 mb-3 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#0C3E2E] dark:text-emerald-400">
            {isSignUp
              ? isUrdu
                ? 'نیا اکاؤنٹ بنائیں'
                : 'Create Citizen Account'
              : isUrdu
              ? 'اپنے اکاؤنٹ میں لاگ ان کریں'
              : 'Sign in to CitizenEase'}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs">
            {isUrdu
              ? 'اپنے تیار کردہ چیک لسٹ محفوظ رکھنے کے لیے لاگ ان کریں (کوئی شناختی کوائف محفوظ نہیں کیے جاتے)'
              : 'Securely sync and save your preparation checklists across devices (Zero PII stored)'}
          </p>
        </div>

        {/* Missing Config Alert if Supabase is not yet set up */}
        {!isSupabaseConfigured() && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {isUrdu ? 'سپابیس کوائف درکار ہیں' : 'Supabase Not Configured'}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                {isUrdu
                  ? 'برائے مہربانی frontend/.env.local میں NEXT_PUBLIC_SUPABASE_URL اور KEY درج کریں۔'
                  : 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to frontend/.env.local to enable live authentication.'}
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C3E2E] dark:focus:ring-emerald-500 text-stone-800 dark:text-stone-200 placeholder:text-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              {isUrdu ? 'پاس ورڈ' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C3E2E] dark:focus:ring-emerald-500 text-stone-800 dark:text-stone-200 placeholder:text-stone-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#0C3E2E] hover:bg-[#082b20] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isUrdu ? 'پروسیسنگ...' : 'Processing...'}</span>
              </>
            ) : (
              <span>
                {isSignUp
                  ? isUrdu
                    ? 'اکاؤنٹ بنائیں'
                    : 'Sign Up'
                  : isUrdu
                  ? 'لاگ ان کریں'
                  : 'Sign In'}
              </span>
            )}
          </button>
        </form>

        {/* Toggle between Sign In / Sign Up */}
        <div className="mt-5 text-center text-xs text-stone-500 dark:text-stone-400">
          {isSignUp ? (
            <p>
              {isUrdu ? 'پہلے سے اکاؤنٹ ہے؟' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-[#0C3E2E] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {isUrdu ? 'لاگ ان کریں' : 'Sign In'}
              </button>
            </p>
          ) : (
            <p>
              {isUrdu ? 'اکاؤنٹ نہیں ہے؟' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-[#0C3E2E] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {isUrdu ? 'نیا اکاؤنٹ بنائیں' : 'Create an Account'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
