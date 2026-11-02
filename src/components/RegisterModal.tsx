'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DayOfWeek, Participant, TimeMode } from '@/types';
import { X, Check, Upload, Clock, CalendarDays, User, Sparkles, AlertCircle } from 'lucide-react';

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
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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
    setAttemptedSubmit(false);
  }, [currentParticipant, isOpen]);

  if (!isOpen) return null;

  // Real-time validations
  const isNameEmpty = !nombre.trim();
  const isLastNameEmpty = !apellido.trim();
  const isDaysEmpty = diasDisponibles.length === 0;

  // Time validation
  const isRangeMissing = timeMode === 'range' && (!fromTime || !toTime);
  const isRangeOrderInvalid = timeMode === 'range' && fromTime && toTime && fromTime >= toTime;
  const isAfterMissing = timeMode === 'after' && !afterTime;

  const hasRangeError = isRangeMissing || isRangeOrderInvalid;
  const hasAfterError = isAfterMissing;
  const hasTimeError = hasRangeError || hasAfterError;

  const isFormValid = !isNameEmpty && !isLastNameEmpty && !isDaysEmpty && !hasTimeError;

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
    setAttemptedSubmit(true);

    if (!isFormValid) {
      // Scroll form to top or first error
      if (formRef.current) {
        formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

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
                {currentParticipant ? 'Editar mi Registro' : 'Registrar mi Disponibilidad'}
              </h2>
              <p className="text-xs text-slate-500">
                Captura tus días y horarios para ver los resultados y el ganador
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Banner de error general si se intentó enviar con campos incompletos */}
          {attemptedSubmit && !isFormValid && (
            <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-400 text-red-800 text-xs flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-red-900 block">
                  Falta información obligatoria para poder terminar:
                </strong>
                <span className="text-red-700">
                  Por favor revisa y corrige las secciones marcadas en <strong>rojo</strong> abajo (
                  {[
                    isNameEmpty && 'Tu Nombre',
                    isLastNameEmpty && 'Tu Apellido',
                    isDaysEmpty && 'Seleccionar Días',
                    hasTimeError && 'Horario válido',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                  ).
                </span>
              </div>
            </div>
          )}

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  attemptedSubmit && isNameEmpty ? 'text-red-600 font-bold' : 'text-slate-700'
                }`}
              >
                Nombre *
              </label>
              <input
                type="text"
                placeholder="Ej. Roberto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border transition ${
                  attemptedSubmit && isNameEmpty
                    ? 'border-2 border-red-500 bg-red-50/50 text-red-900 focus:outline-none focus:ring-2 focus:ring-red-200'
                    : 'border-slate-200 focus:outline-none focus:border-teal-500'
                }`}
              />
              {attemptedSubmit && isNameEmpty && (
                <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Tu nombre es obligatorio para terminar</span>
                </p>
              )}
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1 ${
                  attemptedSubmit && isLastNameEmpty ? 'text-red-600 font-bold' : 'text-slate-700'
                }`}
              >
                Apellido *
              </label>
              <input
                type="text"
                placeholder="Ej. Gómez"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border transition ${
                  attemptedSubmit && isLastNameEmpty
                    ? 'border-2 border-red-500 bg-red-50/50 text-red-900 focus:outline-none focus:ring-2 focus:ring-red-200'
                    : 'border-slate-200 focus:outline-none focus:border-teal-500'
                }`}
              />
              {attemptedSubmit && isLastNameEmpty && (
                <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Tu apellido es obligatorio para terminar</span>
                </p>
              )}
            </div>
          </div>

          {/* Foto de perfil */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Foto de perfil o Avatar
            </label>
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt="Avatar seleccionado"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500 shadow-xs"
              />
              <div className="flex-1 space-y-2">
                <div className="flex gap-1.5 overflow-x-auto py-1">
                  {DEFAULT_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`w-7 h-7 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                        avatar === av ? 'border-teal-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Opción" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer transition">
                  <Upload className="w-3 h-3 text-slate-500" />
                  <span>Subir foto desde tu dispositivo</span>
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

          {/* Días Disponibles */}
          <div
            className={`transition rounded-2xl p-1 ${
              attemptedSubmit && isDaysEmpty ? 'border-2 border-red-500 bg-red-50/40 p-3' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label
                className={`text-xs font-semibold flex items-center gap-1.5 ${
                  attemptedSubmit && isDaysEmpty ? 'text-red-700 font-bold' : 'text-slate-700'
                }`}
              >
                <CalendarDays className={`w-3.5 h-3.5 ${attemptedSubmit && isDaysEmpty ? 'text-red-600' : 'text-teal-600'}`} />
                <span>¿Qué días puedes salir? (Selecciona casillas) *</span>
              </label>
              <span
                className={`text-[11px] font-bold ${
                  attemptedSubmit && isDaysEmpty ? 'text-red-600' : 'text-slate-600'
                }`}
              >
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
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-2xs'
                        : attemptedSubmit && isDaysEmpty
                        ? 'border-red-300 bg-white text-red-800 hover:border-red-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{day}</span>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : attemptedSubmit && isDaysEmpty
                          ? 'border-red-400 bg-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {attemptedSubmit && isDaysEmpty && (
              <p className="text-[11px] font-bold text-red-600 mt-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>⚠️ Debes seleccionar al menos un día disponible para poder terminar</span>
              </p>
            )}
          </div>

          {/* Horarios Disponibles */}
          <div
            className={`transition rounded-2xl p-1 ${
              attemptedSubmit && hasTimeError ? 'border-2 border-red-500 bg-red-50/40 p-3' : ''
            }`}
          >
            <label
              className={`block text-xs font-semibold mb-2 flex items-center gap-1.5 ${
                attemptedSubmit && hasTimeError ? 'text-red-700 font-bold' : 'text-slate-700'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${attemptedSubmit && hasTimeError ? 'text-red-600' : 'text-teal-600'}`} />
              <span>¿En qué horario puedes ir? *</span>
            </label>

            <div className="space-y-2">
              {/* Opción 1: A cualquier hora */}
              <div
                className={`p-3 rounded-xl border transition ${
                  timeMode === 'any'
                    ? 'border-teal-500 bg-teal-50/40'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="timeMode"
                    value="any"
                    checked={timeMode === 'any'}
                    onChange={() => setTimeMode('any')}
                    className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-800">Puedo a cualquier hora del día</span>
                    <p className="text-[11px] text-slate-500">Tengo total disponibilidad en los días elegidos</p>
                  </div>
                </label>
              </div>

              {/* Opción 2: Rango de hora */}
              <div
                className={`p-3 rounded-xl border transition ${
                  attemptedSubmit && hasRangeError
                    ? 'border-2 border-red-500 bg-red-50/70'
                    : timeMode === 'range'
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
                    <span
                      className={`text-xs font-semibold ${
                        attemptedSubmit && hasRangeError ? 'text-red-800 font-bold' : 'text-slate-800'
                      }`}
                    >
                      Tengo un horario disponible específico (De X a Y)
                    </span>
                    <p className="text-[11px] text-slate-500">Ejemplo: puedo salir de 18:00 a 23:00</p>
                  </div>
                </label>

                {timeMode === 'range' && (
                  <div className="pl-7 pt-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            attemptedSubmit && (!fromTime || isRangeOrderInvalid)
                              ? 'text-red-700'
                              : 'text-slate-600'
                          }`}
                        >
                          De:
                        </span>
                        <input
                          type="time"
                          value={fromTime}
                          onChange={(e) => setFromTime(e.target.value)}
                          className={`px-2 py-1 text-xs rounded-lg border font-medium ${
                            attemptedSubmit && (!fromTime || isRangeOrderInvalid)
                              ? 'border-2 border-red-500 bg-red-50 text-red-900 focus:ring-red-300'
                              : 'border-slate-300 bg-white focus:outline-none focus:border-teal-500'
                          }`}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold ${
                            attemptedSubmit && (!toTime || isRangeOrderInvalid)
                              ? 'text-red-700'
                              : 'text-slate-600'
                          }`}
                        >
                          A:
                        </span>
                        <input
                          type="time"
                          value={toTime}
                          onChange={(e) => setToTime(e.target.value)}
                          className={`px-2 py-1 text-xs rounded-lg border font-medium ${
                            attemptedSubmit && (!toTime || isRangeOrderInvalid)
                              ? 'border-2 border-red-500 bg-red-50 text-red-900 focus:ring-red-300'
                              : 'border-slate-300 bg-white focus:outline-none focus:border-teal-500'
                          }`}
                        />
                      </div>
                    </div>

                    {attemptedSubmit && isRangeMissing && (
                      <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Debes ingresar tanto la hora de inicio como la hora de término</span>
                      </p>
                    )}

                    {attemptedSubmit && isRangeOrderInvalid && (
                      <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Horario inválido: la hora inicial ({fromTime}) debe ser menor a la hora de término ({toTime})
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Opción 3: Libre a partir de cierta hora */}
              <div
                className={`p-3 rounded-xl border transition ${
                  attemptedSubmit && hasAfterError
                    ? 'border-2 border-red-500 bg-red-50/70'
                    : timeMode === 'after'
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
                    <span
                      className={`text-xs font-semibold ${
                        attemptedSubmit && hasAfterError ? 'text-red-800 font-bold' : 'text-slate-800'
                      }`}
                    >
                      Libre a partir de cierto horario
                    </span>
                    <p className="text-[11px] text-slate-500">Ideal si trabajas o tienes compromisos temprano</p>
                  </div>
                </label>

                {timeMode === 'after' && (
                  <div className="pl-7 pt-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          attemptedSubmit && isAfterMissing ? 'text-red-700' : 'text-slate-600'
                        }`}
                      >
                        Disponible a partir de las:
                      </span>
                      <input
                        type="time"
                        value={afterTime}
                        onChange={(e) => setAfterTime(e.target.value)}
                        className={`px-2 py-1 text-xs rounded-lg border font-medium ${
                          attemptedSubmit && isAfterMissing
                            ? 'border-2 border-red-500 bg-red-50 text-red-900 focus:ring-red-300'
                            : 'border-slate-300 bg-white focus:outline-none focus:border-teal-500'
                        }`}
                      />
                    </div>

                    {attemptedSubmit && isAfterMissing && (
                      <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Debes especificar a partir de qué hora estás disponible</span>
                      </p>
                    )}
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
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>

            {/* BOTÓN TERMINAR */}
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs sm:text-sm font-bold transition shadow-md shadow-teal-600/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>Terminar y Ver Resultados</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
