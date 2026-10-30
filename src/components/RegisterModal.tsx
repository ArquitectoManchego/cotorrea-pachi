'use client';

import React, { useState, useEffect } from 'react';
import { DayOfWeek, Participant, TimeMode } from '@/types';
import { X, Check, Upload, Clock, CalendarDays, User, Sparkles } from 'lucide-react';

const DAYS_LIST: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
];

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParticipant: Participant | null;
  onSave: (participant: Participant) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  currentParticipant,
  onSave,
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  const [diasDisponibles, setDiasDisponibles] = useState<DayOfWeek[]>(['Viernes', 'Sábado']);
  const [timeMode, setTimeMode] = useState<TimeMode>('after');
  const [fromTime, setFromTime] = useState('18:00');
  const [toTime, setToTime] = useState('23:00');
  const [afterTime, setAfterTime] = useState('19:00');
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    if (currentParticipant) {
      setNombre(currentParticipant.nombre);
      setApellido(currentParticipant.apellido);
      setAvatar(currentParticipant.avatar);
      setDiasDisponibles(currentParticipant.diasDisponibles);
      setTimeMode(currentParticipant.horario.mode);
      setFromTime(currentParticipant.horario.fromTime || '18:00');
      setToTime(currentParticipant.horario.toTime || '23:00');
      setAfterTime(currentParticipant.horario.afterTime || '19:00');
      setComentario(currentParticipant.comentario || '');
    }
  }, [currentParticipant, isOpen]);

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
    if (!nombre.trim() || !apellido.trim()) return;

    const participant: Participant = {
      id: currentParticipant?.id || `part-${Date.now()}`,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      avatar,
      diasDisponibles,
      horario: {
        mode: timeMode,
        ...(timeMode === 'range' ? { fromTime, toTime } : {}),
        ...(timeMode === 'after' ? { afterTime } : {}),
      },
      comentario: comentario.trim() || undefined,
      registeredAt: currentParticipant?.registeredAt || new Date().toISOString(),
    };

    onSave(participant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/90 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/50 to-emerald-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {currentParticipant ? 'Editar mi Disponibilidad' : '¡Regístrate para la Salida!'}
              </h2>
              <p className="text-xs text-slate-500">Dile a tus amigos cuándo puedes y pon tu foto</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre *</label>
              <input
                type="text"
                required
                placeholder="Ej. Alex"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido *</label>
              <input
                type="text"
                required
                placeholder="Ej. Manchego"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
              />
            </div>
          </div>

          {/* Foto de Perfil */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Foto de perfil / Avatar
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={avatar}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-teal-500 shadow-xs"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-2">Selecciona un avatar o sube tu foto:</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {DEFAULT_AVATARS.map((avUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(avUrl)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition ${
                        avatar === avUrl ? 'border-teal-600 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={avUrl} alt={`Avatar option ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Subir foto desde mi dispositivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Días disponibles (Casillas tipo check) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <CalendarDays className="w-4 h-4 text-teal-600" />
                <span>¿Qué días tienes disponibles? (Casillas check) *</span>
              </label>
              <span className="text-[11px] text-teal-600 font-medium">
                {diasDisponibles.length} seleccionados
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
                        ? 'border-teal-500 bg-teal-50/80 text-teal-900 shadow-2xs font-semibold'
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

          {/* Horario Disponible */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>¿En qué horario podrías ir? *</span>
            </label>

            <div className="space-y-2.5">
              {/* Opción 1: A cualquier hora */}
              <label
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  timeMode === 'any'
                    ? 'border-teal-500 bg-teal-50/40 text-teal-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="timeMode"
                  value="any"
                  checked={timeMode === 'any'}
                  onChange={() => setTimeMode('any')}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="text-xs font-semibold">Puedo a cualquier hora del día</span>
                  <p className="text-[11px] text-slate-500">Tengo todo el día libre o me adapto a lo que diga la mayoría</p>
                </div>
              </label>

              {/* Opción 2: Rango de horas */}
              <div
                className={`p-3 rounded-xl border transition ${
                  timeMode === 'range'
                    ? 'border-teal-500 bg-teal-50/40'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer mb-2">
                  <input
                    type="radio"
                    name="timeMode"
                    value="range"
                    checked={timeMode === 'range'}
                    onChange={() => setTimeMode('range')}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">Tengo un horario disponible específico (De X a Y)</span>
                    <p className="text-[11px] text-slate-500">Ejemplo: puedo salir de 18:00 a 23:00</p>
                  </div>
                </label>
                {timeMode === 'range' && (
                  <div className="flex items-center gap-3 pl-7 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">De:</span>
                      <input
                        type="time"
                        value={fromTime}
                        onChange={(e) => setFromTime(e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">A:</span>
                      <input
                        type="time"
                        value={toTime}
                        onChange={(e) => setToTime(e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Opción 3: Libre a partir de cierta hora */}
              <div
                className={`p-3 rounded-xl border transition ${
                  timeMode === 'after'
                    ? 'border-teal-500 bg-teal-50/40'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer mb-2">
                  <input
                    type="radio"
                    name="timeMode"
                    value="after"
                    checked={timeMode === 'after'}
                    onChange={() => setTimeMode('after')}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">Libre a partir de cierto horario</span>
                    <p className="text-[11px] text-slate-500">Ideal si trabajas o tienes compromisos temprano</p>
                  </div>
                </label>
                {timeMode === 'after' && (
                  <div className="flex items-center gap-2 pl-7 pt-1">
                    <span className="text-xs text-slate-500">Disponible a partir de las:</span>
                    <input
                      type="time"
                      value={afterTime}
                      onChange={(e) => setAfterTime(e.target.value)}
                      className="px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nota opcional */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nota o mensaje para el grupo (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Tengo 3 lugares en mi auto / Salgo a las 7 de la chamba"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Botones de acción */}
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
              disabled={!nombre.trim() || !apellido.trim() || diasDisponibles.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold transition shadow-sm shadow-teal-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{currentParticipant ? 'Guardar Cambios' : 'Listo, ¡Registrarme!'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
