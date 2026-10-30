'use client';

import React from 'react';
import { PlaceOption } from '@/types';
import {
  MapPin,
  ExternalLink,
  Plus,
  Heart,
  Utensils,
  Beer,
  Coffee,
  Trees,
  Home,
  Sun,
  Gamepad2,
  Sparkles,
  Navigation,
} from 'lucide-react';

interface PlacesListProps {
  places: PlaceOption[];
  currentParticipantId?: string;
  onVote: (placeId: string) => void;
  onOpenPropose: () => void;
  onSelectOnMap?: (place: PlaceOption) => void;
  selectedPlaceId?: string | null;
}

const getCategoryIcon = (categoria: string) => {
  switch (categoria) {
    case 'bar':
      return <Beer className="w-3.5 h-3.5" />;
    case 'restaurante':
      return <Utensils className="w-3.5 h-3.5" />;
    case 'terraza':
      return <Sun className="w-3.5 h-3.5" />;
    case 'cafe':
      return <Coffee className="w-3.5 h-3.5" />;
    case 'casa':
      return <Home className="w-3.5 h-3.5" />;
    case 'parque':
      return <Trees className="w-3.5 h-3.5" />;
    case 'entretenimiento':
      return <Gamepad2 className="w-3.5 h-3.5" />;
    default:
      return <Sparkles className="w-3.5 h-3.5" />;
  }
};

export const PlacesList: React.FC<PlacesListProps> = ({
  places,
  currentParticipantId,
  onVote,
  onOpenPropose,
  onSelectOnMap,
  selectedPlaceId,
}) => {
  const maxVotes = Math.max(...places.map((p) => p.votos.length), 0);

  // Sort places by votes descending
  const sortedPlaces = [...places].sort((a, b) => b.votos.length - a.votos.length);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">
              📍 Lugares Propuestos para el Evento
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-0.5 rounded-full">
              {places.length} opciones
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Haz clic en cualquier tarjeta para ver su ubicación en el mapa con zoom
          </p>
        </div>

        <button
          onClick={onOpenPropose}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition shadow-sm shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Proponer otro lugar</span>
        </button>
      </div>

      {places.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs mx-auto flex items-center justify-center text-teal-600 text-xl">
            📍
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Aún no hay lugares propuestos</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Utiliza el buscador de arriba para escribir un restaurante, bar o terraza de Veracruz / Boca del Río y agregarlo con su pin al mapa.
            </p>
          </div>
          <button
            onClick={onOpenPropose}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition"
          >
            Proponer el primer lugar
          </button>
        </div>
      ) : (
        /* Grid of Places */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedPlaces.map((place) => {
            const isTop = place.votos.length === maxVotes && maxVotes > 0;
            const isSelected = selectedPlaceId === place.id;
            const hasVoted = currentParticipantId ? place.votos.includes(currentParticipantId) : false;
            const gmapsLink =
              place.tieneUbicacionMapa && place.latitud && place.longitud
                ? `https://www.google.com/maps/search/?api=1&query=${place.latitud},${place.longitud}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.nombre)}`;

            return (
              <div
                key={place.id}
                onClick={() => {
                  if (onSelectOnMap) onSelectOnMap(place);
                }}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between cursor-pointer group ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/30 ring-2 ring-teal-500/20 shadow-xs'
                    : isTop
                    ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
                    : 'border-slate-200 bg-white hover:border-teal-400 hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Badges row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 capitalize">
                        {getCategoryIcon(place.categoria)}
                        <span>{place.categoria}</span>
                      </span>
                      {place.tieneUbicacionMapa ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200/60">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>Ver en mapa</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
                          Solo nombre
                        </span>
                      )}
                    </div>

                    {isTop && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        🏆 Favorito
                      </span>
                    )}
                  </div>

                  {/* Place Title */}
                  <h4 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition leading-snug mb-1">
                    {place.nombre}
                  </h4>

                  {/* Description */}
                  {place.descripcion && (
                    <p className="text-xs text-slate-600 mb-2.5 line-clamp-2">
                      {place.descripcion}
                    </p>
                  )}

                  {/* Address */}
                  {place.direccionAprox && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{place.direccionAprox}</span>
                    </div>
                  )}
                </div>

                {/* Bottom footer: Proposer info + Action buttons */}
                <div
                  className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Proposer */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-[130px] sm:max-w-[160px]">
                    <img
                      src={place.propuestoPorAvatar}
                      alt={place.propuestoPorNombre}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <span className="truncate">{place.propuestoPorNombre}</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Google maps external link */}
                    <a
                      href={gmapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir en Google Maps"
                      className="p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Focus on map button */}
                    {place.tieneUbicacionMapa && onSelectOnMap && (
                      <button
                        type="button"
                        onClick={() => onSelectOnMap(place)}
                        title="Ver pin y hacer zoom en el mapa"
                        className="flex items-center gap-1 py-1 px-2.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-xl transition"
                      >
                        <Navigation className="w-3.5 h-3.5 text-teal-600" />
                        <span>Ver en Mapa</span>
                      </button>
                    )}

                    {/* Vote Button */}
                    <button
                      type="button"
                      onClick={() => onVote(place.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        hasVoted
                          ? 'bg-rose-50 border border-rose-200 text-rose-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          hasVoted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
                        }`}
                      />
                      <span>{place.votos.length}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
