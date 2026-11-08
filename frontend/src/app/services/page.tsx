'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ServiceListItem } from '@/lib/types';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getServices()
      .then(setServices)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 py-4">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-primary">Karachi Public Services</h1>
        <p className="text-sm text-gray-600 mt-1">
          Select a government process below to begin guided document verification and checklist generation.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 py-8 text-center">Loading services catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((svc) => (
            <div key={svc.id} className="p-5 bg-white border border-gray-200 rounded-xl space-y-3">
              <h2 className="text-lg font-bold text-primary">{svc.title}</h2>
              <p className="text-xs text-gray-600 leading-relaxed">{svc.description}</p>
              <div className="pt-2">
                <Link
                  href={`/services/${svc.slug}`}
                  className="inline-block px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  View Details & Guide →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
