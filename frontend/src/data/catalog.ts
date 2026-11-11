export interface Source {
  id: string;
  title: string;
  url?: string;
  issuing_authority: string;
  source_type: 'official_web' | 'official_document' | 'office_visit' | 'court_ruling' | 'news_secondary';
  verification_status: 'verified' | 'unverified' | 'outdated' | 'conflicting';
  last_verified_on: string; // ISO date
  verified_by: string;
  applicable_district?: string | null;
  notes: string;
  limitations?: string;
}

export type ServiceSlug = 'domicile_prc' | 'first_cnic' | 'passport' | 'frc' | 'b_form' | 'birth_certificate' | 'smart_card';

export interface ServicePrerequisite {
  slug: ServiceSlug;
  title_en: string;
  title_ur: string;
  note_en: string;
  note_ur: string;
}

export interface Requirement {
  id: string;
  code: string;
  service_slug: ServiceSlug;
  service_slugs?: ServiceSlug[];
  application_type?: 'both' | 'domicile_only' | 'prc_only' | 'first_cnic';
  title_en: string;
  title_ur: string;
  why_needed_en: string;
  why_needed_ur: string;
  kind: 'document' | 'step';
  verification_status: 'verified' | 'unverified';
  source_id: string;
  last_verified_on: string;
  notes?: string;
}

export interface EligibilityRule {
  id: string;
  requirement_id: string;
  applicability: 'mandatory' | 'conditional' | 'optional';
  // Condition format matching blueprint: all, any, eq, neq, in
  condition?: {
    all?: Array<{ key: string; op: 'eq' | 'neq' | 'in'; value: any }>;
    any?: Array<{ key: string; op: 'eq' | 'neq' | 'in'; value: any }>;
  };
  district?: string; // If set, applies only to that district
  priority: number;
  is_active: boolean;
}

export interface Office {
  id: string;
  name_en: string;
  name_ur: string;
  office_type: 'dc_office' | 'nadra_centre' | 'passport_office';
  district: string; // e.g. Karachi South, Karachi East, etc.
  district_key: string;
  address_en: string;
  address_ur: string;
  lat: number;
  lng: number;
  services: string[];
  verification_status: 'verified' | 'unverified';
  last_verified_on: string;
  hours_note_en: string;
  hours_note_ur: string;
  notes_en: string;
  notes_ur: string;
  phone?: string;
}

export interface QuestionOption {
  value: string | boolean;
  label_en: string;
  label_ur: string;
  description_en?: string;
  description_ur?: string;
}

export interface QuestionCondition {
  depends_on_key: string;
  operator: 'eq' | 'neq' | 'in';
  value: any;
}

export interface Question {
  id: string;
  service_slug: ServiceSlug;
  key: string;
  order_index: number;
  text_en: string;
  text_ur: string;
  hint_en?: string;
  hint_ur?: string;
  input_type: 'single_choice' | 'boolean' | 'district';
  options: QuestionOption[];
  condition?: QuestionCondition;
  required: boolean;
}

export interface ServiceDetail {
  slug: ServiceSlug;
  title_en: string;
  title_ur: string;
  short_desc_en: string;
  short_desc_ur: string;
  full_desc_en: string;
  full_desc_ur: string;
  authority_en: string;
  authority_ur: string;
  court_distinction_en?: string;
  court_distinction_ur?: string;
  keywords: string[];
  official_fee_note_en: string;
  official_fee_note_ur: string;
  prerequisites?: ServicePrerequisite[];
}

// ---------------------- SEEDED CATALOG DATA ----------------------

export const SOURCES: Record<string, Source> = {
  S1: {
    id: 'S1',
    title: 'Sindh High Court Judgment (PRC Rules 1971 vs Citizenship Act 1951)',
    url: 'https://caselaw.shc.gov.pk',
    issuing_authority: 'High Court of Sindh, Karachi',
    source_type: 'court_ruling',
    verification_status: 'verified',
    last_verified_on: '2026-10-15',
    verified_by: 'CitizenEase Legal Research Team',
    notes: 'Landmark judgment settling that Domicile is governed under Federal Pakistan Citizenship Act 1951, while PRC is governed by Sindh Permanent Residence Certificate Rules 1971. Educational and employment quotas in Sindh strictly require Form-C PRC.',
    limitations: 'Applies to Sindh Province; does not determine individual applicant residence eligibility.'
  },
  S2: {
    id: 'S2',
    title: 'Office Notice Board & Procedure Order (DC Karachi South)',
    issuing_authority: 'Deputy Commissioner Office, District South, Karachi',
    source_type: 'office_visit',
    verification_status: 'verified',
    last_verified_on: '2026-11-01',
    verified_by: 'On-site Field Inspection',
    notes: 'Physical notice board photographed outside Domicile Branch, DC South Karachi. Specifies photo counts, attested CNIC copies, and utility bill requirements.',
    limitations: 'Subject to unannounced local DC administrative order amendments.'
  },
  S3: {
    id: 'S3',
    title: 'Sindh Cabinet Committee on Domicile Scrutiny Notification',
    issuing_authority: 'Services, General Administration and Coordination Department, Sindh',
    source_type: 'official_document',
    verification_status: 'verified',
    last_verified_on: '2026-09-20',
    verified_by: 'CitizenEase Legal Team',
    notes: 'Orders strict scrutiny of residency proofs and mandates verification of parents domicile to curb bogus documentation across Karachi districts.'
  },
  S4: {
    id: 'S4',
    title: 'NADRA PakID Citizen Portal Guidelines (CNIC Issuance Rules)',
    url: 'https://id.nadra.gov.pk',
    issuing_authority: 'NADRA (National Database & Registration Authority)',
    source_type: 'official_web',
    verification_status: 'verified',
    last_verified_on: '2026-11-04',
    verified_by: 'Digital Verification',
    notes: 'First-time CNIC applicant aged 18+ requires Smart B-Form or CRC. If biometrics were never captured on B-Form, the applicant must attend a physical NADRA Mega/Registration Centre with a blood relative witness.'
  },
  S5: {
    id: 'S5',
    title: 'District Keamari Transition Advisory (Unverified Administrative Note)',
    issuing_authority: 'DC Keamari Administrative Branch',
    source_type: 'office_visit',
    verification_status: 'unverified',
    last_verified_on: '2026-10-10',
    verified_by: 'Citizen Reporter lead',
    notes: 'Keamari residents carved out from Karachi West reported differing stamp fee counter policies. Marked UNVERIFIED pending official Gazette confirmation.',
    limitations: 'Unverified. Confirm with DC Keamari office directly.'
  },
  S6: {
    id: 'S6',
    title: 'Bank Challan & Stamp Duty Rates (Secondary News Reports)',
    url: 'https://sindh.gov.pk',
    issuing_authority: 'Sindh Revenue & Home Department',
    source_type: 'news_secondary',
    verification_status: 'unverified',
    last_verified_on: '2026-08-14',
    verified_by: 'News Aggregation',
    notes: 'Challan fee amounts reported between Rs. 200 to Rs. 500 across various media outlets. Flagged unverified; CitizenEase does not quote exact fee numbers without verified challan receipts.',
    limitations: 'Must confirm exact current bank branch challan voucher at the DC counter.'
  },
  S7: {
    id: 'S7',
    title: 'DGI&P Official Passport Regulations & Citizen Manual',
    url: 'https://passport.gov.pk',
    issuing_authority: 'Directorate General Immigration & Passports (DGI&P)',
    source_type: 'official_web',
    verification_status: 'verified',
    last_verified_on: '2026-11-08',
    verified_by: 'CitizenEase Verification Team',
    notes: 'Prescribes mandatory valid original CNIC/Smart Card, previous passport (if renewal), paid bank/app challan receipt, and parent presence for applicants under 18.'
  },
  S8: {
    id: 'S8',
    title: 'NADRA Citizen Registration Rules (FRC Categories & Documentation)',
    url: 'https://www.nadra.gov.pk',
    issuing_authority: 'National Database & Registration Authority (NADRA)',
    source_type: 'official_web',
    verification_status: 'verified',
    last_verified_on: '2026-11-08',
    verified_by: 'CitizenEase Legal Review',
    notes: 'Official guidelines for FRC By Birth (parents & siblings) and FRC By Marriage (spouse & children). All family members must be registered in the NADRA database.'
  }
};

