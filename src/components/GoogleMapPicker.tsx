'use client';

import React, { useState } from 'react';
import { Search, MapPin, ExternalLink, Loader2, Compass } from 'lucide-react';

interface GoogleMapPickerProps {
  lat: number;
  lng: number;
  address?: string;
  onChange: (lat: number, lng: number, address?: string) => void;
}

export const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  lat,
  lng,
  address,
  onChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(address || '');
  const [currentLat, setCurrentLat] = useState(lat);
  const [currentLng, setCurrentLng] = useState(lng);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1&addressdetails=1`
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const first = results[0];
          const newLat = parseFloat(first.lat);
          const newLng = parseFloat(first.lon);
          const newAddr = first.display_name;

          setCurrentLat(newLat);
          setCurrentLng(newLng);
          setCurrentAddress(newAddr);
          onChange(newLat, newLng, newAddr);
        }
      }
    } catch (err) {
      console.error('Error buscando ubicación:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const googleMapEmbedUrl = `https://maps.google.com/maps?q=${currentLat},${currentLng}&t=m&z=15&ie=UTF8&iwloc=&output=embed`;
  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;

  return (
    <div className="space-y-2.5">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar en Google Maps (ej. Roma Norte, Reforma, Polanco...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-3.5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition flex items-center gap-1.5 shadow-2xs"
        >
          {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Buscar</span>}
        </button>
      </form>

      {/* Google Maps Preview Iframe */}
      <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
        <iframe
          title="Google Maps Location Preview"
          src={googleMapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          className="w-full h-full"
        />

        <div className="absolute top-2 left-2 z-10 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold text-slate-700 border border-slate-200 shadow-2xs flex items-center gap-1">
          <Compass className="w-3 h-3 text-teal-600" />
          <span>Vista Previa de Google Maps</span>
        </div>
      </div>

      {/* Location Details Bar */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-slate-600 truncate max-w-[70%]">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="truncate">
            {currentAddress || `${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`}
          </span>
        </div>
        <a
          href={googleMapsExternalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold shrink-0"
        >
          <span>Abrir en Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
