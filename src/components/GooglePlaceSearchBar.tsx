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
} from 'lucide-react';

interface SearchResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  address: string;
}

interface GooglePlaceSearchBarProps {
  currentParticipant: Participant | null;
  onAddPlace: (place: PlaceOption) => void;
  onRequireParticipant: () => void;
}

const CATEGORIES: { id: PlaceCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'bar', label: 'Bar', icon: <Beer className="w-3.5 h-3.5" /> },
  { id: 'restaurante', label: 'Restaurante', icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: 'terraza', label: 'Terraza', icon: <Sun className="w-3.5 h-3.5" /> },
  { id: 'cafe', label: 'Café', icon: <Coffee className="w-3.5 h-3.5" /> },
  { id: 'casa', label: 'Casa', icon: <Home className="w-3.5 h-3.5" /> },
  { id: 'parque', label: 'Parque', icon: <Trees className="w-3.5 h-3.5" /> },
  { id: 'entretenimiento', label: 'Juegos', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
  { id: 'otro', label: 'Otro', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

export const GooglePlaceSearchBar: React.FC<GooglePlaceSearchBarProps> = ({
  currentParticipant,
  onAddPlace,
  onRequireParticipant,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [category, setCategory] = useState<PlaceCategory>('bar');
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search when typing (debounced)
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
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
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (result: SearchResult) => {
    setSelectedResult(result);
    setQuery(result.name);
    setResults([]);
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
          setSelectedResult(data[0]);
        }
      }
    } catch (err) {
      console.error('Error searching place:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!currentParticipant) {
      onRequireParticipant();
      return;
    }

    const placeName = selectedResult ? selectedResult.name : query.trim();
    const hasMap = Boolean(selectedResult);

    const newPlace: PlaceOption = {
      id: `place-${Date.now()}`,
      nombre: placeName,
      categoria: category,
      descripcion: description.trim() || undefined,
      tieneUbicacionMapa: hasMap,
      latitud: selectedResult?.lat,
      longitud: selectedResult?.lng,
      direccionAprox: selectedResult?.address || 'Agregado por nombre',
      propuestoPorId: currentParticipant.id,
      propuestoPorNombre: `${currentParticipant.nombre} ${currentParticipant.apellido}`,
      propuestoPorAvatar: currentParticipant.avatar,
      votos: [currentParticipant.id],
      createdAt: new Date().toISOString(),
    };

    onAddPlace(newPlace);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setQuery('');
      setSelectedResult(null);
      setDescription('');
    }, 1500);
  };

  const googleMapsSearchUrl = selectedResult
    ? `https://www.google.com/maps/search/?api=1&query=${selectedResult.lat},${selectedResult.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className="bg-white rounded-3xl border border-teal-200/80 shadow-xs p-5 sm:p-6 transition">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Buscar y Agregar Lugar con Google Maps
          </h3>
          <p className="text-xs text-slate-500">
            Escribe el nombre del restaurante, bar, parque o local y agrégalo directamente a la lista de opciones
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="space-y-3.5">
        {/* Main Search Input */}
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (selectedResult && e.target.value !== selectedResult.name) {
                  setSelectedResult(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results.length > 0) {
                  e.preventDefault();
                  handleSelectResult(results[0]);
                }
              }}
              placeholder="Escribe el nombre del lugar (ej. Cervecería El Campanario, Pizzería Cancino, Parque México...)"
              className="w-full pl-10 pr-28 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
            <div className="absolute right-3 flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
              ) : (
                <button
                  type="button"
                  onClick={handleManualSearch}
                  className="text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition"
                >
                  Buscar
                </button>
              )}
              {query.trim() && (
                <a
                  href={googleMapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Abrir búsqueda en Google Maps"
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-teal-700 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs transition"
                >
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                  <span className="hidden sm:inline">Google Maps</span>
                </a>
              )}
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {results.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto animate-in fade-in-50"
            >
              <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 flex items-center justify-between">
                <span>Resultados de Google Maps / Coordenadas:</span>
                <span className="font-normal text-slate-500">Haz clic en una opción para seleccionarla</span>
              </div>
              {results.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectResult(res)}
                  className="w-full text-left p-3 hover:bg-teal-50/70 transition flex items-start gap-2.5"
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

        {/* Selected Result Badge */}
        {selectedResult && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">
                <strong>Ubicación detectada:</strong> {selectedResult.address}
              </span>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedResult.lat},${selectedResult.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 hover:text-teal-900 font-semibold underline shrink-0 ml-2"
            >
              Ver en Google Maps
            </a>
          </div>
        )}

        {/* Categories + Description + Submit row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
          {/* Category Selector */}
          <div className="sm:col-span-5 flex flex-wrap gap-1.5">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium border transition ${
                  category === cat.id
                    ? 'border-teal-500 bg-teal-50 text-teal-900 font-semibold shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Optional Note */}
          <div className="sm:col-span-4">
            <input
              type="text"
              placeholder="Nota opcional (ej. Buena música, 2x1)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Add Button */}
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={!query.trim() || isSuccess}
              className={`w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                isSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
              }`}
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Lugar Agregado!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Agregar a Lista</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
