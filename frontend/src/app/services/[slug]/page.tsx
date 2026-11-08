'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ServiceDetailResponse } from '@/lib/types';
import Link from 'next/link';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [data, setData] = useState<ServiceDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    api.getServiceDetail(slug)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="text-center py-12 text-sm text-gray-500">Loading service details...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm space-y-3">
        <p className="font-semibold">Unable to load service information</p>
        <p className="text-xs">{error || 'Unknown error'}</p>
        <Link href="/services" className="inline-block text-xs text-primary underline">
          ← Back to services
        </Link>
      </div>
    );
  }

  const { service, application_types, source_summary } = data;

  return (
    <div className="space-y-6 py-4">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500">
        <Link href="/services" className="hover:underline">Services</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">{service.title_en}</span>
      </div>

      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{service.title_en}</h1>
            <p className="text-sm font-nastaliq text-gray-600 mt-1">{service.title_ur}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {source_summary.verified_count} Verified Sources
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              {source_summary.unverified_count} Unverified
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-700 leading-relaxed">{service.description_en}</p>

        {/* Legal distinction highlight for Domicile & PRC */}
        {slug === 'domicile_prc' && (
          <div className="p-4 rounded-xl bg-surface-muted/60 border border-gray-200 space-y-2 text-xs">
            <span className="font-bold text-primary uppercase tracking-wider text-[11px]">
              ⚖️ High Court Legal Distinctions
            </span>
            <p className="text-gray-700">
              <strong>Domicile</strong> is issued under the <em>Pakistan Citizenship Act 1951</em> to prove citizenship status.
            </p>
            <p className="text-gray-700">
              <strong>PRC (Permanent Residence Certificate)</strong> is issued under the <em>Sindh PRC Rules 1971</em> and is strictly mandated for educational admissions and Sindh provincial job quotas.
            </p>
          </div>
        )}

        {/* Application Types */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Available Tracks</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {application_types.map((type) => (
              <div key={type.id} className="p-3 border border-gray-200 rounded-lg text-xs bg-gray-50/50">
                <span className="font-semibold block text-primary">{type.title_en}</span>
                <span className="text-gray-500 font-nastaliq block text-[11px] mt-0.5">{type.title_ur}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Start questionnaire CTA */}
        <div className="pt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Last verified on: {source_summary.last_verified_on || '2026-11-08'}
          </span>
          <button
            onClick={() => router.push(`/questionnaire?service=${slug}`)}
            className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
          >
            Start Questionnaire →
          </button>
        </div>
      </div>
    </div>
  );
}
