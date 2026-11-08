'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Office } from '@/lib/types';

export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [district, setDistrict] = useState<string>('');
  const [service, setService] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getOffices(service || undefined, district || undefined)
      .then(setOffices)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [district, service]);

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-primary">Karachi Submission Offices</h1>
        <p className="text-xs text-gray-600 mt-1">
          Hand-curated DC offices and NADRA Mega Centres. Direct navigation links with verified GPS coordinates.
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border border-gray-200 rounded-xl flex flex-wrap gap-3 items-center text-xs">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-gray-700">District:</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Karachi Districts</option>
            <option value="karachi_south">Karachi South</option>
            <option value="karachi_east">Karachi East</option>
            <option value="karachi_central">Karachi Central</option>
            <option value="karachi_west">Karachi West</option>
            <option value="malir">Malir</option>
            <option value="korangi">Korangi</option>
            <option value="keamari">Keamari</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-gray-700">Service:</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Services</option>
            <option value="domicile_prc">Domicile & PRC (DC Office)</option>
            <option value="first_cnic">First CNIC (NADRA)</option>
          </select>
        </div>
      </div>

      {/* Offices List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500">Loading offices...</div>
      ) : offices.length === 0 ? (
        <div className="p-8 text-center bg-white border border-gray-200 rounded-xl space-y-2">
          <p className="font-bold text-sm text-gray-700">No verified offices match your selected filters</p>
          <p className="text-xs text-gray-500">Please check the official portal or visit your district headquarters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offices.map((office) => {
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}`;
            return (
              <div key={office.id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
                      {office.district.replace('_', ' ')}
                    </span>
                    {office.verification_status === 'verified' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-100 text-amber-800">
                        Unverified
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-primary">{office.name}</h2>
                  <p className="text-xs text-gray-600">{office.address}</p>

                  {office.hours_note && (
                    <div className="p-2.5 rounded-lg bg-surface-muted/50 text-[11px] text-gray-700">
                      🕒 <strong>Timings:</strong> {office.hours_note}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Verified: {office.last_verified_on}
                  </span>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1 shadow-sm"
                  >
                    Get Directions ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
