'use client';

import React, { useState } from 'react';
import { Participant, PlaceCategory, PlaceOption } from '@/types';
import { GoogleMapPicker } from './GoogleMapPicker';
import {
  X,
  MapPin,
  FileText,
  Utensils,
  Beer,
  Coffee,
  Trees,
  Home,
  Sun,
  Gamepad2,
  Sparkles,
} from 'lucide-react';

interface ProposePlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParticipant: Participant | null;
  onPropose: (place: PlaceOption) => void;
  onRequireParticipant: () => void;
}

const CATEGORIES: { id: PlaceCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'bar', label: 'Bar / Cheves', icon: <Beer className="w-3.5 h-3.5" /> },
  { id: 'restaurante', label: 'Restaurante', icon: <Utensils className="w-3.5 h-3.5" /> },
  { id: 'terraza', label: 'Terraza / Rooftop', icon: <Sun className="w-3.5 h-3.5" /> },
  { id: 'cafe', label: 'Café', icon: <Coffee className="w-3.5 h-3.5" /> },
  { id: 'casa', label: 'Casa de amigo', icon: <Home className="w-3.5 h-3.5" /> },
  { id: 'parque', label: 'Parque / Aire libre', icon: <Trees className="w-3.5 h-3.5" /> },
  { id: 'entretenimiento', label: 'Boliche / Juegos', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
  { id: 'otro', label: 'Otro lugar', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

export const ProposePlaceModal: React.FC<ProposePlaceModalProps> = ({
  isOpen,
  onClose,
  currentParticipant,
  onPropose,
  onRequireParticipant,
}) => {
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<PlaceCategory>('bar');
  const [descripcion, setDescripcion] = useState('');
  const [tieneUbicacionMapa, setTieneUbicacionMapa] = useState(true);

  // Default coordinates (CDMX center as initial focal point, customizable)
  const [latitud, setLatitud] = useState(19.4326);
  const [longitud, setLongitud] = useState(-99.1332);
  const [direccionAprox, setDireccionAprox] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (!currentParticipant) {
      onRequireParticipant();
      return;
    }

    const newPlace: PlaceOption = {
      id: `place-${Date.now()}`,
      nombre: nombre.trim(),
      categoria,
      descripcion: descripcion.trim() || undefined,
      tieneUbicacionMapa,
      latitud: tieneUbicacionMapa ? latitud : undefined,
      longitud: tieneUbicacionMapa ? longitud : undefined,
      direccionAprox: tieneUbicacionMapa ? direccionAprox : 'Sin ubicación en mapa',
      propuestoPorId: currentParticipant.id,
      propuestoPorNombre: `${currentParticipant.nombre} ${currentParticipant.apellido}`,
      propuestoPorAvatar: currentParticipant.avatar,
      votos: [currentParticipant.id],
      createdAt: new Date().toISOString(),
    };

    onPropose(newPlace);
    setNombre('');
    setDescripcion('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/90 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/70 to-emerald-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Proponer Dónde Ir con Google Maps</h2>
              <p className="text-xs text-slate-500">Agrega un bar, terraza, comida o tu casa para el evento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre del lugar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del lugar o propuesta *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Cervecería El Campanario / Tacos Los Farolitos / Mi casa"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de lugar
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoria(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium border transition ${
                    categoria === cat.id
                      ? 'border-teal-500 bg-teal-50 text-teal-900 font-semibold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-teal-600">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ¿Por qué recomiendas este lugar? (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Tienen 2x1 en cheves, terraza al aire libre y buena música"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Selector de Modo: Google Maps vs Solo Nombre */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              ¿Cómo quieres indicar la ubicación?
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setTieneUbicacionMapa(true)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
                  tieneUbicacionMapa
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Google Maps (Buscar y Ver)</span>
              </button>

              <button
                type="button"
                onClick={() => setTieneUbicacionMapa(false)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
                  !tieneUbicacionMapa
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Solo Nombre (sin mapa)</span>
              </button>
            </div>

            {tieneUbicacionMapa ? (
              <GoogleMapPicker
                lat={latitud}
                lng={longitud}
                address={direccionAprox}
                onChange={(newLat, newLng, newAddr) => {
                  setLatitud(newLat);
                  setLongitud(newLng);
                  if (newAddr) setDireccionAprox(newAddr);
                }}
              />
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                ✍️ Se agregará únicamente con el nombre especificado. Tus amigos podrán votar por él en la lista general de opciones.
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!nombre.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold transition shadow-sm shadow-teal-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Agregar a la Lista</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
