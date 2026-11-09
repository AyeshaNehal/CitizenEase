import { SOURCES, CURATED_FAQS, REQUIREMENTS } from '../data/catalog';
import { EvaluatedChecklistItem } from './rulesEngine';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: Array<{
    id: string;
    title: string;
    url?: string;
    issuing_authority: string;
    last_verified_on: string;
    verification_status: string;
  }>;
  needs_official_confirmation?: boolean;
  timestamp: string;
}

export interface IntentDiscoveryResult {
  service_slug: 'domicile_prc' | 'first_cnic' | null;
  confidence: number;
  clarifying_question_en: string;
  clarifying_question_ur: string;
  summary_en: string;
  summary_ur: string;
}

/**
 * Filter 13-digit CNIC patterns for citizen privacy protection
 */
export function sanitizeUserInput(input: string): { cleanedText: string; hadCnic: boolean } {
  const cnicRegexWithHyphen = /\b\d{5}-\d{7}-\d\b/g;
  const cnicRegex13Digits = /\b\d{13}\b/g;

  let hadCnic = false;
  let cleanedText = input;

  if (cnicRegexWithHyphen.test(input) || cnicRegex13Digits.test(input)) {
    hadCnic = true;
    cleanedText = cleanedText
      .replace(cnicRegexWithHyphen, '[CNIC REDACTED FOR PRIVACY]')
      .replace(cnicRegex13Digits, '[CNIC REDACTED FOR PRIVACY]');
  }

  return { cleanedText, hadCnic };
}

/**
 * AI Intent Discovery via Server Endpoint `/api/discover`
 */
export async function discoverServiceIntent(userQuery: string): Promise<IntentDiscoveryResult> {
  const query = userQuery.trim();

  try {
    const res = await fetch('/api/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: query })
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Network call to /api/discover failed, using local classifier:', err);
  }

  // Fast client-side fallback
  const qLower = query.toLowerCase();
  const isCnic = /cnic|شناختی کارڈ|18|eighteen|identity card|nadra|b-form|crc|smart card|nadra center|پاک آئی ڈی/.test(qLower);
  const isDomicile = /domicile|prc|ڈومیسائل|پی آر سی|residence certificate|belong to karachi|admission|quota|college|university|job|sindh|court|form c|dc office/.test(qLower);

  if (isCnic && !isDomicile) {
    return {
      service_slug: 'first_cnic',
      confidence: 0.95,
      clarifying_question_en: 'Are you turning 18 and converting your B-Form into a national identity card?',
      clarifying_question_ur: 'کیا آپ کی عمر 18 سال مکمل ہو رہی ہے اور بے فارم کو شناختی کارڈ میں تبدیل کروانا ہے؟',
      summary_en: 'Matched: First-Time Adult CNIC via NADRA.',
      summary_ur: 'متعلقہ سروس: نادرا کے تحت پہلا شناختی کارڈ۔'
    };
  }

  return {
    service_slug: 'domicile_prc',
    confidence: isDomicile ? 0.95 : 0.75,
    clarifying_question_en: 'Are you preparing for educational admission, government employment, or quota eligibility in Karachi?',
    clarifying_question_ur: 'کیا آپ کراچی میں کالج/یونیورسٹی داخلے، سرکاری نوکری یا کوٹہ کے لیے ڈومیسائل اور پی آر سی بنوانا چاہتے ہیں؟',
    summary_en: 'Matched: Karachi Domicile & PRC (Form C) via Deputy Commissioner Office.',
    summary_ur: 'متعلقہ سروس: ڈپٹی کمشنر آفس کے ذریعے کراچی ڈومیسائل اور پی آر سی۔'
  };
}

/**
 * Grounded Assistant via Server Endpoint `/api/assistant/chat`
 */
export async function askCitizenEaseAssistant(
  question: string,
  language: 'en' | 'ur',
  checklistItems: EvaluatedChecklistItem[] = []
): Promise<{
  answer: string;
  citations: Array<{ id: string; title: string; url?: string; issuing_authority: string; last_verified_on: string; verification_status: string }>;
  needs_official_confirmation: boolean;
}> {
  const { cleanedText, hadCnic } = sanitizeUserInput(question);

  try {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: cleanedText,
        language,
        checklist_items: checklistItems
      })
    });

    if (res.ok) {
      const data = await res.json();
      let answer = data.answer || '';
      if (hadCnic && !answer.includes('Privacy Notice')) {
        answer = (language === 'ur'
          ? '⚠️ نوٹس: اپنا 13 ہندسوں کا شناختی کارڈ نمبر کبھی بھی چیٹ میں درج نہ کریں۔ '
          : '⚠️ Privacy Notice: Never enter your 13-digit CNIC number. ') + answer;
      }
      return {
        answer,
        citations: data.citations || [],
        needs_official_confirmation: data.needs_official_confirmation ?? false
      };
    }
  } catch (err) {
    console.warn('Network call to /api/assistant/chat failed, using client fallback:', err);
  }

  // Client-side fallback if server is unreachable
  const isAskingFee = /fee|cost|challan|how much|price|روپیہ|پیسے|فیس|کتنے پیسے/.test(cleanedText.toLowerCase());
  const isAskingDomicileVsPrc = /difference|فرق|domicile vs prc|what is prc|what is domicile/.test(cleanedText.toLowerCase());

  if (isAskingDomicileVsPrc) {
    const faq = CURATED_FAQS[0];
    const src = SOURCES.S1;
    return {
      answer: language === 'ur' ? faq.answer_ur : faq.answer_en,
      citations: [{
        id: src.id,
        title: src.title,
        url: src.url,
        issuing_authority: src.issuing_authority,
        last_verified_on: src.last_verified_on,
        verification_status: src.verification_status
      }],
      needs_official_confirmation: false
    };
  }

  if (isAskingFee) {
    const faq = CURATED_FAQS[1];
    const src = SOURCES.S6;
    return {
      answer: language === 'ur' ? faq.answer_ur : faq.answer_en,
      citations: [{
        id: src.id,
        title: src.title,
        url: src.url,
        issuing_authority: src.issuing_authority,
        last_verified_on: src.last_verified_on,
        verification_status: src.verification_status
      }],
      needs_official_confirmation: true
    };
  }

  const defaultTextEn = `Based on verified Karachi administrative records: All Domicile and PRC applications require attested copies of your CNIC/B-Form, father's CNIC and Domicile, 4 passport photos with white background, residential electricity/gas bill, and a notarized residency affidavit. Students also need educational mark sheets and a school/college bonafide letter.`;
  const defaultTextUr = `تصدیق شدہ کراچی ریکارڈز کے مطابق: ڈومیسائل اور پی آر سی کے لیے امیدوار اور والد کا شناختی کارڈ، والد کا ڈومیسائل، 4 عدد تصاویر، رہائشی کے الیکٹرک یا گیس کا بل اور اشٹام پیپر پر حلف نامہ لازمی ہے۔ طلباء کے لیے میٹرک مارک شیٹ اور تعلیمی ادارے کا بونا فائیڈ لیٹر بھی درکار ہے۔`;

  return {
    answer: language === 'ur' ? defaultTextUr : defaultTextEn,
    citations: [
      {
        id: SOURCES.S2.id,
        title: SOURCES.S2.title,
        url: SOURCES.S2.url,
        issuing_authority: SOURCES.S2.issuing_authority,
        last_verified_on: SOURCES.S2.last_verified_on,
        verification_status: SOURCES.S2.verification_status
      }
    ],
    needs_official_confirmation: false
  };
}