export const SERVICES: Record<string, ServiceDetail> = {
  domicile_prc: {
    slug: 'domicile_prc',
    title_en: 'Domicile & PRC (Permanent Residence Certificate)',
    title_ur: 'ڈومیسائل اور پی آر سی (مستقل رہائشی سرٹیفکیٹ)',
    short_desc_en: 'Issued by your Karachi District Deputy Commissioner (DC) office for government jobs, college/university admissions, and provincial quotas.',
    short_desc_ur: 'سرکاری ملازمتوں، میڈیکل و انجینئرنگ کالج داخلوں اور کوٹہ کے لیے متعلقہ ڈپٹی کمشنر آفس سے جاری کردہ دستاویزی ثبوت۔',
    full_desc_en: 'In Sindh, Domicile and PRC (Permanent Residence Certificate) serve distinct legal purposes under Pakistan Law. PRC Form-C is mandatory for provincial admissions and public sector job quotas, while Domicile certifies long-term citizenship domicile.',
    full_desc_ur: 'سندھ میں ڈومیسائل اور پی آر سی الگ الگ قانونی دستاویزات ہیں۔ سندھ ہائی کورٹ کے فیصلے کے مطابق تعلیمی داخلوں اور نوکریوں کے کوٹے کے لیے پی آر سی فارم سی لازمی ہے۔',
    authority_en: 'Deputy Commissioner (DC) Office of your Karachi District',
    authority_ur: 'آپ کے متعلقہ کراچی ضلع کا ڈپٹی کمشنر (ڈی سی) آفس',
    court_distinction_en: 'Sindh High Court Ruling: Domicile is issued under the Pakistan Citizenship Act 1951, while PRC is issued under the Sindh Permanent Residence Certificate Rules 1971. Both are usually processed concurrently at the DC office.',
    court_distinction_ur: 'سندھ ہائی کورٹ کا فیصلہ: ڈومیسائل پاکستان سٹیزن شپ ایکٹ 1951 کے تحت بنتا ہے جبکہ پی آر سی سندھ رولز 1971 کے تحت۔ دونوں ایک ساتھ پروسیس ہوتے ہیں۔',
    keywords: ['domicile', 'prc', 'permanent residence', 'dc office', 'karachi', 'quota', 'admission', 'form c', 'form d'],
    official_fee_note_en: 'Fee is paid via National Bank / Sindh Bank treasury challan at the DC office. Amounts are subject to provincial fiscal notifications. Confirm exact challan amount on-site.',
    official_fee_note_ur: 'فیس نیشنل بینک یا سندھ بینک کے چالان کے ذریعے ادا کی جاتی ہے۔ درست رقم ڈی سی آفس کے چالان کاؤنٹر سے معلوم کریں۔'
  },
  first_cnic: {
    slug: 'first_cnic',
    title_en: 'First-Time CNIC (National Identity Card)',
    title_ur: 'پہلی بار شناختی کارڈ (این آئی سی / این آر سی)',
    short_desc_en: 'Issued by NADRA upon reaching 18 years of age. Mandatory for banking, SIM cards, voting, and legal citizenship identity.',
    short_desc_ur: '18 سال کی عمر ہونے پر نادرا سے جاری ہونے والا قومی شناختی کارڈ۔ بینک، سم، ووٹ اور قانونی شناخت کے لیے لازمی۔',
    full_desc_en: 'When a citizen turns 18, their Child Registration Certificate (B-Form) must be converted into a Computerized National Identity Card. Under updated 2025/2026 regulations, applicants must attend with a registered blood relative unless biometrics were previously linked.',
    full_desc_ur: '18 سال کی عمر ہونے پر بے فارم کے بجائے کمپیوٹرائزڈ شناختی کارڈ جاری کیا جاتا ہے۔ خونی رشتے دار (والد/والدہ/بہن بھائی) کی موجودگی ضروری ہے۔',
    authority_en: 'NADRA (National Database & Registration Authority)',
    authority_ur: 'نادرا (نیشنل ڈیٹا بیس اینڈ رجسٹریشن اتھارٹی)',
    keywords: ['cnic', 'nadra', 'b-form', 'identity card', 'smart card', 'crc', '18 years', 'pakid'],
    official_fee_note_en: 'Normal track is free for first-time applicants in standard timeline (approx 31 days). Urgent and Executive services incur NADRA tier fees payable at counter.',
    official_fee_note_ur: 'پہلی بار بنوانے پر نارمل سروس مفت ہوتی ہے (تقریباً 31 دن)۔ ارجنٹ یا ایگزیکٹو کے لیے نادرا کاؤنٹر پر فیس لاگو ہوتی ہے۔'
  },
  passport: {
    slug: 'passport',
    title_en: 'Machine Readable Passport (MRP / e-Passport)',
    title_ur: 'مشین ریڈ ایبل پاسپورٹ (ای پاسپورٹ)',
    short_desc_en: 'Official international travel and identity document issued by the Directorate General of Immigration & Passports (DGI&P).',
    short_desc_ur: 'بیرون ملک سفر اور بین الاقوامی شناخت کے لیے ڈائریکٹوریٹ جنرل امیگریشن اینڈ پاسپورٹس سے جاری کردہ سرکاری دستاویز۔',
    full_desc_en: 'Passports are issued to Pakistani citizens holding a valid Computerized National Identity Card (CNIC/NICOP) or Smart B-Form for minors. Processed at Regional Passport Offices (RPOs) or Executive Passport Offices across Karachi.',
    full_desc_ur: 'درست شناختی کارڈ یا بچوں کے لیے سمارٹ بے فارم کی بنیاد پر پاسپورٹ جاری کیا جاتا ہے۔ کراچی کے ریجنل اور ایگزیکٹو پاسپورٹ دفاتر سے حاصل کیا جا سکتا ہے۔',
    authority_en: 'Regional Passport Offices (RPO) / DGI&P Ministry of Interior',
    authority_ur: 'ریجنل پاسپورٹ آفسز کراچی / وزارت داخلہ',
    keywords: ['passport', 'mrp', 'epassport', 'immigration', 'dgip', 'travel', 'visa', 'renewal'],
    official_fee_note_en: 'Payable via National Bank of Pakistan branches or online through the official Passport Fee Asaan app (36/72/100 pages, 5 or 10 years validity).',
    official_fee_note_ur: 'فیس نیشنل بینک یا پاسپورٹ فیس آسان ایپ کے ذریعے جمع ہوتی ہے (5 یا 10 سالہ میعاد)۔'
  },
  frc: {
    slug: 'frc',
    title_en: 'Family Registration Certificate (FRC)',
    title_ur: 'فیملی رجسٹریشن سرٹیفکیٹ (ایف آر سی)',
    short_desc_en: 'Official NADRA record illustrating verified family tree composition: By Birth (parents & siblings) or By Marriage (spouse & children).',
    short_desc_ur: 'نادرا سے جاری ہونے والا خاندانی شجرہ کا سرکاری ثبوت: پیدائشی خاندان (والدین اور بہن بھائی) یا ازدواجی خاندان (اہلیہ اور بچے)۔',
    full_desc_en: 'An FRC authenticates family structure with NADRA records. Essential for foreign visa/immigration applications, inheritance settlement, court matters, and embassy attestations.',
    full_desc_ur: 'نادرا کے ریکارڈ کے مطابق خاندانی ساخت کی قانونی تصدیق۔ ویزا، سفارت خانوں، وراثت اور قانونی معاملات کے لیے درکار۔',
    authority_en: 'NADRA Registration Centres & PakID Portal',
    authority_ur: 'نادرا رجسٹریشن سینٹرز اور پاک آئی ڈی پورٹل',
    keywords: ['frc', 'family registration certificate', 'family tree', 'nadra', 'visa', 'immigration', 'by birth', 'by marriage'],
    official_fee_note_en: 'Official NADRA standard fee (approx Rs. 1,000 for standard certificate). Payable at NADRA counters or PakID portal.',
    official_fee_note_ur: 'نادرا کی مقررہ فیس تقریباً 1000 روپے ہے جو کاؤنٹر یا پاک آئی ڈی ایپ پر ادا کی جاتی ہے۔',
    prerequisites: [
      {
        slug: 'first_cnic',
        title_en: 'Valid CNICs of Family Members',
        title_ur: 'خاندان کے ارکان کے درست شناختی کارڈز',
        note_en: 'All adult family members must hold computerized CNICs registered in NADRA database.',
        note_ur: 'خاندان کے تمام بالغ افراد کا نادرا میں کمپیوٹرائزڈ شناختی کارڈ کا ہونا ضروری ہے۔'
      }
    ]
  },
  birth_certificate: {
    slug: 'birth_certificate',
    title_en: 'Birth Certificate (Union Council)',
    title_ur: 'پیدائش سرٹیفکیٹ (یونین کونسل)',
    short_desc_en: 'Official Computerized Birth Certificate issued by the relevant Union Council / Town Municipal Corporation in Karachi.',
    short_desc_ur: 'کراچی کی متعلقہ یونین کونسل یا ٹاؤن میونسپل کارپوریشن کا کمپیوٹرائزڈ برتھ سرٹیفکیٹ۔',
    full_desc_en: 'Primary foundation of civil identity in Pakistan. Issued by local Union Councils across Karachi districts upon presentation of hospital birth slip and parents original CNICs.',
    full_desc_ur: 'پاکستان میں بنیادی شہری شناخت۔ ہسپتال کی پرچی اور والدین کے شناختی کارڈز کی بنیاد پر متعلقہ یونین کونسل سے جاری کیا جاتا ہے۔',
    authority_en: 'Union Council / Town Municipal Corporation (TMC) Karachi',
    authority_ur: 'یونین کونسل / ٹاؤن میونسپل کارپوریشن کراچی',
    keywords: ['birth certificate', 'union council', 'tmc', 'nadra', 'birth slip', 'karachi', 'uc'],
    official_fee_note_en: 'Challan fee varies by local Union Council / Town Corporation. Confirm with office.',
    official_fee_note_ur: 'سرکاری چالان فیس یونین کونسل کے مطابق مختلف ہوتی ہے۔ دفتر سے تصدیق کریں۔',
    prerequisites: []
  },
  b_form: {
    slug: 'b_form',
    title_en: 'B-Form / Child Registration Certificate (NADRA)',
    title_ur: 'ب فارم / چائلڈ رجسٹریشن سرٹیفکیٹ (نادرا)',
    short_desc_en: 'Official NADRA registration document for children under 18 years of age.',
    short_desc_ur: '18 سال سے کم عمر بچوں کے لیے نادرا کا آفیشل رجسٹریشن سرٹیفکیٹ (ب فارم)۔',
    full_desc_en: 'Statutory registration for minor Pakistani citizens. Required for school admission, minor passport, and turning 18 CNIC conversion.',
    full_desc_ur: '18 سال سے کم عمر پاکستانی بچوں کی نادرا میں سرکاری رجسٹریشن۔ اسکول داخلے اور 18 سال کی عمر میں شناختی کارڈ کے لیے لازمی۔',
    authority_en: 'NADRA (National Database & Registration Authority)',
    authority_ur: 'نادرا (نیشنل ڈیٹا بیس اینڈ رجسٹریشن اتھارٹی)',
    keywords: ['b-form', 'crc', 'child registration', 'nadra', 'minor', 'birth record'],
    official_fee_note_en: 'NADRA normal fee is Rs. 50; Executive centre processing is Rs. 500.',
    official_fee_note_ur: 'نادرا نارمل فیس 50 روپے جبکہ ایگزیکٹو کاؤنٹر فیس 500 روپے ہے۔',
    prerequisites: [
      {
        slug: 'birth_certificate',
        title_en: 'Union Council Computerized Birth Certificate',
        title_ur: 'یونین کونسل کمپیوٹرائزڈ پیدائش سرٹیفکیٹ',
        note_en: 'You must obtain an official Computerized Birth Certificate from your Union Council before registering for a B-Form with NADRA.',
        note_ur: 'نادرا سے ب فارم بنوانے سے پہلے آپ کو متعلقہ یونین کونسل سے کمپیوٹرائزڈ برتھ سرٹیفکیٹ حاصل کرنا لازمی ہے۔'
      }
    ]
  },
  smart_card: {
    slug: 'smart_card',
    title_en: 'Smart CNIC / SNIC (NADRA)',
    title_ur: 'سمارٹ قومی شناختی کارڈ (نادرا)',
    short_desc_en: 'Chip-based high-security Computerized National Identity Card for Pakistani citizens.',
    short_desc_ur: 'پاکستانی شہریوں کے لیے چپ پر مبنی جدید اور محفوظ سمارٹ شناختی کارڈ۔',
    full_desc_en: 'State of the art cryptographic identity card containing embedded encrypted biometric records, compliant with international ICAO guidelines.',
    full_desc_ur: 'جدید انکرپٹڈ چپ کا حامل سمارٹ شناختی کارڈ جس میں فنگر پرنٹس اور بائیو میٹرک محفوظ ہوتے ہیں۔',
    authority_en: 'NADRA (National Database & Registration Authority)',
    authority_ur: 'نادرا (نیشنل ڈیٹا بیس اینڈ رجسٹریشن اتھارٹی)',
    keywords: ['smart card', 'snic', 'chip cnic', 'nadra', 'identity', 'renewal', 'upgrade'],
    official_fee_note_en: 'Normal delivery is Rs. 750, Urgent is Rs. 1,500, Executive is Rs. 2,500.',
    official_fee_note_ur: 'نارمل فیس 750 روپے، ارجنٹ 1500 روپے، اور ایگزیکٹو 2500 روپے ہے۔',
    prerequisites: [
      {
        slug: 'first_cnic',
        title_en: 'First-time CNIC / Established NADRA Record',
        title_ur: 'قومی شناختی کارڈ یا نادرا ریکارڈ',
        note_en: 'Applicants must have an established NADRA record / B-Form, or previous CNIC for smart card conversion/issuance.',
        note_ur: 'سمارٹ کارڈ کے لیے نادرا میں پیدائشی ریکارڈ (ب فارم) یا سابقہ قومی شناختی کارڈ لازمی ہے۔'
      }
    ]
  }
};

