export type Language = 'en' | 'ur';

export const I18N = {
  en: {
    app_name: 'CitizenEase',
    app_subtitle: 'Karachi Citizen Preparation Layer',
    one_line_pitch: 'Tells you exactly what to bring, what is missing, and where to go before you queue.',
    persistent_disclaimer: 'Guidance & preparation only. Not an official government portal, legal authority, or data store for CNICs.',
    nav_services: 'Services',
    nav_how_it_works: 'How It Works',
    nav_offices: 'DC & NADRA Offices',
    nav_sources: 'Verified Sources',
    nav_saved: 'Saved Checklist',
    
    // Status labels (paired with icons)
    status_verified: 'Verified Rule',
    status_unverified: 'Unverified / Confirm with Office',
    status_mandatory: 'Mandatory',
    status_conditional: 'Conditional',
    status_optional: 'Optional',
    status_have: 'I Have This',
    status_missing: 'Missing',
    status_not_sure: 'Not Sure',

    // Hero & Discovery
    hero_badge: 'Karachi Sindh Citizen Civic Layer · Version 2026',
    hero_title_lead: 'Prepare Before You Queue.',
    hero_title_accent: 'Never Return Empty-Handed.',
    hero_desc: 'Get a personalized, legally verified document checklist for your Karachi Domicile, PRC, or First-Time CNIC before stepping into a DC or NADRA office.',
    search_placeholder: 'Describe your need (e.g. "I need proof I belong to Karachi for college admission", "Turning 18 next week")...',
    ask_ai_discovery_btn: 'Match Service',
    popular_searches: 'Popular searches:',
    popular_tag_1: 'Domicile vs PRC differences',
    popular_tag_2: 'First-time CNIC at 18',
    popular_tag_3: 'District Keamari transfer issue',
    popular_tag_4: 'Sindh University admission quota',

    // Service Cards
    services_heading: 'Select a Citizen Service to Prepare',
    services_subheading: 'Deterministic rules evaluate your specific situation to generate your exact required paperwork.',
    start_checklist_btn: 'Start Guided Checklist',
    view_details_btn: 'Legal Details & Distinction',
    verified_rules_count: 'verified requirements',
    unverified_rules_count: 'items requiring office confirmation',

    // Questionnaire
    questionnaire_heading: 'Guided Situation Assessment',
    questionnaire_subheading: 'Your answers determine exactly which documents and steps apply to your case.',
    step_indicator: 'Question',
    of_steps: 'of',
    btn_back: 'Back',
    btn_next: 'Continue',
    btn_generate_checklist: 'Generate My Checklist',
    review_answers: 'Review Your Details',
    edit_answer: 'Edit',

    // Checklist Hub
    checklist_heading: 'Your Personalized Document Checklist',
    readiness_score: 'Readiness Score',
    score_formula_note: 'Calculated strictly from verified mandatory requirements. Unverified or optional steps are excluded from the score.',
    btn_print: 'Print / Save as PDF',
    btn_open_assistant: 'Ask CitizenEase AI',
    btn_locate_office: 'Where to Submit',
    sec_verified_mandatory: 'Verified Mandatory Documents',
    sec_verified_mandatory_desc: 'Confirmed with official court rules or DC office directives. Required for submission.',
    sec_conditional: 'Conditional Documents',
    sec_conditional_desc: 'Required based on your status (e.g. student certificates, marriage documents).',
    sec_unverified: 'Unverified / Confirm with Counter',
    sec_unverified_desc: 'Rules or fees in flux. Inspect at office notice board before queueing.',
    why_needed_label: 'Why is this needed?',
    source_label: 'Primary Source:',
    last_verified: 'Last verified:',

    // AI Assistant
    assistant_title: 'CitizenEase Grounded Guide',
    assistant_desc: 'Grounded strictly in verified Karachi rules & court records. Never hallucinates fees.',
    assistant_warning: 'Privacy notice: Never enter your 13-digit CNIC number or personal confidential data.',
    suggested_questions_title: 'Suggested verified inquiries:',
    assistant_input_placeholder: 'Ask in English or Urdu (e.g., "Why do I need a matric certificate?")...',
    btn_send: 'Ask',
    btn_clear: 'Clear Chat',
    official_confirmation_alert: 'Official Confirmation Recommended: This topic has unverified nuances. Please verify directly with the counter officer.',
    citations_label: 'Verified Records Cited:',

    // Office Locator
    offices_heading: 'Karachi Office Directory & Locator',
    offices_subheading: 'Find your designated District Deputy Commissioner Office or NADRA Mega Centre.',
    filter_all: 'All Offices',
    filter_dc: 'Deputy Commissioner Offices (Domicile/PRC)',
    filter_nadra: 'NADRA Mega Centres (CNIC)',
    search_offices: 'Filter by district or area name...',
    open_in_gmaps: 'Open in Google Maps / Directions',
    office_hours: 'Reported Hours',
    office_jurisdiction: 'Jurisdiction & Notes',

    // Sources Transparency
    sources_heading: 'Sources & Legal Verification Transparency',
    sources_subheading: 'Every single requirement in CitizenEase is tracked back to a physical office visit, Sindh High Court ruling, or official government publication.',
    source_type: 'Evidence Type',
    authority: 'Issuing Authority',
    verification_date: 'Verification Date'
  },
  ur: {
    app_name: 'سٹیزن ایز',
    app_subtitle: 'شہری رہنمائی و تیاری پلیٹ فارم',
    one_line_pitch: 'قطار میں کھڑے ہونے سے پہلے جانیں کہ کون سی دستاویزات لانی ہیں اور کہاں جانا ہے۔',
    persistent_disclaimer: 'صرف رہنمائی اور پیشگی تیاری کے لیے۔ یہ کوئی سرکاری ادارہ، قانونی عدالت یا شناختی کارڈ کا ڈیٹا بیس نہیں ہے۔',
    nav_services: 'خدمات',
    nav_how_it_works: 'طریقہ کار',
    nav_offices: 'ڈی سی و نادرا دفاتر',
    nav_sources: 'تصدیق شدہ ذرائع',
    nav_saved: 'محفوظ چیک لسٹ',

    // Status labels
    status_verified: 'تصدیق شدہ قاعدہ',
    status_unverified: 'غیر تصدیق شدہ / دفتر سے معلوم کریں',
    status_mandatory: 'لازمی',
    status_conditional: 'مشروط',
    status_optional: 'اختیاری',
    status_have: 'میرے پاس موجود ہے',
    status_missing: 'موجود نہیں',
    status_not_sure: 'یقین نہیں',

    // Hero & Discovery
    hero_badge: 'کراچی سندھ شہری رہنمائی · ایڈیشن 2026',
    hero_title_lead: 'دفتر جانے سے پہلے تیاری کریں۔',
    hero_title_accent: 'کبھی خالی ہاتھ واپس نہ آئیں۔',
    hero_desc: 'ڈپٹی کمشنر آفس یا نادرا جانے سے قبل اپنے ڈومیسائل، پی آر سی یا پہلے شناختی کارڈ کے لیے قانونی اور درست دستاویزات کی چیک لسٹ حاصل کریں۔',
    search_placeholder: 'اپنی ضرورت بیان کریں (مثلاً: "مجھے یونیورسٹی داخلے کے لیے کراچی کا ثبوت چاہیے"، "18 سال کی عمر ہو گئی ہے")...',
    ask_ai_discovery_btn: 'سروس تلاش کریں',
    popular_searches: 'اہم موضوعات:',
    popular_tag_1: 'ڈومیسائل اور پی آر سی میں فرق',
    popular_tag_2: '18 سال کی عمر میں پہلا کارڈ',
    popular_tag_3: 'ضلع کیماڑی فائل ٹرانسفر کا مسئلہ',
    popular_tag_4: 'سندھ یونیورسٹی میڈیکل کوٹہ',

    // Service Cards
    services_heading: 'شہری سروس کا انتخاب کریں',
    services_subheading: 'آپ کے جوابات کی روشنی میں فوری طور پر مطلوبہ دستاویزات کا تعین کیا جاتا ہے۔',
    start_checklist_btn: 'چیک لسٹ شروع کریں',
    view_details_btn: 'قانونی معلومات و فرق',
    verified_rules_count: 'تصدیق شدہ تقاضے',
    unverified_rules_count: 'دفتر سے تصدیق طلب امور',

    // Questionnaire
    questionnaire_heading: 'رہائشی صورتحال کا جائزہ',
    questionnaire_subheading: 'درست جوابات منتخب کریں تاکہ آپ کے لیے مخصوص لائحہ عمل تیار ہو۔',
    step_indicator: 'سوال',
    of_steps: 'از',
    btn_back: 'پیچھے',
    btn_next: 'آگے بڑھیں',
    btn_generate_checklist: 'میری چیک لسٹ بنائیں',
    review_answers: 'اپنے جوابات کا جائزہ لیں',
    edit_answer: 'ترمیم کریں',

    // Checklist Hub
    checklist_heading: 'آپ کی ذاتی دستاویزاتی چیک لسٹ',
    readiness_score: 'تیاری کا تناسب',
    score_formula_note: 'یہ اسکور صرف تصدیق شدہ لازمی کاغذات کی بنیاد پر شمار ہوتا ہے۔ غیر مصدقہ یا اختیاری امور اسکور کا حصہ نہیں۔',
    btn_print: 'پرنٹ کریں / پی ڈی ایف محفوظ کریں',
    btn_open_assistant: 'سٹیزن ایز اے آئی سے پوچھیں',
    btn_locate_office: 'جمع کروانے کا دفتر',
    sec_verified_mandatory: 'تصدیق شدہ لازمی دستاویزات',
    sec_verified_mandatory_desc: 'سندھ ہائی کورٹ اور ڈی سی آفس نوٹس بورڈ سے تصدیق شدہ۔ جمع کروانا لازمی ہے۔',
    sec_conditional: 'مشروط دستاویزات',
    sec_conditional_desc: 'امیدوار کی حالت (طالب علم، شادی شدہ وغیرہ) کے لحاظ سے درکار۔',
    sec_unverified: 'غیر تصدیق شدہ / کاؤنٹر سے معلوم کریں',
    sec_unverified_desc: 'فیس یا قواعد جن کی سرکاری آن لائن تصدیق نہیں۔ دفتر کے نوٹس بورڈ سے معلوم کریں۔',
    why_needed_label: 'یہ کیوں ضروری ہے؟',
    source_label: 'بنیادی ذریعہ:',
    last_verified: 'آخری تصدیق:',

    // AI Assistant
    assistant_title: 'سٹیزن ایز گائیڈ اسسٹنٹ',
    assistant_desc: 'صرف تصدیق شدہ کراچی ریکارڈز اور عدالتی فیصلوں پر مبنی رہنمائی۔ فیس کے من گھڑت اعدادوشمار نہیں دیتا۔',
    assistant_warning: 'رازداری کا خیال رکھیں: کبھی بھی 13 ہندسوں کا شناختی کارڈ نمبر نہ لکھیں۔',
    suggested_questions_title: 'پوچھے جانے والے اہم سوالات:',
    assistant_input_placeholder: 'اردو یا انگریزی میں پوچھیں (مثلاً: "مجھے میٹرک کی سند کیوں چاہیے؟")...',
    btn_send: 'ارسال',
    btn_clear: 'چیٹ صاف کریں',
    official_confirmation_alert: 'سرکاری دفتر سے تصدیق ضروری ہے: اس معاملے میں تبدیلیاں ممکن ہیں۔ براہِ کرم کاؤنٹر پر لازمی معلوم کریں۔',
    citations_label: 'مستند ذرائع کے حوالے:',

    // Office Locator
    offices_heading: 'کراچی ڈی سی و نادرا دفاتر ڈائرکٹری',
    offices_subheading: 'اپنے ضلع کے متعلقہ ڈپٹی کمشنر آفس یا نادرا میگا سینٹر کا پتہ اور اوقات جانیں۔',
    filter_all: 'تمام دفاتر',
    filter_dc: 'ڈپٹی کمشنر دفاتر (ڈومیسائل / پی آر سی)',
    filter_nadra: 'نادرا میگا سینٹرز (شناختی کارڈ)',
    search_offices: 'ضلع یا علاقے کے نام سے تلاش کریں...',
    open_in_gmaps: 'گوگل میپس میں راستہ دیکھیں',
    office_hours: 'سرکاری اوقات',
    office_jurisdiction: 'حدود و ضروری ہدایات',

    // Sources Transparency
    sources_heading: 'قانونی ذرائع اور تصدیقی ریکارڈ',
    sources_subheading: 'سٹیزن ایز کا ہر ایک قاعدہ سندھ ہائی کورٹ کے فیصلے، دفتری معائنے یا سرکاری گزٹ سے منسلک ہے۔',
    source_type: 'ثبوت کی قسم',
    authority: 'جاری کنندہ ادارہ',
    verification_date: 'تاریخ تصدیق'
  }
};
