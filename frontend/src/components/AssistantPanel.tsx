'use client';

import React, { useState, useRef, useEffect } from 'react';
import { I18N, Language } from '../lib/i18n';
import { askCitizenEaseAssistant, ChatMessage } from '../lib/geminiAssistant';
import { EvaluatedChecklistItem } from '../lib/rulesEngine';
import {
  Send,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Trash2,
  ExternalLink,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

interface AssistantPanelProps {
  language: Language;
  checklistItems?: EvaluatedChecklistItem[];
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  language,
  checklistItems = []
}) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: isUrdu
        ? 'خوش آمدید! میں سٹیزن ایز گائیڈ ہوں۔ میں سندھ ہائی کورٹ، نادرا، اور پاسپورٹ ڈائریکٹوریٹ کے مصدقہ قواعد کی بنیاد پر کراچی کے شہریوں کی رہنمائی کرتا ہوں۔ یاد رہے، اپنا 13 ہندسوں کا شناختی کارڈ نمبر کبھی درج نہ کریں۔'
        : 'Welcome! I am your CitizenEase AI Assistant. I provide grounded answers strictly based on Sindh High Court rulings, NADRA citizen registration guidelines, and DGI&P official passport regulations. Note: Never enter private CNIC numbers.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    // Check PII locally first to update UI feedback immediately
    const hasPii = /\b\d{5}-?\d{7}-?\d\b/.test(query);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      piiDetected: hasPii
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await askCitizenEaseAssistant(query, language, checklistItems);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
        needs_official_confirmation: response.needs_official_confirmation,
        piiDetected: hasPii
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          text: isUrdu
            ? 'معذرت، رابطہ نہیں ہو سکا۔ براہ کرم مصدقہ قانونی رہنما اصول دوبارہ دیکھیں۔'
            : 'Sorry, unable to connect right now. Please refer to the verified rules checklist.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = isUrdu
    ? [
        'پاسپورٹ تجدید کے لیے کیا دستاویزات درکار ہیں؟',
        'پیدائشی اور ازدواجی ایف آر سی میں کیا فرق ہے؟',
        'ڈومیسائل اور پی آر سی میں کیا قانونی فرق ہے؟',
        'کیا 18 سال کا نیا شہری پاک آئی ڈی ایپ سے کارڈ بنوا سکتا ہے؟'
      ]
    : [
        'What documents are needed for Passport Renewal?',
        'What is the difference between FRC By Birth and By Marriage?',
        'What is the legal difference between Domicile and PRC?',
        'Can an 18-year-old apply for CNIC online via PakID?'
      ];

  return (
    <section id="assistant" className="space-y-6 scroll-mt-24">
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {/* Panel Header */}
        <div className="p-6 bg-gradient-to-r from-[#0C3E2E]/10 via-[#0C3E2E]/5 to-transparent border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isUrdu ? 'مصدقہ حکومتی قانونی اے آئی اسسٹنٹ' : 'Grounded Legal Assistant'}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-stone-900">
              {isUrdu ? 'سٹیزن ایز اے آئی رہنمائی' : 'CitizenEase Grounded Assistant'}
            </h2>
            <p className="text-xs text-stone-500">
              {isUrdu
                ? 'صفر پی آئی آئی کی ضمانت: نادرا، پاسپورٹ اور سندھ ہائی کورٹ کے ریکارڈ کی روشنی میں بلا تاخیر جواب حاصل کریں۔'
                : 'Zero PII Guarantee: Instant grounded responses backed by official Sindh, NADRA, and DGI&P regulations.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Zero-PII Active
            </span>
            <button
              onClick={() => setMessages(messages.slice(0, 1))}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-3 bg-stone-50/70 border-b border-stone-100 flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">
            {isUrdu ? 'اکثر پوچھے گئے سوالات:' : 'Quick Questions:'}
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-xs bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 px-3 py-1.5 rounded-full border border-stone-200 transition-colors text-left cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat History Box */}
        <div className="h-80 overflow-y-auto p-6 space-y-4 bg-stone-50/30">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${
                  isUser ? 'ml-auto' : 'mr-auto'
                }`}
              >
                {/* PII Alert Banner if redacted */}
                {msg.piiDetected && (
                  <div className="mb-1.5 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>
                      {isUrdu
                        ? 'رازداری کا تحفظ: 13 ہندسوں کا شناختی کارڈ خودکار طور پر حذف کر دیا گیا۔'
                        : 'Privacy Shield: 13-digit CNIC detected and redacted before processing.'}
                    </span>
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#0C3E2E] text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Citations / Source Badges for assistant */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        {isUrdu ? 'مآخذ:' : 'Cited Sources:'}
                      </span>
                      {msg.citations.map((src, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold"
                        >
                          <Building2 className="w-3 h-3 text-emerald-600" />
                          {src.issuing_authority || src.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-stone-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-stone-200 max-w-xs text-xs text-stone-500">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>{isUrdu ? 'مصدقہ ڈیٹا بیس سے تلاش جاری ہے...' : 'Grounded verification in progress...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isUrdu
                  ? 'سندھ ہائی کورٹ، پاسپورٹ یا نادرا سے متعلق سوال پوچھیں...'
                  : 'Ask about Passport renewal, FRC categories, Domicile vs PRC...'
              }
              disabled={isLoading}
              className="flex-1 bg-stone-50 border border-stone-200 focus:border-[#0C3E2E] focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm text-stone-900 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-[#0C3E2E] hover:bg-[#082b20] disabled:opacity-40 text-white px-5 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <span>{isUrdu ? 'ارسال کریں' : 'Send'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[11px] text-stone-400 mt-2 text-center">
            {isUrdu
              ? 'مستقل صفر پی آئی آئی پالیسی: کوئی ذاتی معلومات یا نجی شناختی کوائف سرور پر محفوظ نہیں کیے جاتے۔'
              : 'Zero PII Policy: No private identity data or CNIC numbers are ever logged or retained.'}
          </p>
        </div>
      </div>
    </section>
  );
};