export const KARACHI_DISTRICTS = [
  { key: 'karachi_south', name_en: 'Karachi South (صدر، کلفٹن، ڈیفنس)', name_ur: 'ضلع جنوبی (ساؤتھ)' },
  { key: 'karachi_east', name_en: 'Karachi East (گلشنِ اقبال، جمشید کوارٹرز)', name_ur: 'ضلع شرقی (ایسٹ)' },
  { key: 'karachi_central', name_en: 'Karachi Central (نارتھ ناظم آباد، لیاقت آباد)', name_ur: 'ضلع وسطی (سینٹرل)' },
  { key: 'karachi_west', name_en: 'Karachi West (اورنگی، بلدیہ، منگھوپیر)', name_ur: 'ضلع غربی (ویسٹ)' },
  { key: 'karachi_keamari', name_en: 'Karachi Keamari (کیماڑی، ماری پور، ہاکس بے)', name_ur: 'ضلع کیماڑی (نواں ضلع)' },
  { key: 'karachi_korangi', name_en: 'Karachi Korangi (کورنگی، شاہ فیصل، لانڈھی)', name_ur: 'ضلع کورنگی' },
  { key: 'karachi_malir', name_en: 'Karachi Malir (ملیر، گڈاپ، ابراہیم حیدری)', name_ur: 'ضلع ملیر' }
];

export const QUESTIONS: Question[] = [
  // ---------------- Domicile & PRC Questions ----------------
  {
    id: 'Q_DOM_TYPE',
    service_slug: 'domicile_prc',
    key: 'application_type',
    order_index: 1,
    text_en: 'What certificates do you require?',
    text_ur: 'آپ کو کون سی دستاویزات درکار ہیں؟',
    hint_en: 'Most university admissions and government job applications in Sindh require both Domicile and PRC (Form C).',
    hint_ur: 'سندھ میں تعلیمی داخلوں اور سرکاری نوکریوں کے لیے دونوں (ڈومیسائل اور فارم سی پی آر سی) درکار ہوتے ہیں۔',
    input_type: 'single_choice',
    required: true,
    options: [
      { value: 'both', label_en: 'Both Domicile & PRC (Recommended)', label_ur: 'دونوں: ڈومیسائل اور پی آر سی (تجویز کردہ)' },
      { value: 'domicile_only', label_en: 'Domicile Certificate Only', label_ur: 'صرف ڈومیسائل سرٹیفکیٹ' },
      { value: 'prc_only', label_en: 'PRC (Permanent Residence Certificate) Only', label_ur: 'صرف پی آر سی (فارم سی)' }
    ]
  },
  {
    id: 'Q_DOM_DISTRICT',
    service_slug: 'domicile_prc',
    key: 'district',
    order_index: 2,
    text_en: 'Which Karachi district is your current residence in?',
    text_ur: 'آپ کی موجودہ رہائش کراچی کے کس ضلع میں ہے؟',
    hint_en: 'Your application must be submitted to the Deputy Commissioner Office corresponding to your residence address.',
    hint_ur: 'درخواست آپ کے رہائشی پتہ کے متعلقہ ڈپٹی کمشنر (ڈی سی) آفس میں جمع ہوتی ہے۔',
    input_type: 'district',
    required: true,
    options: KARACHI_DISTRICTS.map(d => ({ value: d.key, label_en: d.name_en, label_ur: d.name_ur }))
  },
  {
    id: 'Q_DOM_AGE_STATUS',
    service_slug: 'domicile_prc',
    key: 'is_applicant_minor',
    order_index: 3,
    text_en: 'Is the applicant under 18 years old (Minor)?',
    text_ur: 'کیا سائل (امیدوار) کی عمر 18 سال سے کم ہے؟',
    hint_en: 'Applicants under 18 apply on Form-D under their parents/guardian name and must attach B-Form.',
    hint_ur: '18 سال سے کم عمر افراد کے لیے بے فارم اور والدین کا ڈومیسائل منسلک ہوتا ہے۔',
    input_type: 'boolean',
    required: true,
    options: [
      { value: false, label_en: 'No, I am 18 or older (Adult)', label_ur: 'نہیں، عمر 18 سال یا اس سے زیادہ ہے' },
      { value: true, label_en: 'Yes, applicant is a Minor (Under 18)', label_ur: 'جی ہاں، امیدوار 18 سال سے کم عمر ہے' }
    ]
  },
  {
    id: 'Q_DOM_STUDENT',
    service_slug: 'domicile_prc',
    key: 'is_student',
    order_index: 4,
    text_en: 'Are you currently a student or applying for educational admission?',
    text_ur: 'کیا آپ طالب علم ہیں یا تعلیمی داخلے کے لیے اپلائی کر رہے ہیں؟',
    hint_en: 'Students require institutional bonafide letters and past educational mark sheets in Karachi.',
    hint_ur: 'طلباء کو سکول/کالج کا بونا فائیڈ لیٹر اور میٹرک کی اسناد کی تصدیق درکار ہوتی ہے۔',
    input_type: 'boolean',
    required: true,
    options: [
      { value: true, label_en: 'Yes, I am a student / applying for admissions', label_ur: 'جی ہاں، میں طالب علم ہوں / داخلے کے لیے' },
      { value: false, label_en: 'No, applying for employment or general purposes', label_ur: 'نہیں، نوکری یا دیگر مقاصد کے لیے' }
    ]
  },
  {
    id: 'Q_DOM_PARENT_STATUS',
    service_slug: 'domicile_prc',
    key: 'parent_domicile_available',
    order_index: 5,
    text_en: 'Do your parents/guardian hold a Karachi Domicile certificate?',
    text_ur: 'کیا آپ کے والدین (یا سرپرست) کے پاس کراچی کا ڈومیسائل موجود ہے؟',
    hint_en: 'Per Sindh Cabinet rules, parental domicile strongly validates local lineage. If parents do not hold one, extended continuous residence proof is mandated.',
    hint_ur: 'سندھ حکومت کے قواعد کے مطابق والدین کا ڈومیسائل مقامی رہائش کی توثیق کرتا ہے۔',
    input_type: 'single_choice',
    required: true,
    options: [
      { value: 'yes', label_en: 'Yes, Father/Mother has Karachi Domicile', label_ur: 'جی ہاں، والد یا والدہ کے پاس کراچی ڈومیسائل ہے' },
      { value: 'no', label_en: 'No, parents do not hold Karachi Domicile', label_ur: 'نہیں، والدین کے پاس کراچی ڈومیسائل نہیں ہے' },
      { value: 'deceased', label_en: 'Parents are deceased (Death Certificate available)', label_ur: 'والدین انتقال کر چکے ہیں (ڈیتھ سرٹیفکیٹ موجود ہے)' }
    ]
  },
  {
    id: 'Q_DOM_MARITAL',
    service_slug: 'domicile_prc',
    key: 'is_married_female',
    order_index: 6,
    text_en: 'Is the applicant a married female applying on husband’s domicile?',
    text_ur: 'کیا خاتون سائل ہیں اور شادی کے بعد شوہر کی رہائش پر اپلائی کر رہی ہیں؟',
    hint_en: 'Married women require Nikahnama (Marriage Registration Certificate) and husband’s CNIC and Domicile.',
    hint_ur: 'شادی شدہ خواتین کو نکاح نامہ، شوہر کا شناختی کارڈ اور شوہر کا ڈومیسائل منسلک کرنا ہوتا ہے۔',
    input_type: 'boolean',
    required: true,
    options: [
      { value: true, label_en: 'Yes, married female applicant', label_ur: 'جی ہاں، شادی شدہ خاتون' },
      { value: false, label_en: 'No, unmarried or male applicant', label_ur: 'نہیں، غیر شادی شدہ یا مرد سائل' }
    ]
  },

  // ---------------- First-Time CNIC Questions ----------------
  {
    id: 'Q_CNIC_AGE',
    service_slug: 'first_cnic',
    key: 'applicant_reached_18',
    order_index: 1,
    text_en: 'Has the applicant reached exactly 18 years of age or older?',
    text_ur: 'کیا امیدوار کی عمر مکمل 18 سال یا اس سے زیادہ ہو چکی ہے؟',
    hint_en: 'First-time adult CNIC can only be processed on or after the exact 18th birth date per NADRA birth records.',
    hint_ur: 'نادرا کے ریکارڈ کے مطابق 18 سال مکمل ہونے پر ہی بالغ شناختی کارڈ کا اندراج ہوتا ہے۔',
    input_type: 'boolean',
    required: true,
    options: [
      { value: true, label_en: 'Yes, 18 years or older', label_ur: 'جی ہاں، عمر 18 سال یا زائد ہے' },
      { value: false, label_en: 'No, under 18 (Needs Juvenile Smart Card)', label_ur: 'نہیں، عمر 18 سے کم ہے (چائلڈ اسمارٹ کارڈ بنتا ہے)' }
    ]
  },
  {
    id: 'Q_CNIC_BFORM',
    service_slug: 'first_cnic',
    key: 'has_smart_bform',
    order_index: 2,
    text_en: 'Do you possess the original NADRA Child Registration Certificate (B-Form)?',
    text_ur: 'کیا آپ کے پاس نادرا کا اصل چائلڈ رجسٹریشن سرٹیفکیٹ (بے فارم) موجود ہے؟',
    hint_en: 'Original NADRA B-Form/CRC containing child identity registration number is required.',
    hint_ur: 'نادرا کا جاری کردہ اصل بے فارم نمبر درکار ہوتا ہے۔',
    input_type: 'boolean',
    required: true,
    options: [
      { value: true, label_en: 'Yes, I have the original NADRA B-Form', label_ur: 'جی ہاں، اصل بے فارم موجود ہے' },
      { value: false, label_en: 'No, lost or never registered', label_ur: 'نہیں، گم ہو گیا یا پہلے اندراج نہیں ہوا' }
    ]
  },
  {
    id: 'Q_CNIC_BLOOD_WITNESS',
    service_slug: 'first_cnic',
    key: 'blood_relative_available',
    order_index: 3,
    text_en: 'Can a registered parent or blood relative (holding active CNIC) accompany you?',
    text_ur: 'کیا والد، والدہ یا خونی رشتے دار (شناختی کارڈ یافتہ) تصدیق کے لیے ساتھ جائیں گے؟',
    hint_en: 'NADRA mandates biometric physical verification by a registered parent (Father/Mother) or sibling with matching family tree.',
    hint_ur: 'نادرا شجرہ نسب کی بائیومیٹرک تصدیق کے لیے والد، والدہ یا سگے بھائی/بہن کی بائیومیٹرک گواہی ضروری ہے۔',
    input_type: 'single_choice',
    required: true,
    options: [
      { value: 'parent_present', label_en: 'Yes, Father or Mother will accompany', label_ur: 'جی ہاں، والد یا والدہ ساتھ ہوں گے' },
      { value: 'sibling_present', label_en: 'Sibling (Brother/Sister) with active CNIC will accompany', label_ur: 'سگا بھائی یا بہن ساتھ ہوں گے' },
      { value: 'no_relative', label_en: 'No blood relative available (Gazetted officer attestation required)', label_ur: 'کوئی خونی رشتے دار موجود نہیں (گریڈ 17 افسر سے تصدیق درکار)' }
    ]
  },
  {
    id: 'Q_CNIC_PARENTS_CNIC',
    service_slug: 'first_cnic',
    key: 'parents_cnic_valid',
    order_index: 4,
    text_en: 'Are your parents’ CNICs currently valid and not expired?',
    text_ur: 'کیا والدین کے شناختی کارڈ فعال ہیں اور ایکسپائر نہیں ہوئے؟',
    hint_en: 'If parent CNIC is expired, NADRA counters often request parent renewal prior to issuing dependent adult CNIC.',
    hint_ur: 'اگر والدین کا شناختی کارڈ ایکسپائر ہو تو نادرا پہلے اس کی تجدید کا کہہ سکتا ہے۔',
    input_type: 'boolean',
    required: true,
    options: [
      { value: true, label_en: 'Yes, valid and active', label_ur: 'جی ہاں، دونوں یا ایک کا کارڈ ایکٹو ہے' },
      { value: false, label_en: 'No, parents’ CNIC is expired or canceled', label_ur: 'نہیں، ایکسپائر یا منسوخ ہو چکا ہے' }
    ]
  },
  // ---------------- Passport Questions ----------------
  {
    id: 'Q_PASS_TYPE',
    service_slug: 'passport',
    key: 'passport_application_type',
    order_index: 1,
    text_en: 'What type of passport application are you submitting?',
    text_ur: 'آپ کس قسم کی پاسپورٹ درخواست جمع کروا رہے ہیں؟',
    hint_en: 'Renewal applies if your previous booklet has expired or has fewer than 6 months validity.',
    hint_ur: 'اگر پرانے پاسپورٹ کی میعاد ختم ہو گئی ہو تو تجدید (Renewal) کا انتخاب کریں۔',
    input_type: 'single_choice',
    required: true,
    options: [
      { value: 'fresh', label_en: 'Fresh / First-Time Passport', label_ur: 'پہلی بار نیا پاسپورٹ' },
      { value: 'renewal', label_en: 'Renewal of Expiring / Expired Passport', label_ur: 'میعاد ختم شدہ پاسپورٹ کی تجدید' },
      { value: 'lost', label_en: 'Lost or Stolen Passport Replacement', label_ur: 'گمشدہ یا چوری شدہ پاسپورٹ' }
    ]
  },
  {
    id: 'Q_PASS_AGE',
    service_slug: 'passport',
    key: 'is_applicant_minor',
    order_index: 2,
    text_en: 'Is the applicant under 18 years of age (minor)?',
    text_ur: 'کیا درخواست دہندہ کی عمر 18 سال سے کم (نابالغ) ہے؟',
    hint_en: 'Minors require original NADRA Smart CRC (B-Form) and parent presence.',
    hint_ur: 'نابالغ بچوں کے لیے اصل بے فارم اور والدین کی موجودگی لازمی ہے۔',
    input_type: 'boolean',
    required: true,
    options: []
  },
  {
    id: 'Q_PASS_GOV',
    service_slug: 'passport',
    key: 'is_government_employee',
    order_index: 3,
    text_en: 'Is the applicant an active government employee / armed forces personnel?',
    text_ur: 'کیا درخواست دہندہ سرکاری ملازم یا مسلح افواج سے تعلق رکھتا ہے؟',
    hint_en: 'Government employees must produce an official Departmental Permission / NOC.',
    hint_ur: 'سرکاری ملازمین کے لیے مجاز محکمے کی این او سی لازمی ہے۔',
    input_type: 'boolean',
    required: true,
    options: []
  },

  // ---------------- FRC Questions ----------------
  {
    id: 'Q_FRC_CATEGORY',
    service_slug: 'frc',
    key: 'frc_category',
    order_index: 1,
    text_en: 'Which family registration certificate category do you require?',
    text_ur: 'آپ کو کس زمرے کے لیے فیملی رجسٹریشن سرٹیفکیٹ درکار ہے؟',
    hint_en: 'By Birth includes parents & siblings; By Marriage includes your spouse and children.',
    hint_ur: 'پیدائشی میں والدین اور بہن بھائی شامل ہیں؛ ازدواجی میں شریک حیات اور بچے شامل ہیں۔',
    input_type: 'single_choice',
    required: true,
    options: [
      { value: 'by_birth', label_en: 'FRC By Birth (Parents & Siblings)', label_ur: 'پیدائشی خاندان (والدین اور بہن بھائی)' },
      { value: 'by_marriage', label_en: 'FRC By Marriage (Spouse & Children)', label_ur: 'ازدواجی خاندان (اہلیہ/شوہر اور بچے)' }
    ]
  },
  {
    id: 'Q_FRC_REGISTERED',
    service_slug: 'frc',
    key: 'family_nadra_registered',
    order_index: 2,
    text_en: 'Do all family members hold verified NADRA CNIC or CRC B-Form numbers?',
    text_ur: 'کیا خاندان کے تمام افراد کے پاس نادرا شناختی کارڈ یا بے فارم نمبر موجود ہے؟',
    hint_en: 'Every individual member must be linked in NADRA database.',
    hint_ur: 'خاندان کے ہر فرد کا نادرا ریکارڈ میں اندراج لازمی ہے۔',
    input_type: 'boolean',
    required: true,
    options: []
  },
  {
    id: 'Q_FRC_MARRIAGE',
    service_slug: 'frc',
    key: 'marriage_updated_in_nadra',
    order_index: 3,
    text_en: 'Is your marriage registered and updated in the NADRA database?',
    text_ur: 'کیا آپ کا ازدواجی ریکارڈ اور کمپیوٹرائزڈ نکاح نامہ نادرا میں اپڈیٹ ہے؟',
    hint_en: 'Required for FRC By Marriage. Union Council Computerized Marriage Certificate needed.',
    hint_ur: 'ازدواجی ایف آر سی کے لیے کمپیوٹرائزڈ نکاح نامہ کا نادرا میں اندراج ضروری ہے۔',
    input_type: 'boolean',
    required: true,
    options: [],
    condition: {
      depends_on_key: 'frc_category',
      operator: 'eq',
      value: 'by_marriage'
    }
  }
];

