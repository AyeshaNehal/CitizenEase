import React, { useState, useRef, useEffect } from 'react';
import { I18N, Language } from '../lib/i18n';
import { askCitizenEaseAssistant, ChatMessage } from '../lib/geminiAssistant';
import { EvaluatedChecklistItem } from '../lib/rulesEngine';
import {
  X,
  Send,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Trash2,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface AssistantSlideOverProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  checklistItems?: EvaluatedChecklistItem[];
  initialPrompt?: string;
}

export const AssistantSlideOver: React.FC<AssistantSlideOverProps> = ({
  isOpen,
  language,
  onClose,
  checklistItems = [],
  initialPrompt
}) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: isUrdu
        ? 'خوش آمدید! میں سٹیزن ایز گائیڈ ہوں۔ میں سندھ ہائی کورٹ کے عدالتی ریکارڈ اور ڈی سی آفس نوٹس بورڈ کے مصدقہ قواعد کی بنیاد پر آپ کے سوالات کا جواب دے سکتا ہوں۔ یاد رہے، اپنا شناختی کارڈ نمبر کبھی درج نہ کریں۔'
        : 'Welcome! I am your CitizenEase Assistant. I provide grounded guidance based strictly on Sindh High Court rulings and verified DC/NADRA office inspection records. Note: Never enter your CNIC number.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle incoming initial prompt if triggered from a document card
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await askCitizenEaseAssistant(query, language, checklistItems);

      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        citations: response.citations,
        needs_official_confirmation: response.needs_official_confirmation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: isUrdu
          ? 'معذرت، رہنمائی کے سرور سے رابطہ منقطع ہو گیا۔ براہِ کرم چیک لسٹ میں درج مصدقہ قواعد کا مطالعہ کریں۔'
          : 'Service temporarily unable to process query. Please refer directly to the verified rules in your checklist.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: isUrdu
          ? 'گفتگو خالی کر دی گئی۔ آپ مزید سرکاری قواعد کے متعلق سوالات پوچھ سکتے ہیں۔'
          : 'Chat history cleared. Feel free to ask grounded questions regarding Karachi administrative procedures.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (!isOpen) return null;

  const suggestedPrompts = [
    {
      en: 'What is the exact legal difference between Domicile and PRC?',
      ur: 'ڈومیسائل اور پی آر سی میں اصل قانونی فرق کیا ہے؟'
    },
    {
      en: 'What is the official fee for Domicile / PRC?',
      ur: 'ڈومیسائل اور پی آر سی کی سرکاری فیس کتنی ہے؟'
    },
    {
      en: 'Can a first-time 18-year-old applicant use PakID mobile app?',
      ur: 'کیا 18 سال کا نیا سائل پاک آئی ڈی ایپ استعمال کر سکتا ہے؟'
    },
    {
      en: 'I live in Keamari, but father’s Domicile was from DC West?',
      ur: 'میں کیماڑی میں رہتا ہوں لیکن والد کا ڈومیسائل ڈی سی ویسٹ کا ہے؟'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-md sm:max-w-lg bg-white dark:bg-[#102019] h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-stone-800 transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/80 dark:bg-[#0c1813] flex items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0C3E2E] dark:bg-emerald-900 border border-emerald-700/40 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">
                {t.assistant_title}
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {isUrdu ? 'صرف مصدقہ عدالتی و سرکاری ریکارڈز' : 'Strictly Grounded in Karachi Records'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              title={t.btn_clear}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close Assistant"
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Privacy & Anti-Hallucination Disclaimer Strip */}
        <div className="px-4 py-2 bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/70 dark:border-amber-800/40 flex items-center gap-2 text-[11px] text-amber-900 dark:text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{t.assistant_warning}</span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-stone-50/30 dark:bg-[#08120e] transition-colors">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#0C3E2E] dark:bg-emerald-700 text-white rounded-br-xs'
                    : 'bg-stone-100 dark:bg-[#13261e] text-stone-900 dark:text-stone-100 rounded-bl-xs border border-stone-200/70 dark:border-stone-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* If answer recommends official confirmation */}
                {msg.needs_official_confirmation && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{t.official_confirmation_alert}</span>
                  </div>
                )}

                {/* Grounded Server-Built Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-200 dark:border-stone-700 text-[11px] text-stone-600 dark:text-stone-400 space-y-1">
                    <div className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{t.citations_label}</span>
                    </div>
                    {msg.citations.map((cite, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 text-stone-500 dark:text-stone-400">
                        <span className="truncate">
                          [{cite.id}] {cite.title} · {cite.issuing_authority}
                        </span>
                        {cite.url && (
                          <a
                            href={cite.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs w-36 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{isUrdu ? 'تصدیق جاری ہے...' : 'Grounding facts...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Inquiries */}
        <div className="p-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-[#0c1813] overflow-x-auto whitespace-nowrap transition-colors">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 shrink-0">
              {isUrdu ? 'عام سوالات:' : 'Try:'}
            </span>
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(isUrdu ? p.ur : p.en)}
                className="px-2.5 py-1 text-xs bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 transition-colors shrink-0 cursor-pointer"
              >
                {isUrdu ? p.ur : p.en}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#102019] transition-colors">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t.assistant_input_placeholder}
              className="flex-1 px-4 py-3 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 bg-stone-100 dark:bg-[#162c22] border border-transparent dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C3E2E]/20 dark:focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`p-3 rounded-xl transition-all flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px] ${
                inputMessage.trim() && !isLoading
                  ? 'bg-[#0C3E2E] hover:bg-[#0A3426] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-xs'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
