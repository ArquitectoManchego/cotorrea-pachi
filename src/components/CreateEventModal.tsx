'use client';

import React, { useState } from 'react';
import { DayOfWeek, TimeMode } from '@/types';
import { CreateEventParams } from '@/lib/dataStore';
import { X, CalendarDays, Clock, User, Sparkles, Upload, Check } from 'lucide-react';

const DAYS_LIST: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
];

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (params: CreateEventParams) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [organizadorNombre, setOrganizadorNombre] = useState('');
  const [organizadorApellido, setOrganizadorApellido] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  const [diasDisponibles, setDiasDisponibles] = useState<DayOfWeek[]>(['Viernes', 'Sábado']);
  const [timeMode, setTimeMode] = useState<TimeMode>('after');
  const [fromTime, setFromTime] = useState('19:00');
  const [toTime, setToTime] = useState('23:30');
  const [afterTime, setAfterTime] = useState('19:30');
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleDay = (day: DayOfWeek) => {
    if (diasDisponibles.includes(day)) {
      setDiasDisponibles(diasDisponibles.filter((d) => d !== day));
    } else {
      setDiasDisponibles([...diasDisponibles, day]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !organizadorNombre.trim() || !organizadorApellido.trim()) return;

    setIsSubmitting(true);
    onCreate({
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      organizadorNombre: organizadorNombre.trim(),
      organizadorApellido: organizadorApellido.trim(),
      avatar,
      diasDisponibles,
      horario: {
        mode: timeMode,
        ...(timeMode === 'range' ? { fromTime, toTime } : {}),
        ...(timeMode === 'after' ? { afterTime } : {}),
      },
      comentario: comentario.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
              🎉
            </div>
            <div>
              <h2 className="text-lg font-bold">Crear Nueva Salida</h2>
              <p className="text-xs text-teal-100">
                Define el plan inicial y comparte el código con tus amigos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Título de la salida */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre de la salida o evento *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Cheves en el Boulevard / Salida de Viernes / Cumpleaños de Alex"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
            />
          </div>

          {/* Descripción opcional */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción o plan (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Salida tranquila por la tarde en el Boulevard Ávila Camacho"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Datos del Organizador */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Tus Datos como Creador de la Salida</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tu Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Alex"
                  value={organizadorNombre}
                  onChange={(e) => setOrganizadorNombre(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tu Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Manchego"
                  value={organizadorApellido}
                  onChange={(e) => setOrganizadorApellido(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Avatar selector */}
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt="Avatar creador"
                className="w-12 h-12 rounded-full object-cover border-2 border-teal-500 shadow-2xs"
              />
              <div className="flex-1">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {DEFAULT_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`w-6 h-6 rounded-full overflow-hidden border-2 transition ${
                        avatar === av ? 'border-teal-600 scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <label className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg cursor-pointer transition">
                  <Upload className="w-3 h-3 text-slate-400" />
                  <span>Subir foto</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Días disponibles del creador */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <CalendarDays className="w-4 h-4 text-teal-600" />
                <span>¿Qué días puedes tú? (Casillas de verificación) *</span>
              </label>
              <span className="text-[11px] text-teal-600 font-semibold">
                {diasDisponibles.length} días
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DAYS_LIST.map((day) => {
                const isSelected = diasDisponibles.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/80 text-teal-900 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{day}</span>
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center transition ${
                        isSelected ? 'bg-teal-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horario del creador */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>¿En qué horario estás disponible? *</span>
            </label>

            <div className="space-y-2">
              <label
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition ${
                  timeMode === 'any' ? 'border-teal-500 bg-teal-50/40 text-teal-900 font-semibold' : 'border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="timeMode"
                  value="any"
                  checked={timeMode === 'any'}
                  onChange={() => setTimeMode('any')}
                  className="w-4 h-4 text-teal-600"
                />
                <span>Puedo a cualquier hora del día / Todo el día</span>
              </label>

              <div
                className={`p-2.5 rounded-xl border transition ${
                  timeMode === 'range' ? 'border-teal-500 bg-teal-50/40' : 'border-slate-200 text-slate-700'
                }`}
              >
                <label className="flex items-center gap-2.5 cursor-pointer text-xs mb-1.5">
                  <input
                    type="radio"
                    name="timeMode"
                    value="range"
                    checked={timeMode === 'range'}
                    onChange={() => setTimeMode('range')}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="font-semibold text-slate-800">Tengo un rango de horario específico</span>
                </label>
                {timeMode === 'range' && (
                  <div className="flex items-center gap-2 pl-6 pt-1 text-xs">
                    <span>De:</span>
                    <input
                      type="time"
                      value={fromTime}
                      onChange={(e) => setFromTime(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-300 bg-white"
                    />
                    <span>A:</span>
                    <input
                      type="time"
                      value={toTime}
                      onChange={(e) => setToTime(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                )}
              </div>

              <div
                className={`p-2.5 rounded-xl border transition ${
                  timeMode === 'after' ? 'border-teal-500 bg-teal-50/40' : 'border-slate-200 text-slate-700'
                }`}
              >
                <label className="flex items-center gap-2.5 cursor-pointer text-xs mb-1.5">
                  <input
                    type="radio"
                    name="timeMode"
                    value="after"
                    checked={timeMode === 'after'}
                    onChange={() => setTimeMode('after')}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="font-semibold text-slate-800">Libre a partir de cierto horario</span>
                </label>
                {timeMode === 'after' && (
                  <div className="flex items-center gap-2 pl-6 pt-1 text-xs">
                    <span>Disponible a partir de las:</span>
                    <input
                      type="time"
                      value={afterTime}
                      onChange={(e) => setAfterTime(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comentario inicial */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mensaje o nota para tus amigos (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. ¡Vamos a festejar! Yo pongo el coche si van por el Boulevard"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Action buttons */}
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
              disabled={isSubmitting || !titulo.trim() || !organizadorNombre.trim() || !organizadorApellido.trim() || diasDisponibles.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-teal-600/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Creando Salida...' : '🚀 Crear Salida y Obtener Código'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
