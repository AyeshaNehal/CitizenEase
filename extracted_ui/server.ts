import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { SOURCES, CURATED_FAQS, REQUIREMENTS } from './src/data/catalog.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI on the server
const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  genAI = new GoogleGenAI({ apiKey });
}

/**
 * Filter 13-digit CNIC patterns for citizen privacy protection
 */
function sanitizeInput(text: string): { cleanedText: string; hadCnic: boolean } {
  const cnicWithHyphen = /\b\d{5}-\d{7}-\d\b/g;
  const cnic13Digits = /\b\d{13}\b/g;

  let hadCnic = false;
  let cleanedText = text;

  if (cnicWithHyphen.test(text) || cnic13Digits.test(text)) {
    hadCnic = true;
    cleanedText = cleanedText
      .replace(cnicWithHyphen, '[CNIC REDACTED FOR PRIVACY]')
      .replace(cnic13Digits, '[CNIC REDACTED FOR PRIVACY]');
  }

  return { cleanedText, hadCnic };
}

/**
 * Build grounding context block
 */
function buildContextBlock(checklistItems: any[] = []): { text: string; recordMap: Record<string, any> } {
  const recordMap: Record<string, any> = {};
  let contextText = '--- VERIFIED EVIDENCE & RULES ARCHIVE ---\n';

  Object.values(SOURCES).forEach(s => {
    recordMap[s.id] = s;
    contextText += `[Record ${s.id}] Title: ${s.title} | Authority: ${s.issuing_authority} | Status: ${s.verification_status} | Date: ${s.last_verified_on} | Notes: ${s.notes}\n`;
  });

  CURATED_FAQS.forEach(f => {
    recordMap[f.id] = f;
    contextText += `[Record ${f.id}] Q: ${f.question_en} | A: ${f.answer_en} | Verified: ${f.verified}\n`;
  });

  if (Array.isArray(checklistItems) && checklistItems.length > 0) {
    contextText += '--- APPLICANT CHECKLIST ITEMS ---\n';
    checklistItems.forEach(item => {
      recordMap[item.requirement_id] = item;
      contextText += `[Record ${item.requirement_id}] Code: ${item.code} | Name: ${item.title_en} | Why Needed: ${item.why_needed_en} | Applicability: ${item.applicability} | Status: ${item.verification_status}\n`;
    });
  }

  return { text: contextText, recordMap };
}

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// AI Service Intent Discovery
app.post('/api/discover', async (req: Request, res: Response) => {
  try {
    const { text, language = 'en' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: { code: 'validation_error', message: 'Missing text in body' } });
      return;
    }

    const trimmed = text.trim();

    // Fast deterministic check
    const query = trimmed.toLowerCase();
    const isCnic = /cnic|شناختی کارڈ|18|eighteen|identity card|nadra|b-form|crc|smart card|nadra center|پاک آئی ڈی/.test(query);
    const isDomicile = /domicile|prc|ڈومیسائل|پی آر سی|residence certificate|belong to karachi|admission|quota|college|university|job|sindh|court|form c|dc office/.test(query);

    if (genAI) {
      try {
        const prompt = `Classify this citizen query into one of two services: "domicile_prc" or "first_cnic".
Query: "${trimmed}"

Return valid JSON strictly in this format:
{
  "service_slug": "domicile_prc" | "first_cnic",
  "confidence": number between 0 and 1,
  "clarifying_question_en": "short clarifying question in English",
  "clarifying_question_ur": "short clarifying question in Urdu",
  "summary_en": "one sentence explanation in English",
  "summary_ur": "one sentence explanation in Urdu"
}`;

        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        if (parsed.service_slug) {
          res.json(parsed);
          return;
        }
      } catch (err) {
        console.warn('Gemini discovery fallback:', err);
      }
    }

    // Fallback classification
    if (isCnic && !isDomicile) {
      res.json({
        service_slug: 'first_cnic',
        confidence: 0.95,
        clarifying_question_en: 'Are you turning 18 and converting your B-Form into a national identity card?',
        clarifying_question_ur: 'کیا آپ کی عمر 18 سال مکمل ہو رہی ہے اور بے فارم کو شناختی کارڈ میں تبدیل کروانا ہے؟',
        summary_en: 'Matched: First-Time Adult CNIC via NADRA.',
        summary_ur: 'متعلقہ سروس: نادرا کے تحت پہلا شناختی کارڈ۔'
      });
      return;
    }

    res.json({
      service_slug: 'domicile_prc',
      confidence: isDomicile ? 0.95 : 0.75,
      clarifying_question_en: 'Are you preparing for educational admission, government employment, or quota eligibility in Karachi?',
      clarifying_question_ur: 'کیا آپ کراچی میں کالج/یونیورسٹی داخلے، سرکاری نوکری یا کوٹہ کے لیے ڈومیسائل اور پی آر سی بنوانا چاہتے ہیں؟',
      summary_en: 'Matched: Karachi Domicile & PRC (Form C) via Deputy Commissioner Office.',
      summary_ur: 'متعلقہ سروس: ڈپٹی کمشنر آفس کے ذریعے کراچی ڈومیسائل اور پی آر سی۔'
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to discover intent' } });
  }
});

