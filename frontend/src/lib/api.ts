import {
  ServiceListItem,
  ServiceDetailResponse,
  Question,
  Progress,
  ChecklistResponse,
  Office,
  AssistantChatResponse
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const errorJson = await res.json();
      errorDetail = errorJson.error?.message || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  getServices: (lang: string = 'en') =>
    fetchJson<ServiceListItem[]>(`/services?lang=${lang}`),

  getServiceDetail: (slug: string) =>
    fetchJson<ServiceDetailResponse>(`/services/${slug}`),

  discoverIntent: (text: string, language: string = 'en') =>
    fetchJson<{ service_slug: string | null; confidence: number; clarifying_question: string | null }>('/discover', {
      method: 'POST',
      body: JSON.stringify({ text, language }),
    }),

  startQuestionnaire: (serviceSlug: string, language: string = 'en') =>
    fetchJson<{ session_id: string; question: Question | null; progress: Progress }>('/questionnaire/start', {
      method: 'POST',
      body: JSON.stringify({ service_slug: serviceSlug, language }),
    }),

  answerQuestion: (sessionId: string, questionKey: string, answer: any) =>
    fetchJson<{ next_question: Question | null; done: boolean; progress: Progress; visible_keys: string[] }>('/questionnaire/answer', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, question_key: questionKey, answer }),
    }),

  generateChecklist: (sessionId: string) =>
    fetchJson<ChecklistResponse>('/checklist/generate', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    }),

  getChecklist: (checklistId: string) =>
    fetchJson<ChecklistResponse>(`/checklist/${checklistId}`),

  updateChecklistItems: (checklistId: string, updates: Array<{ item_id: string; user_status: string }>) =>
    fetchJson<{ items: any[]; readiness: any }>(`/checklist/${checklistId}/items`, {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    }),

  askAssistant: (sessionId: string, checklistId: string | undefined, message: string, language: string = 'en') =>
    fetchJson<AssistantChatResponse>('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, checklist_id: checklistId, message, language }),
    }),

  getOffices: (service?: string, district?: string) => {
    const params = new URLSearchParams();
    if (service) params.append('service', service);
    if (district) params.append('district', district);
    return fetchJson<Office[]>(`/offices?${params.toString()}`);
  },

  getSources: (serviceSlug: string) =>
    fetchJson<any[]>(`/sources/${serviceSlug}`),
};
