'use client';

import React, { useEffect, useRef } from 'react';
import { PlaceOption, VERACRUZ_DEFAULT_COORDS } from '@/types';
import { MapPin, ExternalLink, Heart, Compass, MousePointerClick } from 'lucide-react';

interface PreviewPlace {
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

interface UnifiedMapViewProps {
  places: PlaceOption[];
  currentParticipantId?: string;
  onVote: (placeId: string) => void;
  focusedPlace?: PlaceOption | null;
  previewPlace?: PreviewPlace | null;
  onSelectLocation?: (place: { name: string; lat: number; lng: number; address: string }) => void;
}

export const UnifiedMapView: React.FC<UnifiedMapViewProps> = ({
  places,
  currentParticipantId,
  onVote,
  focusedPlace,
  previewPlace,
  onSelectLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<{ [key: string]: any }>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const previewMarkerRef = useRef<any>(null);

  const placesWithCoords = places.filter(
    (p) => p.tieneUbicacionMapa && typeof p.latitud === 'number' && typeof p.longitud === 'number'
  );

  const maxVotes = Math.max(...places.map((p) => p.votos.length), 0);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initial center: Boulevard Manuel Ávila Camacho, Veracruz / Boca del Río
      const map = L.map(mapContainerRef.current, {
        center: [VERACRUZ_DEFAULT_COORDS.lat, VERACRUZ_DEFAULT_COORDS.lng],
        zoom: VERACRUZ_DEFAULT_COORDS.zoom,
        zoomControl: true,
      });

      // CartoDB Voyager modern high-contrast light tiles (clean Google-style aesthetic)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersRef.current = {};

      // Render all proposed places with pin AND visible name label
      placesWithCoords.forEach((place) => {
        const isTop = place.votos.length === maxVotes && maxVotes > 0;
        const lat = place.latitud as number;
        const lng = place.longitud as number;

        const pinColor = isTop ? '#d97706' : '#0d9488';
        const badge = isTop ? '🏆' : '📍';

        // Pin with permanent name label below
        const customIcon = L.divIcon({
          className: 'custom-venue-pin',
          html: `
            <div style="transform: translate(-50%, -100%); cursor: pointer; display: flex; flex-direction: column; align-items: center;">
              <div style="background: ${pinColor}; color: white; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25); border: 2.5px solid white;">
                <span style="transform: rotate(45deg); font-size: 15px;">${badge}</span>
              </div>
              <div style="background: rgba(255, 255, 255, 0.95); border: 1px solid #cbd5e1; border-radius: 6px; padding: 2px 7px; font-size: 11px; font-weight: 700; color: #0f172a; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.15); margin-top: 3px; max-width: 140px; overflow: hidden; text-overflow: ellipsis;">
                ${place.nombre}
              </div>
            </div>
          `,
          iconSize: [36, 56],
          iconAnchor: [18, 56],
        });

        const hasVoted = currentParticipantId ? place.votos.includes(currentParticipantId) : false;
        const gmapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 min-w-[210px] text-slate-800 font-sans';
        popupContent.innerHTML = `
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
              isTop ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-800'
            }">
              ${isTop ? '🏆 Más Votado' : place.categoria}
            </span>
            <span class="text-xs font-semibold text-slate-600">❤️ ${place.votos.length} votos</span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 leading-tight mb-1">${place.nombre}</h4>
          ${place.descripcion ? `<p class="text-xs text-slate-500 mb-2 line-clamp-2">${place.descripcion}</p>` : ''}
          <div class="flex items-center gap-1.5 text-[11px] text-slate-500 mb-3">
            <img src="${place.propuestoPorAvatar}" class="w-4 h-4 rounded-full object-cover" />
            <span class="truncate">Propuesto por <strong>${place.propuestoPorNombre}</strong></span>
          </div>
          <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
            <a href="${gmapsLink}" target="_blank" rel="noopener noreferrer" class="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg text-center transition">
              <span>Google Maps</span>
            </a>
            <button id="vote-map-btn-${place.id}" class="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 ${
              hasVoted ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-teal-600 text-white'
            } text-xs font-semibold rounded-lg text-center transition">
              <span>${hasVoted ? '❤️ Votado' : '👍 Votar'}</span>
            </button>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`vote-map-btn-${place.id}`);
          if (btn) {
            btn.onclick = () => {
              onVote(place.id);
            };
          }
        });

        markersRef.current[place.id] = marker;
      });

      // On map click: allow selecting location directly anywhere on the map
      map.on('click', async (e: { latlng: { lat: number; lng: number }; originalEvent: MouseEvent }) => {
        if (onSelectLocation) {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          try {
            const res = await fetch(`/api/places/search?lat=${clickLat}&lng=${clickLng}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.length > 0) {
                onSelectLocation({
                  name: data[0].name,
                  lat: clickLat,
                  lng: clickLng,
                  address: data[0].address,
                });
                return;
              }
            }
          } catch {}
          onSelectLocation({
            name: `Punto en (${clickLat.toFixed(4)}, ${clickLng.toFixed(4)})`,
            lat: clickLat,
            lng: clickLng,
            address: 'Veracruz / Boca del Río',
          });
        }
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [places, currentParticipantId, onSelectLocation]);

  // Handle focused place from card click
  useEffect(() => {
    if (focusedPlace && focusedPlace.latitud && focusedPlace.longitud && mapInstanceRef.current) {
      const lat = focusedPlace.latitud;
      const lng = focusedPlace.longitud;

      mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });

      if (markersRef.current[focusedPlace.id]) {
        setTimeout(() => {
          markersRef.current[focusedPlace.id].openPopup();
        }, 1200);
      }
    }
  }, [focusedPlace]);

  // Handle preview place from search bar
  useEffect(() => {
    async function updatePreview() {
      if (!mapInstanceRef.current) return;
      const L = await import('leaflet');

      if (previewMarkerRef.current) {
        previewMarkerRef.current.remove();
        previewMarkerRef.current = null;
      }

      if (previewPlace && previewPlace.lat && previewPlace.lng) {
        const previewIcon = L.divIcon({
          className: 'custom-preview-pin',
          html: `
            <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
              <div style="background: #2563eb; color: white; width: 42px; height: 42px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(37, 99, 235, 0.6); border: 3px solid white; animation: bounce 1s infinite alternate;">
                <span style="transform: rotate(45deg); font-size: 18px;">🔎</span>
              </div>
              <div style="background: #1e3a8a; color: white; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25); margin-top: 4px; max-width: 160px; overflow: hidden; text-overflow: ellipsis;">
                ${previewPlace.name}
              </div>
            </div>
          `,
          iconSize: [42, 62],
          iconAnchor: [21, 62],
        });

        const marker = L.marker([previewPlace.lat, previewPlace.lng], {
          icon: previewIcon,
          zIndexOffset: 1000,
        }).addTo(mapInstanceRef.current);

        marker.bindPopup(`
          <div class="p-1">
            <span class="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Lugar Encontrado</span>
            <h4 class="font-bold text-sm text-slate-900 mt-1">${previewPlace.name}</h4>
            <p class="text-xs text-slate-500">${previewPlace.address || ''}</p>
          </div>
        `);

        previewMarkerRef.current = marker;
        mapInstanceRef.current.flyTo([previewPlace.lat, previewPlace.lng], 16, { duration: 1 });
      }
    }

    updatePreview();
  }, [previewPlace]);

  const handleResetToBoulevard = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [VERACRUZ_DEFAULT_COORDS.lat, VERACRUZ_DEFAULT_COORDS.lng],
        VERACRUZ_DEFAULT_COORDS.zoom,
        { duration: 1 }
      );
    }
  };

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Header Controls */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200/80 text-xs font-semibold text-slate-800 pointer-events-auto">
          <MapPin className="w-4 h-4 text-teal-600" />
          <span>{placesWithCoords.length} lugares propuestos en el mapa</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-teal-50/95 backdrop-blur-md rounded-2xl shadow-xs border border-teal-200 text-xs font-semibold text-teal-900 pointer-events-auto">
          <MousePointerClick className="w-3.5 h-3.5 text-teal-600" />
          <span>Haz clic en el mapa para marcar un lugar (100% libre, sin API Key)</span>
        </div>

        <button
          type="button"
          onClick={handleResetToBoulevard}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-slate-50 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200/80 text-xs font-semibold text-teal-800 pointer-events-auto transition active:scale-95"
        >
          <Compass className="w-4 h-4 text-teal-600" />
          <span>Veracruz (Blvd. Ávila Camacho)</span>
        </button>
      </div>

      {placesWithCoords.length === 0 && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-md text-xs text-slate-600 max-w-sm">
          📍 <strong>Aún no hay lugares propuestos en el mapa.</strong> Usa el buscador de arriba o presiona &quot;Proponer Lugar&quot; para agregar el primero en el Boulevard o tu zona favorita.
        </div>
      )}
    </div>
  );
};
