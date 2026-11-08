'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ChecklistResponse, ChecklistItem, UserStatus, AssistantChatResponse } from '@/lib/types';

export default function ChecklistPage() {
  const params = useParams();
  const checklistId = params.id as string;

  const [checklist, setChecklist] = useState<ChecklistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assistant slide-over state
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; citations?: any[]; warning?: boolean }>>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    if (!checklistId) return;
    api.getChecklist(checklistId)
      .then(setChecklist)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [checklistId]);

  const handleStatusChange = async (itemId: string, newStatus: UserStatus) => {
    if (!checklist) return;

    // Optimistic UI update
    const prevItems = [...checklist.items];
    const updated = checklist.items.map((it) =>
      it.item_id === itemId ? { ...it, user_status: newStatus } : it
    );
    setChecklist({ ...checklist, items: updated });

    try {
      const res = await api.updateChecklistItems(checklistId, [
        { item_id: itemId, user_status: newStatus }
      ]);
      setChecklist((curr) => curr ? { ...curr, items: res.items, readiness: res.readiness } : null);
    } catch (err) {
      console.error(err);
      // Revert on failure
      setChecklist({ ...checklist, items: prevItems });
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || sendingMsg) return;

    const userText = inputMsg;
    setInputMsg('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setSendingMsg(true);

    try {
      const res = await api.askAssistant('anonymous-session', checklistId, userText);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.answer,
          citations: res.citations,
          warning: res.needs_confirmation
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'AI assistant is currently in fallback mode. Please refer to verified checklist cards.',
          warning: true
        }
      ]);
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-sm text-gray-500">Loading your personalized checklist...</div>;
  }

  if (error || !checklist) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm space-y-3">
        <p className="font-semibold">Unable to load checklist</p>
        <p className="text-xs">{error || 'Checklist not found'}</p>
        <Link href="/services" className="inline-block text-xs text-primary underline">
          ← Start over
        </Link>
      </div>
    );
  }

  const { items, readiness, disclaimers } = checklist;
  const verifiedMandatory = items.filter((i) => i.verification_status === 'verified' && i.applicability === 'mandatory');
  const unverifiedItems = items.filter((i) => i.verification_status !== 'verified');
  const conditionalItems = items.filter((i) => i.applicability === 'conditional');

  return (
    <div className="space-y-8 py-4 relative">
      {/* Top Header & Readiness Score */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">Document Preparation Hub</span>
            <h1 className="text-2xl font-bold text-primary mt-1">Your Submission Checklist</h1>
            <p className="text-xs text-gray-500 mt-1">
              Mark each document you have ready. Only verified mandatory items affect your readiness score.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/offices"
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-colors text-center"
            >
              📍 Where to Submit
            </Link>
            <button
              onClick={() => setAssistantOpen(true)}
              className="px-4 py-2 bg-accent hover:bg-accent-light text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              💬 Ask AI Assistant
            </button>
          </div>
        </div>

        {/* Readiness Meter Card */}
        <div className="p-4 rounded-xl bg-surface-muted/50 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Readiness Score</span>
              <p className="text-xs text-gray-600">{readiness.explanation}</p>
            </div>
            <div className="text-right">
              {readiness.score !== null ? (
                <span className="text-3xl font-extrabold text-primary">{readiness.score}%</span>
              ) : (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded">
                  Pending Verification
                </span>
              )}
            </div>
          </div>

          {readiness.score !== null && (
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  readiness.score === 100 ? 'bg-emerald-600' : 'bg-primary'
                }`}
                style={{ width: `${readiness.score}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
            <span>Ready: {readiness.ready} of {readiness.total} required</span>
            <span>Preparation only • Not a guarantee of approval</span>
          </div>
        </div>
      </div>

      {/* Verified Mandatory Requirements Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <span>Mandatory Verified Requirements</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {verifiedMandatory.length}
            </span>
          </h2>
        </div>

        <div className="space-y-3">
          {verifiedMandatory.map((item) => (
            <ItemCard key={item.item_id} item={item} onStatusChange={handleStatusChange} />
          ))}
        </div>
      </section>

      {/* Conditional Requirements Section */}
      {conditionalItems.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <span>Conditional Requirements (District-Specific)</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {conditionalItems.length}
            </span>
          </h2>
          <div className="space-y-3">
            {conditionalItems.map((item) => (
              <ItemCard key={item.item_id} item={item} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </section>
      )}

      {/* Unverified Section (Excluded from score denominator) */}
      {unverifiedItems.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-gray-200">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              ⚠️ Items Awaiting Official Verification ({unverifiedItems.length})
            </span>
            <p>
              These documents are commonly cited in secondary sources or local practices but are not yet confirmed against primary official gazettes. They are shown for preparation, but not calculated into your score.
            </p>
          </div>
          <div className="space-y-3">
            {unverifiedItems.map((item) => (
              <ItemCard key={item.item_id} item={item} onStatusChange={handleStatusChange} />
            ))}
          </div>
        </section>
      )}

      {/* Slide-over Assistant Drawer */}
      {assistantOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-primary text-white">
              <div>
                <h3 className="font-bold text-sm">CitizenEase Assistant</h3>
                <span className="text-[11px] text-gray-200">Grounded in verified court & gazette rules</span>
              </div>
              <button
                onClick={() => setAssistantOpen(false)}
                className="text-white hover:text-gray-300 text-sm font-bold p-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              <div className="p-3 bg-gray-100 rounded-xl text-gray-700">
                👋 Hello! I can explain why specific documents are needed, clarify Domicile vs PRC differences, or help you locate submission offices. I will never invent fees or make eligibility promises.
              </div>

              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl space-y-1.5 ${
                    msg.sender === 'user'
                      ? 'ml-8 bg-primary text-white'
                      : 'mr-8 bg-gray-50 border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-1.5 border-t border-gray-200/50 flex flex-wrap gap-1">
                      {msg.citations.map((c, cIdx) => (
                        <span key={cIdx} className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-gray-300 text-gray-600">
                          📖 {c.title}
                        </span>
                      ))}
                    </div>
                  )}
                  {msg.warning && (
                    <div className="text-[10px] text-amber-700 font-semibold">
                      ⚠️ Requires official office confirmation
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ask about documents, PRC rules, or offices..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={sendingMsg}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                {sendingMsg ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, onStatusChange }: { item: ChecklistItem; onStatusChange: (id: string, s: UserStatus) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-primary">{item.title}</h3>
            {item.verification_status === 'verified' ? (
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                Verified
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-800">
                Unverified
              </span>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            {expanded ? 'Hide explanation' : 'Why is this needed?'}
          </button>
        </div>

        {/* User status toggle buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => onStatusChange(item.item_id, 'have')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              item.user_status === 'have'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✓ Have
          </button>
          <button
            onClick={() => onStatusChange(item.item_id, 'missing')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              item.user_status === 'missing'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✗ Missing
          </button>
          <button
            onClick={() => onStatusChange(item.item_id, 'not_sure')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              item.user_status === 'not_sure'
                ? 'bg-gray-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ?
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-3 bg-surface-muted/50 rounded-lg text-xs space-y-2 border border-gray-100">
          <p className="text-gray-700 leading-relaxed">{item.why_needed}</p>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-1">
            <span>Source:</span>
            {item.source.url ? (
              <a href={item.source.url} target="_blank" rel="noreferrer" className="text-accent underline font-medium">
                {item.source.title}
              </a>
            ) : (
              <span className="font-medium text-gray-700">{item.source.title}</span>
            )}
            <span>•</span>
            <span>Verified: {item.source.last_verified_on || '2026-11-08'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
