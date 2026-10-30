'use client';

import React, { useState } from 'react';
import { Search, MapPin, ExternalLink, Loader2, Compass, Check } from 'lucide-react';

interface GoogleMapPickerProps {
  lat: number;
  lng: number;
  address?: string;
  onChange: (lat: number, lng: number, address?: string, placeName?: string) => void;
}

interface SearchItem {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  address: string;
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
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(queryText)}`);
      if (res.ok) {
        const data: SearchItem[] = await res.json();
        setSearchResults(data);

        if (data.length > 0) {
          const first = data[0];
          setCurrentLat(first.lat);
          setCurrentLng(first.lng);
          setCurrentAddress(first.address);
          onChange(first.lat, first.lng, first.address, first.name);
        }
      }
    } catch (err) {
      console.error('Error buscando ubicación:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (item: SearchItem) => {
    setCurrentLat(item.lat);
    setCurrentLng(item.lng);
    setCurrentAddress(item.address);
    setSearchQuery(item.name);
    setSearchResults([]);
    onChange(item.lat, item.lng, item.address, item.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      performSearch(searchQuery);
    }
  };

  // Google Maps embed URL
  const googleMapEmbedUrl = `https://maps.google.com/maps?q=${currentLat},${currentLng}&t=m&z=15&ie=UTF8&iwloc=&output=embed`;
  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;

  return (
    <div className="space-y-2.5">
      {/* Search Input Container - NO <form> tag to prevent parent modal submission */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar en Google Maps (ej. Roma Norte, Reforma, Polanco, Cervecería...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              performSearch(searchQuery);
            }}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Buscar</span>}
          </button>
        </div>

        {/* Results Dropdown */}
        {searchResults.length > 1 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
            <div className="p-2 text-[10px] font-bold uppercase text-slate-400 bg-slate-50">
              Sugerencias encontradas en Google Maps:
            </div>
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectResult(item);
                }}
                className="w-full text-left p-2.5 hover:bg-teal-50 flex items-start gap-2 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{item.address}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {hasSearched && !isSearching && searchResults.length === 0 && (
          <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg mt-1 border border-amber-200">
            No se encontró una dirección exacta, pero puedes escribir el nombre libremente o verificar en Google Maps.
          </p>
        )}
      </div>

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
