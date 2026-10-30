'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, ExternalLink, Loader2 } from 'lucide-react';

interface MapPickerProps {
  lat: number;
  lng: number;
  address?: string;
  onChange: (lat: number, lng: number, address?: string) => void;
}

export const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, address, onChange }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(address || '');

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      // Custom modern SVG marker
      const customPin = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="transform: translate(-50%, -100%);">
            <div style="background: linear-gradient(135deg, #0d9488, #059669); color: white; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 2px solid white;">
              <span style="transform: rotate(45deg); font-size: 16px;">📍</span>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], {
        icon: customPin,
        draggable: true,
      }).addTo(map);

      // On map click, move marker
      map.on('click', async (e: { latlng: { lat: number; lng: number } }) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        marker.setLatLng([newLat, newLng]);
        reverseGeocode(newLat, newLng);
      });

      // On marker drag end
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const reverseGeocode = async (newLat: number, newLng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      const addr = data.display_name || `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`;
      setCurrentAddress(addr);
      onChange(newLat, newLng, addr);
    } catch {
      const fallback = `Ubicación (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`;
      setCurrentAddress(fallback);
      onChange(newLat, newLng, fallback);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const results = await res.json();
      if (results && results.length > 0) {
        const first = results[0];
        const newLat = parseFloat(first.lat);
        const newLng = parseFloat(first.lon);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 15);
          markerRef.current.setLatLng([newLat, newLng]);
        }
        setCurrentAddress(first.display_name);
        onChange(newLat, newLng, first.display_name);
      }
    } catch (err) {
      console.error('Error searching place:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className="space-y-2">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar dirección, colonia o lugar (ej. Reforma, Roma Norte...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-teal-500"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition flex items-center gap-1.5"
        >
          {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Buscar</span>}
        </button>
      </form>

      {/* Map Element */}
      <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Details bar */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-slate-600 truncate max-w-[70%]">
          <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="truncate">{currentAddress || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}</span>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-teal-700 hover:text-teal-900 font-medium shrink-0"
        >
          <span>Ver en Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <p className="text-[11px] text-slate-400 italic">
        💡 Tip: Haz clic o arrastra el marcador en el mapa para ajustar la ubicación exacta.
      </p>
    </div>
  );
};