// Grounded AI Assistant Chat Endpoint
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { question, language = 'en', checklist_items = [] } = req.body;
    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: { code: 'validation_error', message: 'Missing question in body' } });
      return;
    }

    const { cleanedText, hadCnic } = sanitizeInput(question);
    const { text: contextBlock, recordMap } = buildContextBlock(checklist_items);

    if (genAI) {
      try {
        const prompt = `You are CitizenEase Assistant, a civic preparation guide for citizens in Karachi, Pakistan.
You are NOT a government official and NOT a lawyer.
Answer the citizen's inquiry in ${language === 'ur' ? 'Urdu' : 'English'}.

CRITICAL RULES:
1. Answer ONLY from facts in CONTEXT below.
2. NEVER invent fees, office timings, phone numbers, or processing deadlines.
3. If asked about Domicile or PRC fee: state that fee amounts are NOT officially verified online and must be confirmed at the DC office challan counter.
4. If asked about legal eligibility: clarify that the Deputy Commissioner or NADRA decides legal eligibility.
5. If information is not in CONTEXT, say: "This is not in the verified information I have. Please confirm directly with the DC / NADRA office."
6. Always output valid JSON only in this exact schema:
{
  "answer": "string response",
  "used_record_ids": ["S1", "FAQ1"],
  "needs_official_confirmation": boolean
}

CONTEXT:
${contextBlock}

USER QUESTION:
${cleanedText}`;

        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');

        // Build verified citations on the server from valid record keys
        const validCitations: any[] = [];
        if (Array.isArray(parsed.used_record_ids)) {
          parsed.used_record_ids.forEach((id: string) => {
            if (recordMap[id]) {
              const r = recordMap[id];
              validCitations.push({
                id: r.id || id,
                title: r.title || r.title_en || 'Official Administrative Record',
                url: r.url,
                issuing_authority: r.issuing_authority || 'Sindh Government / NADRA',
                last_verified_on: r.last_verified_on || '2026-11-01',
                verification_status: r.verification_status || 'verified'
              });
            }
          });
        }

        let finalAnswer = parsed.answer || '';
        if (hadCnic) {
          finalAnswer = (language === 'ur'
            ? '⚠️ نوٹس: اپنا 13 ہندسوں کا شناختی کارڈ نمبر کبھی بھی چیٹ میں درج نہ کریں۔ '
            : '⚠️ Privacy Notice: Never enter your 13-digit CNIC number. ') + finalAnswer;
        }

        res.json({
          answer: finalAnswer,
          citations: validCitations.length > 0 ? validCitations : [
            {
              id: 'S1',
              title: SOURCES.S1.title,
              url: SOURCES.S1.url,
              issuing_authority: SOURCES.S1.issuing_authority,
              last_verified_on: SOURCES.S1.last_verified_on,
              verification_status: SOURCES.S1.verification_status
            }
          ],
          needs_official_confirmation: parsed.needs_official_confirmation ?? false
        });
        return;
      } catch (err) {
        console.warn('Gemini chat error, using server fallback:', err);
      }
    }

    // Robust deterministic server fallback
    const qLower = cleanedText.toLowerCase();
    const isAskingFee = /fee|cost|challan|how much|price|روپیہ|پیسے|فیس|کتنے پیسے/.test(qLower);
    const isAskingDomicileVsPrc = /difference|فرق|domicile vs prc|what is prc|what is domicile/.test(qLower);

    if (isAskingDomicileVsPrc) {
      const faq = CURATED_FAQS[0];
      const src = SOURCES.S1;
      res.json({
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
      });
      return;
    }

    if (isAskingFee) {
      const faq = CURATED_FAQS[1];
      const src = SOURCES.S6;
      res.json({
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
      });
      return;
    }

    if (/keamari|کیماڑی|west|ویسٹ|bifurcat|transfer|نیا ضلع/.test(qLower)) {
      const faq = CURATED_FAQS[3];
      const src = SOURCES.S5;
      res.json({
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
      });
      return;
    }

    if (/pakid|app|mobile|online|18|b-form|بے فارم/.test(qLower)) {
      const faq = CURATED_FAQS[2];
      const src = SOURCES.S4;
      res.json({
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
      });
      return;
    }

    const defaultTextEn = `Based on verified Karachi administrative records: All Domicile and PRC applications require attested copies of your CNIC/B-Form, father's CNIC and Domicile, 4 passport photos with white background, residential electricity/gas bill, and a notarized residency affidavit. Students also need educational mark sheets and a school/college bonafide letter.`;
    const defaultTextUr = `تصدیق شدہ کراچی ریکارڈز کے مطابق: ڈومیسائل اور پی آر سی کے لیے امیدوار اور والد کا شناختی کارڈ، والد کا ڈومیسائل، 4 عدد تصاویر، رہائشی کے الیکٹرک یا گیس کا بل اور اشٹام پیپر پر حلف نامہ لازمی ہے۔ طلباء کے لیے میٹرک مارک شیٹ اور تعلیمی ادارے کا بونا فائیڈ لیٹر بھی درکار ہے۔`;

    res.json({
      answer: language === 'ur' ? defaultTextUr : defaultTextEn,
      citations: [
        {
          id: SOURCES.S2.id,
          title: SOURCES.S2.title,
          url: SOURCES.S2.url,
          issuing_authority: SOURCES.S2.issuing_authority,
          last_verified_on: SOURCES.S2.last_verified_on,
          verification_status: SOURCES.S2.verification_status
        },
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
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to process chat' } });
  }
});

// Mount Vite or serve static assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CitizenEase server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
