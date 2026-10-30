'use client';

import React, { useState, useEffect } from 'react';
import { PlaceOption } from '@/types';
import {
  MapPin,
  ExternalLink,
  Navigation,
  Heart,
  Layers,
  Sparkles,
  Compass,
} from 'lucide-react';

interface GoogleMapViewProps {
  places: PlaceOption[];
  currentParticipantId?: string;
  onVote: (placeId: string) => void;
  selectedPlaceId?: string | null;
  onSelectPlace?: (placeId: string) => void;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  places,
  currentParticipantId,
  onVote,
  selectedPlaceId,
  onSelectPlace,
}) => {
  const [activePlaceId, setActivePlaceId] = useState<string | null>(
    selectedPlaceId || (places.length > 0 ? places[0].id : null)
  );
  const [mapType, setMapType] = useState<'m' | 'k'>('m'); // 'm' = Roadmap, 'k' = Satellite

  useEffect(() => {
    if (selectedPlaceId) {
      setActivePlaceId(selectedPlaceId);
    }
  }, [selectedPlaceId]);

  const activePlace = places.find((p) => p.id === activePlaceId) || places[0];
  const maxVotes = Math.max(...places.map((p) => p.votos.length), 0);

  // Generate Google Maps query for embed
  let googleMapQuery = 'Centro Historico, CDMX';
  if (activePlace) {
    if (activePlace.tieneUbicacionMapa && activePlace.latitud && activePlace.longitud) {
      googleMapQuery = `${activePlace.latitud},${activePlace.longitud}`;
    } else {
      googleMapQuery = `${activePlace.nombre} ${activePlace.direccionAprox || ''}`.trim();
    }
  }

  // Google Maps embed URL
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    googleMapQuery
  )}&t=${mapType}&z=15&ie=UTF8&iwloc=&output=embed`;

  // Deep link for Google Maps navigation
  const googleMapsDirectionsUrl = activePlace
    ? activePlace.tieneUbicacionMapa && activePlace.latitud && activePlace.longitud
      ? `https://www.google.com/maps/dir/?api=1&destination=${activePlace.latitud},${activePlace.longitud}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activePlace.nombre)}`
    : 'https://www.google.com/maps';

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Top Header & Place Switcher */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">Mapa de Google Maps</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                Google Maps Oficial
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Selecciona cualquier lugar propuesto para centrarlo y ver su ubicación exacta
            </p>
          </div>
        </div>

        {/* Satellite toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMapType('m')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
              mapType === 'm'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Mapa Estándar
          </button>
          <button
            type="button"
            onClick={() => setMapType('k')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
              mapType === 'k'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Satélite
          </button>
        </div>
      </div>

      {/* Place Chips Selector Bar */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-100 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
          Lugares:
        </span>
        {places.map((place) => {
          const isSelected = activePlace?.id === place.id;
          const isWinner = place.votos.length === maxVotes && maxVotes > 0;

          return (
            <button
              key={place.id}
              onClick={() => {
                setActivePlaceId(place.id);
                if (onSelectPlace) onSelectPlace(place.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                isSelected
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{isWinner ? '🏆' : '📍'}</span>
              <span className="truncate max-w-[140px]">{place.nombre}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-teal-700 text-teal-100' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {place.votos.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Google Maps Container */}
      <div className="relative w-full h-[380px] sm:h-[440px] bg-slate-100">
        <iframe
          title="Google Maps Embed"
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          className="w-full h-full"
        />

        {/* Floating Active Place Details Card */}
        {activePlace && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-xl animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="truncate">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200/60 capitalize">
                    {activePlace.categoria}
                  </span>
                  {activePlace.votos.length === maxVotes && maxVotes > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                      🏆 Lugar Más Votado
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-tight truncate">
                  {activePlace.nombre}
                </h4>
                {activePlace.direccionAprox && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                    <span className="truncate">{activePlace.direccionAprox}</span>
                  </p>
                )}
              </div>

              {/* Vote button */}
              <button
                onClick={() => onVote(activePlace.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                  currentParticipantId && activePlace.votos.includes(currentParticipantId)
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    currentParticipantId && activePlace.votos.includes(currentParticipantId)
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-slate-400'
                  }`}
                />
                <span>{activePlace.votos.length}</span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 truncate text-[11px] flex-1">
                <img
                  src={activePlace.propuestoPorAvatar}
                  alt={activePlace.propuestoPorNombre}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
                <span className="truncate">Propuesto por {activePlace.propuestoPorNombre}</span>
              </div>

              <a
                href={googleMapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-2xs shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Cómo Llegar (Google Maps)</span>
                <ExternalLink className="w-3 h-3 text-teal-200" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
