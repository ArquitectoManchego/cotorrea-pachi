'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, ExternalLink, Loader2, Compass, Check, MousePointerClick, ShieldCheck } from 'lucide-react';

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(address || '');
  const [currentLat, setCurrentLat] = useState(lat || 19.1620);
  const [currentLng, setCurrentLng] = useState(lng || -96.1100);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Initialize interactive Leaflet map with CartoDB Voyager tiles (Google Maps style)
  useEffect(() => {
    let isMounted = true;

    async function initPickerMap() {
      if (!mapContainerRef.current) return;

      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Pin icon
      const createCustomPin = () =>
        L.divIcon({
          className: 'custom-picker-pin',
          html: `
            <div style="transform: translate(-50%, -100%);">
              <div style="background: linear-gradient(135deg, #0d9488, #059669); color: white; width: 38px; height: 38px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4); border: 2.5px solid white;">
                <span style="transform: rotate(45deg); font-size: 16px;">📍</span>
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
        });

      const initialLat = currentLat || 19.1620;
      const initialLng = currentLng || -96.1100;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initialLat, initialLng], {
        icon: createCustomPin(),
        draggable: true,
      }).addTo(map);

      // Handle map click to pick location
      map.on('click', async (e: { latlng: { lat: number; lng: number } }) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        marker.setLatLng([newLat, newLng]);
        setCurrentLat(newLat);
        setCurrentLng(newLng);
        await handleReverseGeocode(newLat, newLng);
      });

      // Handle marker drag
      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        setCurrentLat(pos.lat);
        setCurrentLng(pos.lng);
        await handleReverseGeocode(pos.lat, pos.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    initPickerMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Reverse geocode when clicking or dragging on map
  const handleReverseGeocode = async (newLat: number, newLng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(`/api/places/search?lat=${newLat}&lng=${newLng}`);
      if (res.ok) {
        const data: SearchItem[] = await res.json();
        if (data.length > 0) {
          const item = data[0];
          setCurrentAddress(item.address);
          onChange(newLat, newLng, item.address, item.name);
          return;
        }
      }
    } catch (err) {
      console.error('Error in reverse geocode:', err);
    } finally {
      setIsGeocoding(false);
    }

    const fallbackAddr = `Coordenadas (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`;
    setCurrentAddress(fallbackAddr);
    onChange(newLat, newLng, fallbackAddr);
  };

  // Autocomplete typing search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data: SearchItem[] = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Error buscando lugar:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (item: SearchItem) => {
    setCurrentLat(item.lat);
    setCurrentLng(item.lng);
    setCurrentAddress(item.address);
    setSearchQuery(item.name);
    setSearchResults([]);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([item.lat, item.lng], 16);
      markerRef.current.setLatLng([item.lat, item.lng]);
    }

    onChange(item.lat, item.lng, item.address, item.name);
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data: SearchItem[] = await res.json();
        setSearchResults(data);
        if (data.length > 0) {
          handleSelectResult(data[0]);
        }
      }
    } catch (err) {
      console.error('Error buscando ubicación:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;

  return (
    <div className="space-y-2.5">
      {/* Banner explicativo: Selección 100% libre sin API Key */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-medium">
        <MousePointerClick className="w-4 h-4 text-teal-600 shrink-0" />
        <span>
          <strong>Selección directa activa:</strong> Haz clic en cualquier parte del mapa o arrastra el pin para ubicar el lugar exacto. <em>(¡Totalmente libre, sin necesidad de API Key!)</em>
        </span>
      </div>

      {/* Search Input Container */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Escribe el nombre o dirección (ej. Boulevard Ávila Camacho, Costa de Oro...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleManualSearch();
                }
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleManualSearch();
            }}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Buscar</span>}
          </button>
        </div>

        {/* Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
            <div className="p-2 text-[10px] font-bold uppercase text-slate-400 bg-slate-50">
              Sugerencias de lugares encontradas:
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
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="relative w-full h-60 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        <div className="absolute top-2 left-2 z-20 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg text-[10px] font-bold text-slate-700 border border-slate-200 shadow-2xs flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-teal-600" />
          <span>Haz clic en el mapa para mover el pin</span>
        </div>

        {isGeocoding && (
          <div className="absolute top-2 right-2 z-20 px-2 py-1 bg-teal-600 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-xs animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Obteniendo dirección...</span>
          </div>
        )}
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