export const REQUIREMENTS: Requirement[] = [
  // ---------------- DOMICILE & PRC REQUIREMENTS ----------------
  {
    id: 'REQ_CNIC_COPIES',
    code: 'DOC_CNIC_APPLICANT',
    service_slug: 'domicile_prc',
    title_en: 'Attested Copies of Applicant CNIC or B-Form',
    title_ur: 'امیدوار کا شناختی کارڈ یا بے فارم کی تصدیق شدہ کاپیاں',
    why_needed_en: 'Establishes primary identity and age of the applicant. 2 attested photocopies required.',
    why_needed_ur: 'امیدوار کی بنیادی شناخت اور تاریخ پیدائش کی تصدیق۔ 2 تصدیق شدہ فوٹو کاپیاں۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S2',
    last_verified_on: '2026-11-01'
  },
  {
    id: 'REQ_PASSPORT_PHOTOS',
    code: 'DOC_PHOTOS_PASSPORT',
    service_slug: 'domicile_prc',
    title_en: 'Passport Size Photographs (4 to 5 copies, white background)',
    title_ur: 'پاسپورٹ سائز تصاویر (4 سے 5 عدد، سفید بیک گراؤنڈ)',
    why_needed_en: 'Pastes directly on the Domicile certificate, PRC Form-C register, and office archives.',
    why_needed_ur: 'ڈومیسائل سرٹیفکیٹ، پی آر سی فارم سی اور ڈی سی آفس رجسٹر کے ریکارڈ کے لیے۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S2',
    last_verified_on: '2026-11-01'
  },
  {
    id: 'REQ_PARENT_CNIC',
    code: 'DOC_PARENT_CNIC',
    service_slug: 'domicile_prc',
    title_en: 'Attested Copy of Father’s / Mother’s CNIC',
    title_ur: 'والد یا والدہ کے شناختی کارڈ کی تصدیق شدہ فوٹو کاپی',
    why_needed_en: 'Verifies lineage and provincial residency linkage under Rule 3 of Sindh Citizenship verification orders.',
    why_needed_ur: 'سندھ حکومت کے احکامات کے تحت خاندانی تعلق اور رہائشی تصدیق کے لیے لازمی۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S3',
    last_verified_on: '2026-09-20'
  },
  {
    id: 'REQ_PARENT_DOMICILE',
    code: 'DOC_PARENT_DOMICILE_COPY',
    service_slug: 'domicile_prc',
    title_en: 'Attested Copy of Father’s / Guardian’s Karachi Domicile & PRC',
    title_ur: 'والد یا سرپرست کے کراچی ڈومیسائل اور پی آر سی کی تصدیق شدہ کاپی',
    why_needed_en: 'Primary documentary evidence establishing hereditary permanent residence in Karachi, Sindh.',
    why_needed_ur: 'کراچی میں موروثی اور مستقل رہائش کا بنیادی دستاویزی ثبوت۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S1',
    last_verified_on: '2026-10-15'
  },
  {
    id: 'REQ_EDUCATION_CERTIFICATES',
    code: 'DOC_STUDENT_EDUCATION',
    service_slug: 'domicile_prc',
    title_en: 'Educational Certificates & Matriculation Mark Sheet / Sanad in Karachi',
    title_ur: 'کراچی سے میٹرک مارک شیٹ / سند یا تعلیمی اسناد',
    why_needed_en: 'Proves minimum continuous institutional residence of 3+ years in Karachi per PRC Rule 4.',
    why_needed_ur: 'پی آر سی رول 4 کے تحت کراچی میں کم از کم 3 سال مسلسل تعلیمی رہائش کا ناقابل تردید ثبوت۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S1',
    last_verified_on: '2026-10-15'
  },
  {
    id: 'REQ_BONAFIDE_LETTER',
    code: 'DOC_BONAFIDE_INSTITUTE',
    service_slug: 'domicile_prc',
    title_en: 'School/College Bonafide Study Certificate (Issued on official letterhead)',
    title_ur: 'سکول یا کالج کا بونا فائیڈ سرٹیفکیٹ (لیٹر ہیڈ پر)',
    why_needed_en: 'Current enrollment verification showing active regular attendance in applicant’s district.',
    why_needed_ur: 'طالب علم کی موجودہ باقاعدہ حاضری اور سکول ریکارڈ کی تصدیق۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S2',
    last_verified_on: '2026-11-01'
  },
  {
    id: 'REQ_UTILITY_BILL',
    code: 'DOC_RESIDENCE_UTILITY',
    service_slug: 'domicile_prc',
    title_en: 'Electricity (K-Electric) or Sui Gas Bill of Karachi Residence',
    title_ur: 'کراچی کے رہائشی پتہ کا کے الیکٹرک یا سوئی گیس بل (اصل یا کاپی)',
    why_needed_en: 'Physical residence utility corroboration matching applicant’s district jurisdiction.',
    why_needed_ur: 'متعلقہ ضلع میں رہائشی مکان کے پتے کا فزیکل یوٹیلیٹی ثبوت۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S2',
    last_verified_on: '2026-11-01'
  },
  {
    id: 'REQ_AFFIDAVIT_STAMP',
    code: 'DOC_AFFIDAVIT_NOTARIZED',
    service_slug: 'domicile_prc',
    title_en: 'Notarized Affidavit on Stamp Paper (Oath of Sindh Residence)',
    title_ur: 'اشٹام پیپر پر نوٹرائزڈ حلف نامہ (سندھ میں مستقل رہائش کا اقرار)',
    why_needed_en: 'Legal sworn affidavit declaring applicant does not hold domicile or PRC in any other province.',
    why_needed_ur: 'حلفیہ بیان کہ امیدوار پاکستان کے کسی دوسرے صوبے یا ضلع کا ڈومیسائل نہیں رکھتا۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S2',
    last_verified_on: '2026-11-01'
  },
  {
    id: 'REQ_MARRIAGE_DOC',
    code: 'DOC_NIKAHNAMA_COPY',
    service_slug: 'domicile_prc',
    title_en: 'Attested Copy of Nikahnama & Husband’s CNIC & Domicile',
    title_ur: 'نکاح نامہ اور شوہر کا شناختی کارڈ و ڈومیسائل کی کاپی',
    why_needed_en: 'Mandatory for married females transferring domicile jurisdiction under Sindh domicile rules.',
    why_needed_ur: 'شادی شدہ خواتین کی شوہر کے ڈومیسائل پر رہائشی تبدیلی کے لیے قانونی ثبوت۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S2',
    last_verified_on: '2026-11-01'
  },
  {
    id: 'REQ_KEAMARI_JURISDICTION_NOTE',
    code: 'STEP_KEAMARI_OLD_DISTRICT_TRANSFER',
    service_slug: 'domicile_prc',
    title_en: 'District Keamari Residents: Boundary Transfer Check from DC West',
    title_ur: 'ضلع کیماڑی کے رہائشی: ڈی سی ویسٹ سے سابقہ ریکارڈ کی کلیئرنس',
    why_needed_en: 'Because District Keamari was newly bifurcated from Karachi West, families whose parental files are archived at DC West may be requested for a No-Objection or file migration.',
    why_needed_ur: 'کیماڑی نیا ضلع بننے کے باعث اگر والدین کا پرانا ریکارڈ ڈی سی ویسٹ میں ہے تو منتقلی کا ثبوت درکار ہو سکتا ہے۔',
    kind: 'step',
    verification_status: 'unverified',
    source_id: 'S5',
    last_verified_on: '2026-10-10',
    notes: 'Confirm with counter at DC Keamari office.'
  },
  {
    id: 'REQ_CHALLAN_FEE_CONFIRM',
    code: 'STEP_TREASURY_CHALLAN_PAYMENT',
    service_slug: 'domicile_prc',
    title_en: 'National Bank / Sindh Bank Treasury Challan Voucher (Confirm Amount at DC Office)',
    title_ur: 'نیشنل بینک / سندھ بینک کا سرکاری چالان واؤچر (درست فیس کاؤنٹر سے تصدیق کریں)',
    why_needed_en: 'Official revenue stamp fee deposited under provincial account code. Secondary websites report conflicting fees (Rs 200–500); check on-site notice board before depositing.',
    why_needed_ur: 'سرکاری خزانے کا چالان۔ مختلف ویب سائٹس پر مختلف فیسیں درج ہیں، لہٰذا کاؤنٹر سے فیس معلوم کر کے ہی جمع کروائیں۔',
    kind: 'step',
    verification_status: 'unverified',
    source_id: 'S6',
    last_verified_on: '2026-08-14',
    notes: 'Exact PKR fee not officially verified on web; verify at DC Branch window.'
  },

  // ---------------- FIRST-TIME CNIC REQUIREMENTS ----------------
  {
    id: 'REQ_CNIC_BFORM_ORIGINAL',
    code: 'DOC_BFORM_ORIGINAL',
    service_slug: 'first_cnic',
    title_en: 'Original NADRA Child Registration Certificate (B-Form / CRC)',
    title_ur: 'نادرا کا اصل چائلڈ رجسٹریشن سرٹیفکیٹ (بے فارم)',
    why_needed_en: 'Primary foundation document surrendered or verified for initial adult identity creation.',
    why_needed_ur: 'بالغ شناختی کارڈ کے اجراء کے لیے نادرا کا اصل بے فارم کاؤنٹر پر دکھانا لازمی ہے۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S4',
    last_verified_on: '2026-11-04'
  },
  {
    id: 'REQ_CNIC_BLOOD_WITNESS',
    code: 'STEP_BLOOD_WITNESS_BIOMETRICS',
    service_slug: 'first_cnic',
    title_en: 'Physical Biometric Verification by Registered Blood Relative (Parent / Sibling)',
    title_ur: 'خونی رشتے دار (والد، والدہ یا بھائی/بہن) کی موقع پر بائیو میٹرک تصدیق',
    why_needed_en: 'NADRA requires live thumb impression of a registered family member to verify applicant lineage against the NADRA Central Family Tree database.',
    why_needed_ur: 'نادرا شجرہ نسب کی تصدیق کے لیے خونی رشتے دار کا موقع پر انگوٹھا لگوانا لازمی قرار دیتا ہے۔',
    kind: 'step',
    verification_status: 'verified',
    source_id: 'S4',
    last_verified_on: '2026-11-04'
  },
  {
    id: 'REQ_CNIC_PARENT_CNIC_ORIGINALS',
    code: 'DOC_PARENT_ORIGINAL_CNIC',
    service_slug: 'first_cnic',
    title_en: 'Original CNICs of Parents (or Death Certificate if Deceased)',
    title_ur: 'والدین کے اصل شناختی کارڈ (یا وفات کی صورت میں ڈیتھ سرٹیفکیٹ)',
    why_needed_en: 'Inspected by NADRA registration officer to confirm family tree consistency and active marital status.',
    why_needed_ur: 'فیملی ٹری اور ازدواجی حیثیت کی تصدیق کے لیے ڈیٹا انٹری افسر اصل کارڈز چیک کرتا ہے۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S4',
    last_verified_on: '2026-11-04'
  },
  {
    id: 'REQ_CNIC_MATRIC_DOC',
    code: 'DOC_MATRIC_BIRTH_PROOF',
    service_slug: 'first_cnic',
    title_en: 'Matriculation Certificate or Birth Certificate (for Date of Birth confirmation)',
    title_ur: 'میٹرک کی سند یا یونین کونسل برتھ سرٹیفکیٹ (تاریخ پیدائش کی تصدیق)',
    why_needed_en: 'Mandatory if there is any spelling mismatch or date discrepancy on earlier registration records.',
    why_needed_ur: 'اگر بے فارم اور موجودہ نام یا تاریخ پیدائش کے ہجے میں کوئی فرق ہو تو میٹرک کی سند دیکھی جاتی ہے۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S4',
    last_verified_on: '2026-11-04'
  },
  {
    id: 'REQ_CNIC_BIOMETRIC_UPDATE_ALERT',
    code: 'STEP_NADRA_BIOMETRIC_CENTRE_VISIT',
    service_slug: 'first_cnic',
    title_en: 'NADRA Centre In-Person Visit (Mandatory if B-Form has no prior biometrics)',
    title_ur: 'نادرا سینٹر کا ذاتی دورہ (اگر بے فارم میں پہلے فنگر پرنٹس نہیں دیے گئے تھے)',
    why_needed_en: 'New 2025/2026 rules: You cannot complete first-time adult CNIC via PakID mobile app unless biometric records already exist on your child profile. Physical visit to NADRA Mega/Registration Centre required.',
    why_needed_ur: '2025/2026 کی تازہ ترین ہدایات کے مطابق پہلی بار کارڈ کے لیے نادرا سینٹر جانا ضروری ہے تاکہ فنگر پرنٹس اور تصویر لی جا سکے۔',
    kind: 'step',
    verification_status: 'verified',
    source_id: 'S4',
    last_verified_on: '2026-11-04'
  },
  // ---------------- Passport Requirements ----------------
  {
    id: 'REQ_PASS_CNIC',
    code: 'REQ_PASS_ORIG_CNIC',
    service_slug: 'passport',
    title_en: 'Original Computerized National Identity Card (CNIC / Smart Card / NICOP)',
    title_ur: 'اصل قومی شناختی کارڈ (سی این آئی سی / سمارٹ کارڈ / این آئی سی او پی)',
    why_needed_en: 'Mandatory proof of adult Pakistani citizenship verified at the DGI&P biometric counter.',
    why_needed_ur: 'پاسپورٹ کاؤنٹر پر بالغ پاکستانی شہری کی تصدیق کے لیے اصل شناختی کارڈ لازمی ہے۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S7',
    last_verified_on: '2026-11-08'
  },
  {
    id: 'REQ_PASS_CHALLAN',
    code: 'REQ_PASS_FEE_CHALLAN',
    service_slug: 'passport',
    title_en: 'Passport Fee Bank Challan Receipt / App 1Link Paid Voucher',
    title_ur: 'پاسپورٹ فیس چالان رسید / پاسپورٹ فیس آسان ایپ واؤچر',
    why_needed_en: 'Original paid bank receipt (National Bank) or Passport Fee Asaan app 1Link PSID confirmation token.',
    why_needed_ur: 'حکومت کی مقررہ فیس کی بینک رسید یا آسان ایپ واؤچر ٹوکن۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S7',
    last_verified_on: '2026-11-08'
  },
  {
    id: 'REQ_PASS_PREV',
    code: 'REQ_PASS_PREV_PASSPORT',
    service_slug: 'passport',
    title_en: 'Previous Original Passport + Photocopies of First 4 Pages',
    title_ur: 'سابقہ اصل پاسپورٹ بمع ابتدائی 4 صفحات کی فوٹو کاپیاں',
    why_needed_en: 'Required for physical cancellation and verification during passport renewal.',
    why_needed_ur: 'تجدید کی صورت میں پرانے پاسپورٹ کی منسوخی اور تصدیق کے لیے لازمی ہے۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S7',
    last_verified_on: '2026-11-08'
  },
  {
    id: 'REQ_PASS_MINOR',
    code: 'REQ_PASS_MINOR_CRC',
    service_slug: 'passport',
    title_en: 'Original NADRA Smart CRC (B-Form) & Accompanying Parent with CNIC',
    title_ur: 'اصل نادرا سمارٹ بے فارم اور والدین کی اصل شناختی کارڈ کے ساتھ موجودگی',
    why_needed_en: 'Required for passport issuance to minors under 18 years of age.',
    why_needed_ur: '18 سال سے کم عمر بچوں کے پاسپورٹ کے لیے بے فارم اور والدین کی موجودگی لازمی ہے۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S7',
    last_verified_on: '2026-11-08'
  },
  {
    id: 'REQ_PASS_NOC',
    code: 'REQ_PASS_GOV_NOC',
    service_slug: 'passport',
    title_en: 'Official No Objection Certificate (NOC) / Departmental Permission',
    title_ur: 'سرکاری محکمہ کی این او سی / محکمانہ اجازت نامہ',
    why_needed_en: 'Mandatory statutory requirement for federal, provincial, and semi-autonomous government employees.',
    why_needed_ur: 'سرکاری ملازمین کے لیے مجاز اتھارٹی کا جاری کردہ این او سی پاسپورٹ بنوانے کے لیے لازمی ہے۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S7',
    last_verified_on: '2026-11-08'
  },
  {
    id: 'REQ_PASS_LOST',
    code: 'REQ_PASS_LOST_FIR',
    service_slug: 'passport',
    title_en: 'Police Station Lost Passport Report / FIR & Notarized Affidavit',
    title_ur: 'تھانے کی گمشدگی رپورٹ / ایف آئی آر اور نوٹری حلف نامہ',
    why_needed_en: 'Legal record proving previous passport loss or theft to prevent identity misuse.',
    why_needed_ur: 'پاسپورٹ گم ہونے یا چوری ہونے پر تھانے کی رپورٹ کاؤنٹر پر لازمی جمع ہوتی ہے۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S7',
    last_verified_on: '2026-11-08'
  },

  // ---------------- FRC Requirements ----------------
  {
    id: 'REQ_FRC_CNIC',
    code: 'REQ_FRC_ORIG_CNIC',
    service_slug: 'frc',
    title_en: 'Applicant\'s Original CNIC / Smart Card',
    title_ur: 'درخواست دہندہ کا اصل شناختی کارڈ',
    why_needed_en: 'Required to authenticate the identity of the family member requesting the certificate.',
    why_needed_ur: 'نادرا میں فیملی ریکارڈ جاری کروانے کے لیے درخواست دہندہ کا اصل کارڈ لازمی ہے۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S8',
    last_verified_on: '2026-11-08'
  },
  {
    id: 'REQ_FRC_IDS',
    code: 'REQ_FRC_FAMILY_NUMBERS',
    service_slug: 'frc',
    title_en: '13-Digit CNIC or B-Form Numbers of All Family Members',
    title_ur: 'خاندان کے تمام افراد کے 13 ہندسوں کے شناختی کارڈ یا بے فارم نمبرز',
    why_needed_en: 'Required by NADRA database to link parents, siblings, spouse, or children into the computerized tree.',
    why_needed_ur: 'خاندانی شجرہ میں تمام متعلقہ افراد کو منسلک کرنے کے لیے نمبرز درکار ہیں۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S8',
    last_verified_on: '2026-11-08'
  },
  {
    id: 'REQ_FRC_MARRIAGE',
    code: 'REQ_FRC_MARRIAGE_RECORD',
    service_slug: 'frc',
    title_en: 'NADRA Computerized Marriage Certificate (MRC) / Registered Nikahnama',
    title_ur: 'نادرا کمپیوٹرائزڈ میرج سرٹیفکیٹ (ایم آر سی) یا رجسٹرڈ نکاح نامہ',
    why_needed_en: 'Mandatory to issue FRC By Marriage (establishing legal spouse and children link).',
    why_needed_ur: 'ازدواجی ایف آر سی کے لیے شادی کا نادرا میں باقاعدہ اندراج لازمی ہے۔',
    kind: 'document',
    verification_status: 'verified',
    source_id: 'S8',
    last_verified_on: '2026-11-08'
  },
  {
    id: 'REQ_FRC_AFFIDAVIT',
    code: 'REQ_FRC_AFFIDAVIT_DISCREPANCY',
    service_slug: 'frc',
    title_en: 'Family Relationship Notarized Affidavit (ILLUSTRATIVE / DISCRETIONARY)',
    title_ur: 'خاندانی قرابت داری کا نوٹری حلف نامہ (وضاحتی)',
    why_needed_en: 'Requested by NADRA verification officer if spelling discrepancies exist in parental names.',
    why_needed_ur: 'ناموں میں معمولی فرق ہونے کی صورت میں نادرا افسر کی صوابدید پر درکار۔',
    kind: 'document',
    verification_status: 'unverified',
    source_id: 'S8',
    last_verified_on: '2026-11-08'
  }
];

