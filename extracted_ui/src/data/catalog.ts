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

export interface Requirement {
  id: string;
  code: string;
  service_slug: 'domicile_prc' | 'first_cnic';
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
  office_type: 'dc_office' | 'nadra_centre';
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
  service_slug: 'domicile_prc' | 'first_cnic';
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
  slug: 'domicile_prc' | 'first_cnic';
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
    services: ['first_cnic'],
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
    services: ['first_cnic'],
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
    services: ['first_cnic'],
    verification_status: 'verified',
    last_verified_on: '2026-11-02',
    hours_note_en: '24/7 operations reported. Off-peak recommended (10 PM - 7 AM).',
    hours_note_ur: '24 گھنٹے کھلا رہتا ہے۔ رات 10 سے صبح 7 بجے کے درمیان کم رش ہوتا ہے۔',
    notes_en: 'Serves West, Keamari, and Baldia applicants.',
    notes_ur: 'ضلع ویسٹ، کیماڑی اور بلدیہ کے شہریوں کے لیے انتہائی موزوں۔'
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
];
