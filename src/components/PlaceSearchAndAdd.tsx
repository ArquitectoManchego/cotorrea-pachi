'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlaceCategory, PlaceOption, Participant } from '@/types';
import {
  Search,
  MapPin,
  Plus,
  Loader2,
  ExternalLink,
  Utensils,
  Beer,
  Coffee,
  Trees,
  Home,
  Sun,
  Gamepad2,
  Sparkles,
  Check,
  CheckCircle2,
} from 'lucide-react';

interface SearchResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  address: string;
}

interface PlaceSearchAndAddProps {
  currentParticipant: Participant | null;
  onAddPlace: (place: PlaceOption) => void;
  onPreviewPlace: (place: { name: string; lat: number; lng: number; address: string } | null) => void;
  onRequireParticipant: () => void;
}

const CATEGORIES: { id: PlaceCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'bar', label: 'Bar / Cheves', icon: <Beer className="w-3.5 h-3.5" /> },
  { id: 'restaurante', label: 'Restaurante', icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: 'terraza', label: 'Terraza / Rooftop', icon: <Sun className="w-3.5 h-3.5" /> },
  { id: 'cafe', label: 'Café', icon: <Coffee className="w-3.5 h-3.5" /> },
  { id: 'casa', label: 'Casa de amigo', icon: <Home className="w-3.5 h-3.5" /> },
  { id: 'parque', label: 'Parque / Aire libre', icon: <Trees className="w-3.5 h-3.5" /> },
  { id: 'entretenimiento', label: 'Juegos / Boliche', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
  { id: 'otro', label: 'Otro', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

export const PlaceSearchAndAdd: React.FC<PlaceSearchAndAddProps> = ({
  currentParticipant,
  onAddPlace,
  onPreviewPlace,
  onRequireParticipant,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
  const [category, setCategory] = useState<PlaceCategory>('bar');
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Automatic autocomplete as the user types
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data: SearchResult[] = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Error searching place:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle selecting an option from dropdown OR pressing Buscar
  const handleSelectPlace = (place: SearchResult) => {
    setSelectedPlace(place);
    setQuery(place.name);
    setResults([]);
    // Update map below with a pin
    onPreviewPlace({
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      address: place.address,
    });
  };

  const handleManualSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data: SearchResult[] = await res.json();
        setResults(data);
        if (data.length > 0) {
          handleSelectPlace(data[0]);
        }
      }
    } catch (err) {
      console.error('Error in manual search:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!query.trim()) return;

    if (!currentParticipant) {
      onRequireParticipant();
      return;
    }

    const placeName = selectedPlace ? selectedPlace.name : query.trim();
    const hasMap = Boolean(selectedPlace);

    const newPlace: PlaceOption = {
      id: `place-${Date.now()}`,
      nombre: placeName,
      categoria: category,
      descripcion: description.trim() || undefined,
      tieneUbicacionMapa: hasMap,
      latitud: selectedPlace?.lat,
      longitud: selectedPlace?.lng,
      direccionAprox: selectedPlace?.address || 'Boulevard Ávila Camacho, Veracruz',
      propuestoPorId: currentParticipant.id,
      propuestoPorNombre: `${currentParticipant.nombre} ${currentParticipant.apellido}`,
      propuestoPorAvatar: currentParticipant.avatar,
      votos: [currentParticipant.id],
      createdAt: new Date().toISOString(),
    };

    onAddPlace(newPlace);
    setIsSuccess(true);
    onPreviewPlace(null);

    setTimeout(() => {
      setIsSuccess(false);
      setQuery('');
      setSelectedPlace(null);
      setDescription('');
    }, 1800);
  };

  const googleMapsSearchUrl = selectedPlace
    ? `https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className="bg-white rounded-3xl border border-teal-200/90 shadow-xs p-5 sm:p-6 transition">
      {/* Title */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Buscar y Agregar Lugar con Google Maps
          </h3>
          <p className="text-xs text-slate-500">
            Escribe un lugar para que aparezca en el mapa con su pin y agrégalo a la lista de opciones
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Search Input Container */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (selectedPlace && e.target.value !== selectedPlace.name) {
                    setSelectedPlace(null);
                    onPreviewPlace(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (results.length > 0) {
                      handleSelectPlace(results[0]);
                    } else {
                      handleManualSearch();
                    }
                  }
                }}
                placeholder="Escribe el nombre del lugar (ej. Berries & Son, Irish Pub, Villa del Mar, Costa Verde, Taquería...)"
                className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
              {isLoading && (
                <div className="absolute right-3 top-2.5">
                  <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleManualSearch}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl transition flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar</span>
            </button>
          </div>

          {/* Autocomplete Dropdown List */}
          {results.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto animate-in fade-in-50"
            >
              <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 flex items-center justify-between">
                <span>Coincidencias en Google Maps (selecciona una):</span>
                <span className="font-normal text-slate-400">Veracruz / General</span>
              </div>
              {results.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPlace(res)}
                  className="w-full text-left p-3 hover:bg-teal-50 flex items-start gap-2.5 transition"
                >
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 truncate">{res.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{res.address}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Place Card Preview */}
        {selectedPlace && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/80 to-emerald-50/40 border border-teal-200/90 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs mt-0.5 shrink-0">
                  📍
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedPlace.name}</h4>
                  <p className="text-xs text-slate-600">{selectedPlace.address}</p>
                  <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                    ✓ Ya está marcado con un pin en el mapa de abajo
                  </p>
                </div>
              </div>

              <a
                href={googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="self-start sm:self-auto flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-900 underline shrink-0"
              >
                <span>Ver en Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">
                Tipo de lugar:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition ${
                      category === cat.id
                        ? 'border-teal-600 bg-white text-teal-900 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note input */}
            <div>
              <input
                type="text"
                placeholder="Nota opcional (ej. Tienen rica botana, terraza frente al mar, cheves frías)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-teal-200 bg-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Big Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleConfirmAdd}
                disabled={isSuccess}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition shadow-sm ${
                  isSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-98'
                }`}
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>¡Agregado con éxito a Lugares Propuestos!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Agregar este lugar a &quot;Lugares Propuestos para el Evento&quot;</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
