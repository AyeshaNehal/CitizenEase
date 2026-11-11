'use client';

import React, { useState, useEffect } from 'react';
import { Language, I18N } from '@/lib/i18n';
import { ServiceSlug, SERVICES } from '@/data/catalog';
import {
  Calculator,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';

interface CostCalculatorProps {
  language: Language;
  defaultServiceSlug?: ServiceSlug;
}

interface FeeItemDto {
  id: string;
  label_en: string;
  label_ur: string;
  amount_pkr: number | null;
  verification_status: string;
  source_id: string;
  source_title: string;
  source_url?: string;
  last_verified_on: string;
  office_confirmation_note_en?: string;
  office_confirmation_note_ur?: string;
}

interface CostEstimateResponse {
  services: Array<{
    service_slug: string;
    service_title_en: string;
    service_title_ur: string;
    verified_fees: FeeItemDto[];
    unverified_fees: FeeItemDto[];
    subtotal_verified: number | null;
    has_unverified: boolean;
  }>;
  total_verified_amount: number | null;
  has_verified: boolean;
  has_unverified: boolean;
  all_verified: boolean;
  summary_label_en: string;
  summary_label_ur: string;
  not_confirmed_block: {
    label_en: string;
    label_ur: string;
    items: FeeItemDto[];
  };
  disclaimer_en: string;
  disclaimer_ur: string;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  language,
  defaultServiceSlug = 'passport'
}) => {
  const isUrdu = language === 'ur';

  const [selectedService, setSelectedService] = useState<ServiceSlug>(defaultServiceSlug);

  // Passport options
  const [passportPages, setPassportPages] = useState<number>(36);
  const [passportValidity, setPassportValidity] = useState<number>(5);
  const [passportUrgency, setPassportUrgency] = useState<string>('normal');

  // Smart card options
  const [smartCardTrack, setSmartCardTrack] = useState<string>('normal');

  // B-Form options
  const [bformTrack, setBformTrack] = useState<string>('normal');

  const [estimate, setEstimate] = useState<CostEstimateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch estimate from API
  useEffect(() => {
    let isCancelled = false;

    async function fetchEstimate() {
      setIsLoading(true);

      const options: Record<string, any> = {};
      if (selectedService === 'passport') {
        options.pages = passportPages;
        options.validity_years = passportValidity;
        options.urgency = passportUrgency;
      } else if (selectedService === 'smart_card') {
        options.track = smartCardTrack;
      } else if (selectedService === 'b_form') {
        options.track = bformTrack;
      }

      const payload = {
        items: [
          {
            service_slug: selectedService,
            options
          }
        ]
      };

      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/costs/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) {
            setEstimate(data);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('API cost fetch failed, computing client fallback:', err);
      }

      // Fallback calculation in client
      if (!isCancelled) {
        let total: number | null = null;
        let verifiedFees: FeeItemDto[] = [];
        let unverifiedFees: FeeItemDto[] = [];

        if (selectedService === 'passport') {
          let amt = 4500;
          if (passportPages === 36 && passportValidity === 5 && passportUrgency === 'urgent') amt = 7500;
          if (passportPages === 36 && passportValidity === 10 && passportUrgency === 'normal') amt = 6700;
          if (passportPages === 36 && passportValidity === 10 && passportUrgency === 'urgent') amt = 11200;
          if (passportPages === 72 && passportValidity === 5 && passportUrgency === 'normal') amt = 8200;
          if (passportPages === 72 && passportValidity === 5 && passportUrgency === 'urgent') amt = 13500;
          if (passportPages === 100 && passportValidity === 5 && passportUrgency === 'normal') amt = 9000;
          if (passportPages === 100 && passportValidity === 5 && passportUrgency === 'urgent') amt = 18000;

          verifiedFees = [{
            id: 'fee-pass',
            label_en: `Passport ${passportPages} Pages / ${passportValidity}-Year Validity (${passportUrgency.toUpperCase()})`,
            label_ur: `پاسپورٹ ${passportPages} صفحات / ${passportValidity} سال میعاد (${passportUrgency === 'urgent' ? 'ارجنٹ' : 'نارمل'})`,
            amount_pkr: amt,
            verification_status: 'verified',
            source_id: 'SRC-DGIP-OFFICIAL',
            source_title: 'DGI&P Official Fee Schedule',
            source_url: 'https://passport.gov.pk',
            last_verified_on: '2026-11-08'
          }];
          total = amt;
        } else if (selectedService === 'frc') {
          verifiedFees = [{
            id: 'fee-frc-std',
            label_en: 'NADRA Family Registration Certificate (FRC) Official Issuance',
            label_ur: 'نادرا فیملی رجسٹریشن سرٹیفکیٹ (ایف آر سی) سرکاری فیس',
            amount_pkr: 1000,
            verification_status: 'verified',
            source_id: 'SRC-NADRA-FRC-RULES',
            source_title: 'NADRA Schedule of Charges',
            source_url: 'https://www.nadra.gov.pk',
            last_verified_on: '2026-11-08'
          }];
          unverifiedFees = [{
            id: 'fee-frc-exec',
            label_en: 'Executive Counter Fast-Track Service Surcharge',
            label_ur: 'ایگزیکٹو کاؤنٹر فاسٹ ٹریک سروس چارج',
            amount_pkr: null,
            verification_status: 'unverified',
            source_id: 'SRC-NADRA-FRC-RULES',
            source_title: 'NADRA Schedule of Charges',
            last_verified_on: '2026-11-08',
            office_confirmation_note_en: 'Confirm with office',
            office_confirmation_note_ur: 'دفتر سے تصدیق کریں'
          }];
          total = 1000;
        } else if (selectedService === 'first_cnic') {
          verifiedFees = [{
            id: 'fee-cnic-std',
            label_en: 'NADRA Standard Normal Track (Free first-time issuance)',
            label_ur: 'نادرا سٹینڈرڈ نارمل ٹریک (پہلی بار مفت اجرا)',
            amount_pkr: 0,
            verification_status: 'verified',
            source_id: 'SRC-NADRA-PAKID',
            source_title: 'NADRA PakID Citizen Portal',
            last_verified_on: '2026-11-08'
          }];
          unverifiedFees = [{
            id: 'fee-cnic-stamp',
            label_en: 'Gazetted Officer Form Attestation / Notary Fee',
            label_ur: 'سرکاری افسر تصدیق یا نوٹری فیس',
            amount_pkr: null,
            verification_status: 'unverified',
            source_id: 'SRC-NADRA-PAKID',
            source_title: 'NADRA Portal',
            last_verified_on: '2026-11-08',
            office_confirmation_note_en: 'Confirm with office',
            office_confirmation_note_ur: 'دفتر سے تصدیق کریں'
          }];
          total = 0;
        } else if (selectedService === 'smart_card') {
          let amt = 750;
          if (smartCardTrack === 'urgent') amt = 1500;
          if (smartCardTrack === 'executive') amt = 2500;
          verifiedFees = [{
            id: 'fee-smart',
            label_en: `Smart CNIC (Chip) ${smartCardTrack.toUpperCase()} Track`,
            label_ur: `سمارٹ شناختی کارڈ ${smartCardTrack === 'urgent' ? 'ارجنٹ' : smartCardTrack === 'executive' ? 'ایگزیکٹو' : 'نارمل'}`,
            amount_pkr: amt,
            verification_status: 'verified',
            source_id: 'SRC-NADRA-SNIC',
            source_title: 'NADRA Smart Card Regulations',
            last_verified_on: '2026-11-08'
          }];
          total = amt;
        } else if (selectedService === 'b_form') {
          const amt = bformTrack === 'executive' ? 500 : 50;
          verifiedFees = [{
            id: 'fee-bform',
            label_en: `Child Registration Certificate (B-Form) ${bformTrack.toUpperCase()} Track`,
            label_ur: `چائلڈ رجسٹریشن سرٹیفکیٹ (ب فارم) ${bformTrack === 'executive' ? 'ایگزیکٹو' : 'نارمل'}`,
            amount_pkr: amt,
            verification_status: 'verified',
            source_id: 'SRC-NADRA-CRC-RULES',
            source_title: 'NADRA CRC Guidelines',
            last_verified_on: '2026-11-08'
          }];
          total = amt;
        } else {
          unverifiedFees = [{
            id: 'fee-unconfirmed',
            label_en: 'Official Government Treasury Challan / Processing Fee',
            label_ur: 'سرکاری خزانہ چالان / پروسیسنگ فیس',
            amount_pkr: null,
            verification_status: 'unverified',
            source_id: 'SRC-DC-SOUTH-SAMPLE',
            source_title: 'Official Counter Notice Board',
            last_verified_on: '2026-11-08',
            office_confirmation_note_en: 'Confirm with office',
            office_confirmation_note_ur: 'دفتر سے تصدیق کریں'
          }];
          total = null;
        }

        const has_unverified = unverifiedFees.length > 0;
        const has_verified = verifiedFees.length > 0;

        let summary_en = 'No verified fees yet. Confirm with the office';
        let summary_ur = 'ابھی تک کوئی فیس مصدقہ نہیں، دفتر سے تصدیق کریں';
        if (has_verified && has_unverified) {
          summary_en = `At least Rs ${total?.toLocaleString()} (verified fees only)`;
          summary_ur = `کم از کم ${total?.toLocaleString()} روپے (صرف مصدقہ فیسیں)`;
        } else if (has_verified && !has_unverified) {
          summary_en = `Rs ${total?.toLocaleString()}`;
          summary_ur = `${total?.toLocaleString()} روپے`;
        }

        setEstimate({
          services: [
            {
              service_slug: selectedService,
              service_title_en: SERVICES[selectedService]?.title_en || selectedService,
              service_title_ur: SERVICES[selectedService]?.title_ur || selectedService,
              verified_fees: verifiedFees,
              unverified_fees: unverifiedFees,
              subtotal_verified: total,
              has_unverified
            }
          ],
          total_verified_amount: total,
          has_verified,
          has_unverified,
          all_verified: has_verified && !has_unverified,
          summary_label_en: summary_en,
          summary_label_ur: summary_ur,
          not_confirmed_block: {
            label_en: 'Confirm with office',
            label_ur: 'دفتر سے تصدیق کریں',
            items: unverifiedFees
          },
          disclaimer_en: 'Estimate for preparation only, not an official quote.',
          disclaimer_ur: 'یہ تخمینہ صرف تیاری کے لیے ہے، سرکاری یا حتمی فیس کا دعویٰ نہیں۔'
        });
        setIsLoading(false);
      }
    }

    fetchEstimate();

    return () => {
      isCancelled = true;
    };
  }, [
    selectedService,
    passportPages,
    passportValidity,
    passportUrgency,
    smartCardTrack,
    bformTrack
  ]);

  const serviceKeys: ServiceSlug[] = [
    'passport',
    'first_cnic',
    'smart_card',
    'b_form',
    'frc',
    'domicile_prc',
    'birth_certificate'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              {isUrdu ? 'سرکاری فیس و لاگت کیلکولیٹر' : 'Official Fee & Cost Calculator'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              {isUrdu
                ? 'تمام فیسیں صرف مصدقہ سرکاری نوٹیفکیشن سے ظاہر ہوتی ہیں؛ غیر مصدقہ فیسیں الگ دکھائی جاتی ہیں'
                : 'Only verified statutory amounts are counted; unverified fees are kept in a separate confirmation block.'}
            </p>
          </div>
        </div>

        {/* Live Verified Estimate Badge */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 text-start md:text-end shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {isUrdu ? 'مصدقہ سرکاری فیس کا تخمینہ' : 'Verified Fee Estimate'}
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-400 mt-0.5">
            {isLoading ? (
              <span className="text-sm font-medium text-stone-400">...</span>
            ) : estimate ? (
              isUrdu ? estimate.summary_label_ur : estimate.summary_label_en
            ) : (
              '—'
            )}
          </div>
        </div>
      </div>

      {/* Service Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {serviceKeys.map((slug) => {
          const s = SERVICES[slug];
          const isSelected = selectedService === slug;
          return (
            <button
              key={slug}
              onClick={() => setSelectedService(slug)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[44px] flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#0C3E2E] dark:bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                  : 'bg-white dark:bg-[#102019] text-stone-700 dark:text-stone-300 border border-stone-200/90 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800'
              }`}
            >
              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
              <span>{isUrdu ? s?.title_ur || slug : s?.title_en || slug}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Options Picker */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#102019] border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{isUrdu ? 'سروس کے اختیارات منتخب کریں:' : 'Select Service Options & Tier:'}</span>
        </h3>

        {/* Passport Options */}
        {selectedService === 'passport' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                {isUrdu ? 'صفحات کی تعداد (Booklet Pages)' : 'Booklet Pages'}
              </label>
              <select
                value={passportPages}
                onChange={(e) => setPassportPages(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 min-h-[44px]"
              >
                <option value={36}>36 Pages (معیاری)</option>
                <option value={72}>72 Pages (کثرت سے سفر)</option>
                <option value={100}>100 Pages (بزنس ٹریول)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                {isUrdu ? 'میعاد (Validity Duration)' : 'Validity Duration'}
              </label>
              <select
                value={passportValidity}
                onChange={(e) => setPassportValidity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 min-h-[44px]"
              >
                <option value={5}>5 Years (5 سال)</option>
                <option value={10}>10 Years (10 سال)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                {isUrdu ? 'ڈلیوری کی رفتار (Processing Urgency)' : 'Processing Urgency'}
              </label>
              <select
                value={passportUrgency}
                onChange={(e) => setPassportUrgency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 min-h-[44px]"
              >
                <option value="normal">Normal (نارمل - تقریبًا 15 دن)</option>
                <option value="urgent">Urgent (ارجنٹ - تقریبًا 5 دن)</option>
              </select>
            </div>
          </div>
        )}

        {/* Smart Card Options */}
        {selectedService === 'smart_card' && (
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
              {isUrdu ? 'ڈلیوری کا زمرہ (Processing Track)' : 'Processing Track & Delivery Speed'}
            </label>
            <select
              value={smartCardTrack}
              onChange={(e) => setSmartCardTrack(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 min-h-[44px]"
            >
              <option value="normal">Normal (نارمل - 750 روپے)</option>
              <option value="urgent">Urgent (ارجنٹ - 1500 روپے)</option>
              <option value="executive">Executive Centre (ایگزیکٹو - 2500 روپے)</option>
            </select>
          </div>
        )}

        {/* B-Form Options */}
        {selectedService === 'b_form' && (
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
              {isUrdu ? 'نادرا کاؤنٹر ٹریک' : 'NADRA Processing Speed'}
            </label>
            <select
              value={bformTrack}
              onChange={(e) => setBformTrack(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 min-h-[44px]"
            >
              <option value="normal">Normal Track (نارمل - 50 روپے)</option>
              <option value="executive">Executive Mega Centre Track (ایگزیکٹو - 500 روپے)</option>
            </select>
          </div>
        )}

        {/* Other services info */}
        {(selectedService === 'domicile_prc' || selectedService === 'birth_certificate' || selectedService === 'frc' || selectedService === 'first_cnic') && (
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p>
              {isUrdu
                ? 'اس سروس کے سرکاری واجبات مقررہ بینک چالان یا نادرا فیس شیڈول کے مطابق ادا کیے جاتے ہیں۔ مصدقہ اور تصدیق طلب رقم ذیل میں دیکھی جا سکتی ہے۔'
                : 'Fees for this service are paid via official bank challan or standard NADRA schedule. Breakdown of verified vs unverified items is detailed below.'}
            </p>
          </div>
        )}

        {/* Breakdown Table */}
        {estimate && estimate.services[0] && (
          <div className="space-y-4 pt-4 border-t border-stone-100 dark:border-stone-800">
            {/* Section A: Verified Fees */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isUrdu ? 'مصدقہ سرکاری فیسیں (Verified Fees)' : 'Verified Statutory Fees'}</span>
                </span>
                <span>
                  {estimate.services[0].subtotal_verified !== null
                    ? `Rs ${estimate.services[0].subtotal_verified.toLocaleString()}`
                    : (isUrdu ? 'کوئی مصدقہ فیس نہیں' : 'No verified fees')}
                </span>
              </div>

              {estimate.services[0].verified_fees.length > 0 ? (
                <div className="space-y-2">
                  {estimate.services[0].verified_fees.map((fee) => (
                    <div
                      key={fee.id}
                      className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          {isUrdu ? fee.label_ur : fee.label_en}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 font-medium">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {fee.source_title}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {fee.last_verified_on}
                          </span>
                          {fee.source_url && (
                            <a
                              href={fee.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>Official URL</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="text-start sm:text-end shrink-0 font-bold text-emerald-900 dark:text-emerald-300 text-sm">
                        Rs {fee.amount_pkr?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                  {isUrdu
                    ? 'اس سروس کے لیے ابھی تک کوئی فیس مصدقہ نہیں ہے۔ دفتر سے تصدیق کریں۔'
                    : 'No verified fee amount recorded yet from an official gazette. Confirm with the office.'}
                </p>
              )}
            </div>

            {/* Section B: Unverified / Confirm with Office Block */}
            {estimate.services[0].unverified_fees.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{isUrdu ? 'غیر مصدقہ / دفتر سے تصدیق طلب (Not Yet Confirmed)' : 'Not Yet Confirmed (Separate Block)'}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px]">
                    {isUrdu ? 'دفتر سے تصدیق کریں' : 'Confirm with office'}
                  </span>
                </div>

                <div className="space-y-2">
                  {estimate.services[0].unverified_fees.map((fee) => (
                    <div
                      key={fee.id}
                      className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-stone-900 dark:text-stone-100">
                          {isUrdu ? fee.label_ur : fee.label_en}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-medium">
                            {fee.source_title}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {fee.last_verified_on}
                          </span>
                        </div>
                      </div>

                      <div className="text-start sm:text-end shrink-0">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-200/70 dark:bg-amber-900/50 text-amber-950 dark:text-amber-200 font-bold text-xs">
                          {isUrdu ? 'دفتر سے تصدیق کریں' : 'Confirm with office'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 space-y-1">
          <div className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-stone-500" />
            <span>{isUrdu ? 'قانونی وضاحت:' : 'Preparation Disclaimer:'}</span>
          </div>
          <p>
            {isUrdu
              ? 'یہ تخمینہ صرف شہری تیاری اور رہنمائی کے لیے ہے، سرکاری یا حتمی فیس کا دعویٰ نہیں۔ درست سرکاری فیس مجاز کاؤنٹر سے ادا کریں۔'
              : 'Estimate for preparation only, not an official quote. Final fees and treasury heads must be confirmed at the issuing office counter.'}
          </p>
        </div>
      </div>
    </div>
  );
};