export const ELIGIBILITY_RULES: EligibilityRule[] = [
  // Domicile basic mandatory
  { id: 'R1', requirement_id: 'REQ_CNIC_COPIES', applicability: 'mandatory', priority: 1, is_active: true },
  { id: 'R2', requirement_id: 'REQ_PASSPORT_PHOTOS', applicability: 'mandatory', priority: 1, is_active: true },
  { id: 'R3', requirement_id: 'REQ_PARENT_CNIC', applicability: 'mandatory', priority: 1, is_active: true },
  { id: 'R4', requirement_id: 'REQ_UTILITY_BILL', applicability: 'mandatory', priority: 1, is_active: true },
  { id: 'R5', requirement_id: 'REQ_AFFIDAVIT_STAMP', applicability: 'mandatory', priority: 1, is_active: true },
  { id: 'R6', requirement_id: 'REQ_CHALLAN_FEE_CONFIRM', applicability: 'mandatory', priority: 1, is_active: true },

  // Parental Domicile condition
  {
    id: 'R7',
    requirement_id: 'REQ_PARENT_DOMICILE',
    applicability: 'mandatory',
    condition: { all: [{ key: 'parent_domicile_available', op: 'eq', value: 'yes' }] },
    priority: 2,
    is_active: true
  },

  // Student specific conditions
  {
    id: 'R8',
    requirement_id: 'REQ_EDUCATION_CERTIFICATES',
    applicability: 'mandatory',
    condition: { all: [{ key: 'is_student', op: 'eq', value: true }] },
    priority: 2,
    is_active: true
  },
  {
    id: 'R9',
    requirement_id: 'REQ_BONAFIDE_LETTER',
    applicability: 'mandatory',
    condition: { all: [{ key: 'is_student', op: 'eq', value: true }] },
    priority: 2,
    is_active: true
  },

  // Married female condition
  {
    id: 'R10',
    requirement_id: 'REQ_MARRIAGE_DOC',
    applicability: 'mandatory',
    condition: { all: [{ key: 'is_married_female', op: 'eq', value: true }] },
    priority: 3,
    is_active: true
  },

  // Keamari district specific advisory
  {
    id: 'R11',
    requirement_id: 'REQ_KEAMARI_JURISDICTION_NOTE',
    applicability: 'conditional',
    district: 'karachi_keamari',
    condition: { all: [{ key: 'district', op: 'eq', value: 'karachi_keamari' }] },
    priority: 4,
    is_active: true
  },

  // First-time CNIC mandatory rules
  { id: 'R12', requirement_id: 'REQ_CNIC_BFORM_ORIGINAL', applicability: 'mandatory', priority: 1, is_active: true },
  { id: 'R13', requirement_id: 'REQ_CNIC_BLOOD_WITNESS', applicability: 'mandatory', priority: 1, is_active: true },
  { id: 'R14', requirement_id: 'REQ_CNIC_PARENT_CNIC_ORIGINALS', applicability: 'mandatory', priority: 1, is_active: true },
  { id: 'R15', requirement_id: 'REQ_CNIC_BIOMETRIC_UPDATE_ALERT', applicability: 'mandatory', priority: 1, is_active: true },
  { id: 'R16', requirement_id: 'REQ_CNIC_MATRIC_DOC', applicability: 'conditional', priority: 2, is_active: true }
];

