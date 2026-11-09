import React, { useState, useEffect, useRef } from 'react';
import { I18N, Language } from '../lib/i18n';
import { OFFICES, Office, KARACHI_DISTRICTS } from '../data/catalog';
import {
  MapPin,
  ExternalLink,
  Building2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Search,
  Filter,
  Navigation
} from 'lucide-react';
import L from 'leaflet';

interface OfficeLocatorProps {
  language: Language;
  preselectedDistrict?: string;
  preselectedService?: string;
  onClose?: () => void;
}

export const OfficeLocator: React.FC<OfficeLocatorProps> = ({
  language,
  preselectedDistrict,
  preselectedService
}) => {
  const t = I18N[language];
  const isUrdu = language === 'ur';

  const [serviceFilter, setServiceFilter] = useState<'all' | 'domicile_prc' | 'first_cnic'>(
    (preselectedService as any) || 'all'
  );
  const [districtFilter, setDistrictFilter] = useState<string>(preselectedDistrict || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(OFFICES[0]);
  const [mapError, setMapError] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Filter offices
  const filteredOffices = OFFICES.filter((office) => {
    if (serviceFilter !== 'all' && !office.services.includes(serviceFilter)) {
      return false;
    }
    if (districtFilter !== 'all' && office.district_key !== districtFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        office.name_en.toLowerCase().includes(q) ||
        office.name_ur.toLowerCase().includes(q) ||
        office.address_en.toLowerCase().includes(q) ||
        office.district.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Initialize Leaflet map safely
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [24.87, 67.04],
          zoom: 11,
          scrollWheelZoom: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18
        }).addTo(map);

        mapInstanceRef.current = map;
      }
    } catch (e) {
      console.warn('Map initialization note:', e);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when filtered offices change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #0C3E2E; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white;">🏛️</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    filteredOffices.forEach(office => {
      const marker = L.marker([office.lat, office.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${isUrdu ? office.name_ur : office.name_en}</b><br/><span style="font-size:11px;">${office.address_en}</span>`);

      marker.on('click', () => {
        setSelectedOffice(office);
      });

      markersRef.current.push(marker);
    });

    if (filteredOffices.length > 0 && selectedOffice) {
      map.setView([selectedOffice.lat, selectedOffice.lng], 12);
    }
  }, [filteredOffices, selectedOffice, isUrdu]);

  const handleSelectOffice = (office: Office) => {
    setSelectedOffice(office);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([office.lat, office.lng], 13);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{isUrdu ? 'کراچی دفتری پتہ و نقشہ' : 'Verified Karachi Office Directory'}</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mt-1">
              {t.offices_heading}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {t.offices_subheading}
            </p>
          </div>

          <div className="text-xs text-stone-500">
            {filteredOffices.length} {isUrdu ? 'دفاتر دستیاب ہیں' : 'offices located'}
          </div>
        </div>

        {/* Filters Strip */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center gap-3">
          {/* Service Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              onClick={() => setServiceFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                serviceFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t.filter_all}
            </button>
            <button
              onClick={() => setServiceFilter('domicile_prc')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                serviceFilter === 'domicile_prc'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              DC Offices (Domicile/PRC)
            </button>
            <button
              onClick={() => setServiceFilter('first_cnic')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                serviceFilter === 'first_cnic'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              NADRA Mega Centres
            </button>
          </div>

          {/* District Dropdown Filter */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="all">All Karachi Districts</option>
            {KARACHI_DISTRICTS.map(d => (
              <option key={d.key} value={d.key}>
                {isUrdu ? d.name_ur : d.name_en}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search_offices}
              className="w-full pl-9 pr-3 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Curated List Fallback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Map Container (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-stone-700 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-[#0C3E2E]" />
              <span>{isUrdu ? 'کراچی انٹرایکٹو نقشہ' : 'Karachi District Coordinates'}</span>
            </span>
            <span>{isUrdu ? 'اوپن اسٹریٹ میپ' : 'OpenStreetMap Engine'}</span>
          </div>

          {/* Map canvas */}
          <div
            ref={mapContainerRef}
            className="w-full h-80 sm:h-96 min-h-[320px] bg-stone-100 relative z-0"
          >
            {mapError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-stone-50 text-stone-600">
                <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="font-semibold text-sm">Offline Map Mode Active</p>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">
                  Interactive tiles unavailable in sandbox. The complete verified address list and direct Google Maps links below remain fully functional.
                </p>
              </div>
            )}
          </div>

          {/* Selected Office Spotlight Panel */}
          {selectedOffice && (
            <div className="p-5 bg-stone-50/70 border-t border-stone-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified {selectedOffice.verification_status} · Audited {selectedOffice.last_verified_on}</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mt-0.5">
                    {isUrdu ? selectedOffice.name_ur : selectedOffice.name_en}
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {isUrdu ? selectedOffice.address_ur : selectedOffice.address_en}
                  </p>
                </div>

                {/* Direct Google Maps Deep Link */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOffice.lat},${selectedOffice.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-[#0C3E2E] hover:bg-[#0A3426] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[40px]"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'راستہ دیکھیں' : 'Get Directions'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-stone-500 pt-2 border-t border-stone-200/80">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{isUrdu ? selectedOffice.hours_note_ur : selectedOffice.hours_note_en}</span>
                </div>
                <div className="text-stone-400">
                  {selectedOffice.district}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Bulletproof List Fallback (5 cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {filteredOffices.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 text-stone-500">
              <Building2 className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="font-semibold text-sm">
                {isUrdu ? 'کوئی مصدقہ دفتر نہیں ملا' : 'No verified office found'}
              </p>
              <p className="text-xs text-stone-400 mt-1">
                {isUrdu
                  ? 'براہِ کرم سرکاری پورٹل nadra.gov.pk یا سندھ ہوم ڈیپارٹمنٹ سے تصدیق کریں۔'
                  : 'Please check official sites or reset your filters.'}
              </p>
            </div>
          ) : (
            filteredOffices.map((office) => {
              const isSelected = selectedOffice?.id === office.id;
              return (
                <div
                  key={office.id}
                  onClick={() => handleSelectOffice(office)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0C3E2E] bg-emerald-50/40 ring-2 ring-[#0C3E2E]/10'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500">
                        <span>{office.district}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{office.office_type.replace('_', ' ')}</span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 mt-0.5">
                        {isUrdu ? office.name_ur : office.name_en}
                      </h4>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                        {isUrdu ? office.address_ur : office.address_en}
                      </p>
                    </div>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${office.lat},${office.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-stone-400 hover:text-[#0C3E2E] hover:bg-stone-100 rounded-lg transition-colors shrink-0"
                      title="Open Directions in Google Maps"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="truncate max-w-[200px]">
                      {isUrdu ? office.hours_note_ur : office.hours_note_en}
                    </span>
                    <span className="text-emerald-700 font-medium">
                      Audited {office.last_verified_on}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
