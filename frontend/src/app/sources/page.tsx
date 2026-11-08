'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSources('domicile_prc')
      .then((res) => {
        setSources(res);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-primary">Sources & Verification Register</h1>
        <p className="text-xs text-gray-600 mt-1">
          Complete transparency on where our rules, forms, and procedures come from. Every fact in CitizenEase has an audit trail.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500">Loading verified sources...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted/60 text-primary uppercase font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3">Source ID & Title</th>
                  <th className="p-3">Authority / Type</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Last Verified</th>
                  <th className="p-3">Notes & Legal Basis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sources.map((src) => (
                  <tr key={src.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-semibold text-primary">
                      {src.url ? (
                        <a href={src.url} target="_blank" rel="noreferrer" className="text-accent underline">
                          {src.title}
                        </a>
                      ) : (
                        src.title
                      )}
                      <span className="block text-[10px] text-gray-400 font-normal">{src.id}</span>
                    </td>
                    <td className="p-3 text-gray-600">
                      <div>{src.issuing_authority}</div>
                      <span className="text-[10px] text-gray-400 uppercase">{src.source_type}</span>
                    </td>
                    <td className="p-3">
                      {src.verification_status === 'verified' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-gray-500">{src.last_verified_on}</td>
                    <td className="p-3 text-gray-600 max-w-xs">{src.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