export const OFFICES: Office[] = [
  // ---------------- DC OFFICES (Domicile & PRC) ----------------
  {
    id: 'OFF_DC_SOUTH',
    name_en: 'Deputy Commissioner Office (Karachi South)',
    name_ur: 'ڈپٹی کمشنر آفس (کراچی جنوبی / ساؤتھ)',
    office_type: 'dc_office',
    district: 'Karachi South',
    district_key: 'karachi_south',
    address_en: 'Club Road, near PIDC House & Commissioner Office, Civil Lines, Karachi',
    address_ur: 'کلب روڈ، نزدیک پی آئی ڈی سی ہاؤس، سول لائنز، کراچی',
    lat: 24.8488,
    lng: 67.0272,
    services: ['domicile_prc'],
    verification_status: 'verified',
    last_verified_on: '2026-11-01',
    hours_note_en: 'Official hours 9:00 AM – 3:30 PM (Mon–Fri). Token counter closes at 1:00 PM. Confirm on-site.',
    hours_note_ur: 'سرکاری اوقات صبح 9 سے سہ پہر 3:30 (پیر تا جمعہ)۔ ٹوکن کاؤنٹر 1:00 بجے بند ہوتا ہے۔',
    notes_en: 'Dedicated Domicile/PRC counter on the ground floor. National Bank booth adjacent for challan vouchers.',
    notes_ur: 'ڈومیسائل برانچ گراؤنڈ فلور پر واقع ہے۔ نیشنل بینک چالان بوتھ ساتھ موجود ہے۔'
  },
  {
    id: 'OFF_DC_EAST',
    name_en: 'Deputy Commissioner Office (Karachi East)',
    name_ur: 'ڈپٹی کمشنر آفس (کراچی شرقی / ایسٹ)',
    office_type: 'dc_office',
    district: 'Karachi East',
    district_key: 'karachi_east',
    address_en: 'Main University Road, near Civic Centre & Expo Centre, Gulshan-e-Iqbal, Karachi',
    address_ur: 'مین یونیورسٹی روڈ، بالمقابل سوک سینٹر، گلشنِ اقبال، کراچی',
    lat: 24.8967,
    lng: 67.0782,
    services: ['domicile_prc'],
    verification_status: 'verified',
    last_verified_on: '2026-10-28',
    hours_note_en: 'Official hours 9:00 AM – 3:00 PM (Mon–Fri). Confirm on-site.',
    hours_note_ur: 'صبح 9 سے سہ پہر 3 بجے (پیر تا جمعہ)۔ اوقات کی تصدیق کاؤنٹر سے کریں۔',
    notes_en: 'Serves Gulshan-e-Iqbal, Jamshed Town, Ferozabad, and Bahadurabad residents.',
    notes_ur: 'گلشنِ اقبال، جمشید ٹاؤن اور فیروز آباد کے رہائشیوں کے لیے مختص۔'
  },
  {
    id: 'OFF_DC_CENTRAL',
    name_en: 'Deputy Commissioner Office (Karachi Central)',
    name_ur: 'ڈپٹی کمشنر آفس (کراچی وسطی / سینٹرل)',
    office_type: 'dc_office',
    district: 'Karachi Central',
    district_key: 'karachi_central',
    address_en: 'Shahrah-e-Sher Shah Suri, Block J, North Nazimabad, Karachi',
    address_ur: 'شاہراہِ شیر شاہ سوری، بلاک جے، نارتھ ناظم آباد، کراچی',
    lat: 24.9419,
    lng: 67.0392,
    services: ['domicile_prc'],
    verification_status: 'verified',
    last_verified_on: '2026-10-30',
    hours_note_en: 'Official hours 9:00 AM – 3:00 PM (Mon–Fri). Confirm on-site.',
    hours_note_ur: 'صبح 9 سے سہ پہر 3 بجے (پیر تا جمعہ)۔',
    notes_en: 'High volume branch. Arrive before 10:00 AM for early token sequence.',
    notes_ur: 'رش زیادہ ہوتا ہے، صبح جلد تشریف لائیں۔'
  },
  {
    id: 'OFF_DC_WEST',
    name_en: 'Deputy Commissioner Office (Karachi West)',
    name_ur: 'ڈپٹی کمشنر آفس (کراچی غربی / ویسٹ)',
    office_type: 'dc_office',
    district: 'Karachi West',
    district_key: 'karachi_west',
    address_en: 'SITE Area, near Manghopir Road / Metroville, Karachi',
    address_ur: 'سائٹ ایریا، منگھوپیر روڈ نزد میٹروول، کراچی',
    lat: 24.9085,
    lng: 67.0012,
    services: ['domicile_prc'],
    verification_status: 'verified',
    last_verified_on: '2026-10-25',
    hours_note_en: 'Official hours 9:00 AM – 3:00 PM (Mon–Fri). Confirm on-site.',
    hours_note_ur: 'صبح 9 سے سہ پہر 3 بجے (پیر تا جمعہ)۔',
    notes_en: 'Handles Orangi, Baldia, and Manghopir sub-divisions.',
    notes_ur: 'اورنگی، بلدیہ اور منگھوپیر کی حدود کے لیے۔'
  },
  {
    id: 'OFF_DC_KEAMARI',
    name_en: 'Deputy Commissioner Office (Karachi Keamari)',
    name_ur: 'ڈپٹی کمشنر آفس (کیماڑی / نواں ضلع)',
    office_type: 'dc_office',
    district: 'Karachi Keamari',
    district_key: 'karachi_keamari',
    address_en: 'Mauripur Road / Harbour Sub-division, Keamari, Karachi',
    address_ur: 'ماری پور روڈ / ہاربر سب ڈویژن، کیماڑی، کراچی',
    lat: 24.8322,
    lng: 66.9741,
    services: ['domicile_prc'],
    verification_status: 'unverified',
    last_verified_on: '2026-10-10',
    hours_note_en: 'Hours subject to local administrative scheduling. Confirm with office.',
    hours_note_ur: 'اوقات دفتری شیڈول کے مطابق تبدیل ہو سکتے ہیں۔ کاؤنٹر سے تصدیق کریں۔',
    notes_en: 'New district office. Some older archives may still reside at DC West.',
    notes_ur: 'نیا ضلعی دفتر۔ بعض پرانے ریکارڈز کی تصدیق ڈی سی ویسٹ سے مانگی جا سکتی ہے۔'
  },
  {
    id: 'OFF_DC_KORANGI',
    name_en: 'Deputy Commissioner Office (Karachi Korangi)',
    name_ur: 'ڈپٹی کمشنر آفس (کورنگی)',
    office_type: 'dc_office',
    district: 'Karachi Korangi',
    district_key: 'karachi_korangi',
    address_en: 'Near Shah Faisal Colony Flyover / Korangi Sector 31-D, Karachi',
    address_ur: 'نزد شاہ فیصل کالونی فلائی اوور / سیکٹر 31-ڈی کورنگی، کراچی',
    lat: 24.8711,
    lng: 67.1422,
    services: ['domicile_prc'],
    verification_status: 'verified',
    last_verified_on: '2026-10-22',
    hours_note_en: 'Official hours 9:00 AM – 3:00 PM (Mon–Fri).',
    hours_note_ur: 'صبح 9 سے سہ پہر 3 بجے (پیر تا جمعہ)۔',
    notes_en: 'Serves Landhi, Shah Faisal, and Korangi industrial area.',
    notes_ur: 'لانڈھی، شاہ فیصل اور کورنگی کے مکینوں کے لیے۔'
  },
  {
    id: 'OFF_DC_MALIR',
    name_en: 'Deputy Commissioner Office (Karachi Malir)',
    name_ur: 'ڈپٹی کمشنر آفس (ملیر)',
    office_type: 'dc_office',
    district: 'Karachi Malir',
    district_key: 'karachi_malir',
    address_en: 'National Highway, near Malir Court & Kala Board, Malir, Karachi',
    address_ur: 'قومی شاہراہ، نزد ملیر کورٹ و کالا بورڈ، ملیر، کراچی',
    lat: 24.8872,
    lng: 67.1895,
    services: ['domicile_prc'],
    verification_status: 'verified',
    last_verified_on: '2026-10-18',
    hours_note_en: 'Official hours 9:00 AM – 3:00 PM (Mon–Fri).',
    hours_note_ur: 'صبح 9 سے سہ پہر 3 بجے (پیر تا جمعہ)۔',
    notes_en: 'Serves Bin Qasim, Gadap, Airport, and Malir Cantonment.',
    notes_ur: 'بن قاسم، گڈاپ اور ملیر کینٹ کے رہائشیوں کے لیے۔'
  },

  // ---------------- NADRA MEGA CENTRES (CNIC) ----------------
  {
    id: 'OFF_NADRA_DHA',
    name_en: 'NADRA Mega Centre (DHA Phase 4)',
    name_ur: 'نادرا میگا سینٹر (ڈی ایچ اے فیز 4)',
    office_type: 'nadra_centre',
    district: 'Karachi South',
    district_key: 'karachi_south',
    address_en: 'Commercial Avenue, Phase 4, Defence Housing Authority, Karachi',
    address_ur: 'کمرشل ایونیو، فیز 4، ڈیفنس، کراچی',
    lat: 24.8194,
    lng: 67.0547,
    services: ['first_cnic', 'frc'],
    verification_status: 'verified',
    last_verified_on: '2026-11-04',
    hours_note_en: '24/7 round-the-clock operations reported. Verify shift availability for first-time biometrics.',
    hours_note_ur: '24 گھنٹے فعال ہونے کی اطلاع ہے۔ رات کی شفٹ میں تصدیق کاؤنٹر کھلا ہونے کی تسلی کر لیں۔',
    notes_en: 'Modern air-conditioned facility with dedicated female and senior citizen counters.',
    notes_ur: 'جدید سہولیات، خواتین اور بزرگ شہریوں کے لیے الگ کاؤنٹرز۔'
  },
  {
    id: 'OFF_NADRA_NORTH_NAZIMABAD',
    name_en: 'NADRA Mega Centre (North Nazimabad)',
    name_ur: 'نادرا میگا سینٹر (نارتھ ناظم آباد)',
    office_type: 'nadra_centre',
    district: 'Karachi Central',
    district_key: 'karachi_central',
    address_en: 'Block L, Shahrah-e-Jahangir, near Five Star Chowrangi, North Nazimabad, Karachi',
    address_ur: 'بلاک ایل، شاہراہِ جہانگیر، نزد فائیو اسٹار چورنگی، نارتھ ناظم آباد، کراچی',
    lat: 24.9385,
    lng: 67.0511,
    services: ['first_cnic', 'frc'],
    verification_status: 'verified',
    last_verified_on: '2026-11-04',
    hours_note_en: '24/7 operating schedule. High traffic during daytime.',
    hours_note_ur: '24 گھنٹے کھلا رہتا ہے۔ دن کے اوقات میں رش زیادہ ہوتا ہے۔',
    notes_en: 'Executive and standard token lines available. Blood relative witness must be present.',
    notes_ur: 'ایگزیکٹو اور نارمل کاؤنٹرز دستیاب ہیں۔ خونی گواہ کی موجودگی لازمی ہے۔'
  },
  {
    id: 'OFF_NADRA_SIEMENS',
    name_en: 'NADRA Mega Centre (Siemens Chowrangi / SITE)',
    name_ur: 'نادرا میگا سینٹر (سیمنز چورنگی، سائٹ ایریا)',
    office_type: 'nadra_centre',
    district: 'Karachi West',
    district_key: 'karachi_west',
    address_en: 'Near Siemens Chowrangi, Estate Avenue, SITE, Karachi',
    address_ur: 'نزد سیمنز چورنگی، اسٹیٹ ایونیو، سائٹ، کراچی',
    lat: 24.8988,
    lng: 67.0092,
    services: ['first_cnic', 'frc'],
    verification_status: 'verified',
    last_verified_on: '2026-11-02',
    hours_note_en: '24/7 operations reported. Off-peak recommended (10 PM - 7 AM).',
    hours_note_ur: '24 گھنٹے کھلا رہتا ہے۔ رات 10 سے صبح 7 بجے کے درمیان کم رش ہوتا ہے۔',
    notes_en: 'Serves West, Keamari, and Baldia applicants.',
    notes_ur: 'ضلع ویسٹ، کیماڑی اور بلدیہ کے شہریوں کے لیے انتہائی موزوں۔'
  },
  {
    id: 'OFF_RPO_SADDAR',
    name_en: 'Regional Passport Office (RPO) Saddar Karachi',
    name_ur: 'ریجنل پاسپورٹ آفس (صدر، کراچی)',
    office_type: 'passport_office',
    district: 'Karachi South',
    district_key: 'karachi_south',
    address_en: 'Preedy Street, Saddar, Karachi South',
    address_ur: 'پریڈی اسٹریٹ، صدر، کراچی جنوبی',
    lat: 24.8601,
    lng: 67.0264,
    services: ['passport'],
    verification_status: 'verified',
    last_verified_on: '2026-11-08',
    hours_note_en: 'Mon-Thu: 8:00 AM - 1:00 PM, Fri: 8:00 AM - 12:00 PM',
    hours_note_ur: 'پیر تا جمعرات صبح 8 سے دوپہر 1، جمعہ صبح 8 سے 12 بجے',
    notes_en: 'Primary regional office for Machine Readable Passport (MRP) and e-Passport issuance.',
    notes_ur: 'مشین ریڈ ایبل پاسپورٹ اور ای پاسپورٹ کا مرکزی دفتر۔'
  },
  {
    id: 'OFF_RPO_AWAMI',
    name_en: 'Regional Passport Office Awami Markaz (East)',
    name_ur: 'ریجنل پاسپورٹ آفس عوامی مرکز (شاہراہِ فیصل، ایسٹ)',
    office_type: 'passport_office',
    district: 'Karachi East',
    district_key: 'karachi_east',
    address_en: 'Awami Markaz, Main Sharea Faisal, Karachi East',
    address_ur: 'عوامی مرکز، مین شاہراہِ فیصل، کراچی شرقی',
    lat: 24.8698,
    lng: 67.0822,
    services: ['passport'],
    verification_status: 'verified',
    last_verified_on: '2026-11-08',
    hours_note_en: 'Weekdays: 8:30 AM - 1:30 PM (Token counter closes at 12:30 PM)',
    hours_note_ur: 'پیر تا جمعہ صبح 8:30 سے دوپہر 1:30 بجے تک کھلا رہتا ہے',
    notes_en: 'Serves residents of East, Korangi, and Malir districts.',
    notes_ur: 'ضلع ایسٹ، کورنگی اور ملیر کے رہائشیوں کے لیے پاسپورٹ کاؤنٹر۔'
  },
  {
    id: 'OFF_EPO_CLIFTON',
    name_en: 'Executive Passport Office (EPO) Clifton',
    name_ur: 'ایگزیکٹو پاسپورٹ آفس کلفٹن',
    office_type: 'passport_office',
    district: 'Karachi South',
    district_key: 'karachi_south',
    address_en: 'Block 4, Clifton, near Bilawal House, Karachi South',
    address_ur: 'بلاک 4، کلفٹن، نزد بلاول ہاؤس، کراچی',
    lat: 24.8189,
    lng: 67.0321,
    services: ['passport'],
    verification_status: 'verified',
    last_verified_on: '2026-11-08',
    hours_note_en: 'Mon-Fri: 9:00 AM - 2:00 PM (Executive premium processing)',
    hours_note_ur: 'پیر تا جمعہ صبح 9 سے دوپہر 2 بجے (ایگزیکٹو فاسٹ ٹریک)',
    notes_en: 'Executive branch with expedited counter processing.',
    notes_ur: 'فاسٹ ٹریک پاسپورٹ پروسیسنگ کے لیے مخصوص ایگزیکٹو برانچ۔'
  }
];

