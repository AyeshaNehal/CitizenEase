export type VerificationStatus = 'verified' | 'unverified' | 'outdated' | 'conflicting';
export type Applicability = 'mandatory' | 'conditional' | 'optional';
export type UserStatus = 'have' | 'missing' | 'not_sure';

export interface ServiceListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export interface ApplicationType {
  id: string;
  slug: string;
  title_en: string;
  title_ur: string;
}

export interface ServiceDetail {
  id: string;
  slug: string;
  title_en: string;
  title_ur: string;
  description_en: string;
  description_ur: string;
  keywords: string[];
}

export interface SourceSummary {
  verified_count: number;
  unverified_count: number;
  last_verified_on?: string;
}

export interface ServiceDetailResponse {
  service: ServiceDetail;
  application_types: ApplicationType[];
  source_summary: SourceSummary;
}

export interface QuestionOption {
  value: any;
  label_en: string;
  label_ur: string;
  order_index?: number;
}

export interface Question {
  key: string;
  text_en: string;
  text_ur: string;
  input_type: 'single_choice' | 'boolean' | 'district';
  order_index: number;
  required: boolean;
  options: QuestionOption[];
}

export interface Progress {
  current_step: number;
  total_estimated: number;
}

export interface SourceRef {
  title: string;
  url?: string;
  last_verified_on?: string;
}

export interface ChecklistItem {
  item_id: string;
  code: string;
  title: string;
  why_needed: string;
  applicability: Applicability;
  verification_status: VerificationStatus;
  user_status: UserStatus;
  source: SourceRef;
}

export interface ReadinessScore {
  score: number | null;
  ready: number;
  total: number;
  missing: string[];
  conditional: string[];
  unverified: string[];
  explanation: string;
  is_guarantee: boolean;
}

export interface ChecklistResponse {
  checklist_id: string;
  items: ChecklistItem[];
  readiness: ReadinessScore;
  disclaimers: string[];
}

export interface Office {
  id: string;
  name: string;
  office_type: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  services: string[];
  source_id: string;
  verification_status: VerificationStatus;
  last_verified_on: string;
  hours_note?: string;
  notes?: string;
}

export interface AssistantChatResponse {
  answer: string;
  citations: Array<{
    source_id: string;
    title: string;
    url?: string;
    last_verified_on?: string;
  }>;
  needs_confirmation: boolean;
  suggested_actions: string[];
}
