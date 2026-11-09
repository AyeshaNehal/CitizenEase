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
  piiDetected?: boolean;
}

export interface IntentDiscoveryResult {
  service_slug: 'domicile_prc' | 'first_cnic' | 'passport' | 'frc' | null;
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
  const isPassport = /passport|پاسپورٹ|mrp|epassport|dgip|travel|immigration|urgent passport/.test(qLower);
  const isFrc = /frc|family registration|family tree|شجرہ|خاندانی|ایف آر سی|by birth|by marriage/.test(qLower);
  const isCnic = /cnic|شناختی کارڈ|18|eighteen|identity card|nadra|b-form|crc|smart card|nadra center|پاک آئی ڈی/.test(qLower);
  const isDomicile = /domicile|prc|ڈومیسائل|پی آر سی|residence certificate|belong to karachi|admission|quota|college|university|job|sindh|court|form c|dc office/.test(qLower);

  if (isPassport) {
    return {
      service_slug: 'passport',
      confidence: 0.96,
      clarifying_question_en: 'Are you applying for a fresh passport, renewing an expired booklet, or replacing a lost passport?',
      clarifying_question_ur: 'کیا آپ نیا پاسپورٹ بنوا رہے ہیں، تجدید کروانی ہے، یا گمشدہ پاسپورٹ دوبارہ حاصل کرنا ہے؟',
      summary_en: 'Matched: Machine Readable Passport (MRP / e-Passport) via DGI&P.',
      summary_ur: 'متعلقہ سروس: امیگریشن و پاسپورٹ کے تحت مشین ریڈ ایبل پاسپورٹ۔'
    };
  }

  if (isFrc) {
    return {
      service_slug: 'frc',
      confidence: 0.96,
      clarifying_question_en: 'Do you need FRC By Birth (with parents & siblings) or FRC By Marriage (with spouse & children)?',
      clarifying_question_ur: 'کیا آپ کو پیدائشی خاندان (والدین و بہن بھائی) یا ازدواجی خاندان (اہلیہ و بچے) کا سرٹیفکیٹ درکار ہے؟',
      summary_en: 'Matched: Family Registration Certificate (FRC) via NADRA.',
      summary_ur: 'متعلقہ سروس: نادرا کے تحت فیملی رجسٹریشن سرٹیفکیٹ۔'
    };
  }

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
  const qLower = cleanedText.toLowerCase();
  const isAskingFee = /fee|cost|challan|how much|price|روپیہ|پیسے|فیس|کتنے پیسے/.test(qLower);
  const isAskingDomicileVsPrc = /difference|فرق|domicile vs prc|what is prc|what is domicile/.test(qLower);
  const isAskingPassport = /passport|پاسپورٹ|renewal/.test(qLower);
  const isAskingFrc = /frc|family registration|شجرہ|ایف آر سی/.test(qLower);

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

  if (isAskingPassport) {
    const faq = CURATED_FAQS.find(f => f.id === 'FAQ5') || CURATED_FAQS[0];
    const src = SOURCES.S7 || SOURCES.S1;
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

  if (isAskingFrc) {
    const faq = CURATED_FAQS.find(f => f.id === 'FAQ6') || CURATED_FAQS[0];
    const src = SOURCES.S8 || SOURCES.S1;
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

  const defaultTextEn = `Based on verified administrative records: Always carry your original valid CNIC / Smart Card, parent/guardian documents, and paid official fee receipts before visiting your designated Karachi office counter.`;
  const defaultTextUr = `تصدیق شدہ سرکاری ریکارڈز کے مطابق: متعلقہ کاؤنٹر پر جانے سے پہلے اپنا اصل درست شناختی کارڈ، خاندانی دستاویزات اور سرکاری فیس کی اصل رسید ہمراہ رکھنا لازمی ہے۔`;

  return {
    answer: language === 'ur' ? defaultTextUr : defaultTextEn,
    citations: [
      {
        id: SOURCES.S1.id,
        title: SOURCES.S1.title,
        url: SOURCES.S1.url,
        issuing_authority: SOURCES.S1.issuing_authority,
        last_verified_on: SOURCES.S1.last_verified_on,
        verification_status: SOURCES.S1.verification_status
      }
    ],
    needs_official_confirmation: false
  };
}