export const CURATED_FAQS = [
  {
    id: 'FAQ1',
    question_en: 'What is the exact legal difference between Domicile and PRC in Sindh?',
    question_ur: 'سندھ میں ڈومیسائل اور پی آر سی میں اصل قانونی فرق کیا ہے؟',
    answer_en: 'Per Sindh High Court caselaw: Domicile is issued under the Federal Pakistan Citizenship Act 1951 to certify long-term provincial citizenship domicile. The Permanent Residence Certificate (PRC) is governed separately under the Sindh PRC Rules 1971. For university admissions (medical/engineering) and provincial job quotas in Sindh, PRC Form-C is the legally required instrument, though both are typically processed together.',
    answer_ur: 'سندھ ہائی کورٹ کے فیصلے کے مطابق: ڈومیسائل پاکستان سٹیزن شپ ایکٹ 1951 کے تحت بنتا ہے جبکہ پی آر سی سندھ رولز 1971 کے تحت۔ تعلیمی داخلوں اور نوکری کے کوٹے کے لیے پی آر سی فارم سی قانونی طور پر ناگزیر ہے۔',
    source_id: 'S1',
    verified: true
  },
  {
    id: 'FAQ2',
    question_en: 'What is the official fee for Domicile and PRC?',
    question_ur: 'ڈومیسائل اور پی آر سی کی سرکاری فیس کتنی ہے؟',
    answer_en: 'Fee status: NOT OFFICIALLY VERIFIED by online schedule. Fees are paid via government treasury challan vouchers (NBP / Sindh Bank). Secondary websites report varying figures between Rs. 200 and Rs. 500. We do not invent fee amounts: please confirm the exact current challan amount at your DC office counter.',
    answer_ur: 'فیس کی سرکاری تصدیق آن لائن دستیاب نہیں۔ فیس سرکاری چالان کے ذریعے بینک میں جمع ہوتی ہے۔ درست رقم کے لیے ڈی سی آفس چالان کاؤنٹر سے تصدیق کریں۔',
    source_id: 'S6',
    verified: false
  },
  {
    id: 'FAQ3',
    question_en: 'Can a first-time 18-year-old applicant get a CNIC through the PakID app?',
    question_ur: 'کیا 18 سال کا نیا امیدوار پاک آئی ڈی ایپ سے شناختی کارڈ بنوا سکتا ہے؟',
    answer_en: 'Per NADRA PakID specifications: A first-time CNIC can only be processed online if the applicant’s biometrics (fingerprints and photo) were previously captured and linked during Smart B-Form issuance. If biometrics are not in the database, the applicant and a blood-relative witness must visit a NADRA Centre in person.',
    answer_ur: 'نادرا کے مطابق: اگر بے فارم پر پہلے فنگر پرنٹس کا اندراج نہیں ہوا تھا، تو پاک آئی ڈی ایپ سے کارڈ نہیں بن سکتا۔ نادرا سینٹر جانا اور خونی رشتے دار کی تصدیق لازمی ہے۔',
    source_id: 'S4',
    verified: true
  },
  {
    id: 'FAQ4',
    question_en: 'I live in District Keamari, but my father’s Domicile was issued in DC West. What should I do?',
    question_ur: 'میں کیماڑی میں رہتا ہوں لیکن والد کا ڈومیسائل ڈی سی ویسٹ کا بنا تھا۔ اب کیا کروں؟',
    answer_en: 'Since District Keamari was recently carved out from Karachi West, bring your residence utility bills clearly proving your home is in Keamari. DC Keamari will process your file, but may require an internal record verification or old file reference from DC West. Start at DC Keamari.',
    answer_ur: 'کیماڑی چونکہ ویسٹ سے الگ ہو کر بنا ہے، لہٰذا موجودہ ایڈریس کے یوٹیلیٹی بلز کے ساتھ ڈی سی کیماڑی میں فائل جمع کروائیں، پرانی فائل کا حوالہ ساتھ رکھیں۔',
    source_id: 'S5',
    verified: false
  }
,
  {
    id: 'FAQ5',
    question_en: 'What documents are required for passport renewal?',
    question_ur: 'پاسپورٹ کی تجدید کے لیے کیا دستاویزات درکار ہیں؟',
    answer_en: 'For passport renewal, bring your original valid CNIC/Smart Card, previous original passport along with copies of its first 4 pages, and the paid National Bank challan receipt or Passport Fee Asaan app 1Link token. No photos are required as digital photos and biometrics are captured live at the RPO counter.',
    answer_ur: 'پاسپورٹ کی تجدید کے لیے اصل درست شناختی کارڈ، سابقہ اصل پاسپورٹ بمع ابتدائی چار صفحات کی کاپیاں، اور فیس کی رسید درکار ہے۔ تصاویر لانے کی ضرورت نہیں ہوتی کیونکہ تصویر کاؤنٹر پر لی جاتی ہے۔',
    source_id: 'S7',
    verified: true
  },
  {
    id: 'FAQ6',
    question_en: 'What is the difference between FRC By Birth and FRC By Marriage?',
    question_ur: 'پیدائشی اور ازدواجی فیملی رجسٹریشن سرٹیفکیٹ (ایف آر سی) میں کیا فرق ہے؟',
    answer_en: 'FRC By Birth reflects your biological family tree including your parents and siblings. FRC By Marriage reflects your marital family unit including yourself, your spouse, and your registered children. Both are authenticated directly against NADRA centralized citizen database.',
    answer_ur: 'پیدائشی ایف آر سی آپ کے والدین اور بہن بھائیوں کا شجرہ ظاہر کرتا ہے۔ جبکہ ازدواجی ایف آر سی آپ کی اہلیہ/شوہر اور بچوں کی تفصیل ظاہر کرتا ہے۔ دونوں نادرا کے مرکزی ڈیٹا بیس سے تصدیق شدہ ہوتے ہیں۔',
    source_id: 'S8',
    verified: true
  }
];
