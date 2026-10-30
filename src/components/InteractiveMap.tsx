'use client';

import React, { useEffect, useRef } from 'react';
import { PlaceOption } from '@/types';
import { MapPin, Navigation, ThumbsUp, Heart } from 'lucide-react';

interface InteractiveMapProps {
  places: PlaceOption[];
  currentParticipantId?: string;
  onVote: (placeId: string) => void;
  selectedPlaceId?: string | null;
  onSelectPlace?: (placeId: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  places,
  currentParticipantId,
  onVote,
  selectedPlaceId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<{ [key: string]: any }>({});

  const placesWithCoords = places.filter(
    (p) => p.tieneUbicacionMapa && typeof p.latitud === 'number' && typeof p.longitud === 'number'
  );

  // Highest voted count
  const maxVotes = Math.max(...places.map((p) => p.votos.length), 0);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      // Clean old instance if re-initializing
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const defaultLat = placesWithCoords.length > 0 ? (placesWithCoords[0].latitud as number) : 19.4326;
      const defaultLng = placesWithCoords.length > 0 ? (placesWithCoords[0].longitud as number) : -99.1332;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersRef.current = {};

      const bounds: [number, number][] = [];

      placesWithCoords.forEach((place) => {
        const isTop = place.votos.length === maxVotes && maxVotes > 0;
        const lat = place.latitud as number;
        const lng = place.longitud as number;
        bounds.push([lat, lng]);

        const pinColor = isTop ? '#f59e0b' : '#0d9488';
        const badge = isTop ? '🏆' : '📍';

        const customIcon = L.divIcon({
          className: 'custom-venue-pin',
          html: `
            <div style="transform: translate(-50%, -100%); cursor: pointer;">
              <div style="background: ${pinColor}; color: white; width: 38px; height: 38px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 14px rgba(0,0,0,0.22); border: 2.5px solid white;">
                <span style="transform: rotate(45deg); font-size: 16px;">${badge}</span>
              </div>
              <div style="background: white; border: 1px solid #e2e8f0; border-radius: 9999px; padding: 2px 6px; font-size: 10px; font-weight: 700; color: #0f172a; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.08); margin-top: 4px; text-align: center; max-width: 110px; overflow: hidden; text-overflow: ellipsis;">
                ${place.nombre}
              </div>
            </div>
          `,
          iconSize: [38, 54],
          iconAnchor: [19, 54],
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
              ${isTop ? '🏆 Favorito del Grupo' : place.categoria}
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
            <button id="vote-btn-${place.id}" class="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 ${
              hasVoted ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-teal-600 text-white'
            } text-xs font-semibold rounded-lg text-center transition">
              <span>${hasVoted ? '❤️ Votado' : '👍 Votar'}</span>
            </button>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`vote-btn-${place.id}`);
          if (btn) {
            btn.onclick = () => {
              onVote(place.id);
            };
          }
        });

        markersRef.current[place.id] = marker;
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [places, currentParticipantId]);

  // Handle selected place animation
  useEffect(() => {
    if (selectedPlaceId && markersRef.current[selectedPlaceId] && mapInstanceRef.current) {
      const marker = markersRef.current[selectedPlaceId];
      const latlng = marker.getLatLng();
      mapInstanceRef.current.setView(latlng, 15, { animate: true });
      marker.openPopup();
    }
  }, [selectedPlaceId]);

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Legend & Stats */}
      <div className="absolute top-3 left-3 z-[400] flex flex-wrap gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200/80 text-xs font-semibold text-slate-800 pointer-events-auto">
          <MapPin className="w-4 h-4 text-teal-600" />
          <span>{placesWithCoords.length} ubicaciones en el mapa</span>
        </div>
        {maxVotes > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/95 backdrop-blur-md rounded-2xl shadow-xs border border-amber-200 text-xs font-semibold text-amber-900 pointer-events-auto">
            <span>🏆 Pin dorado = Más votado</span>
          </div>
        )}
      </div>
    </div>
  );
};
