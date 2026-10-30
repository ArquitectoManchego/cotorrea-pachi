'use client';

import React from 'react';
import { DayOfWeek, Participant } from '@/types';
import { Check, Clock, MessageSquare, Sparkles, UserCheck } from 'lucide-react';

const DAYS_LIST: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface AvailabilityGridProps {
  participants: Participant[];
  onOpenRegister: () => void;
  currentParticipantId?: string;
}

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({
  participants,
  onOpenRegister,
  currentParticipantId,
}) => {
  // Calculate score per day
  const dayCounts: { [key in DayOfWeek]: number } = {
    Lunes: 0,
    Martes: 0,
    Miércoles: 0,
    Jueves: 0,
    Viernes: 0,
    Sábado: 0,
    Domingo: 0,
  };

  participants.forEach((p) => {
    p.diasDisponibles.forEach((day) => {
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
  });

  const maxDayVotes = Math.max(...Object.values(dayCounts), 0);

  const formatHorario = (p: Participant) => {
    const { mode, fromTime, toTime, afterTime } = p.horario;
    if (mode === 'any') {
      return 'Cualquier hora / Todo el día';
    }
    if (mode === 'range') {
      return `${fromTime || '18:00'} a ${toTime || '23:00'}`;
    }
    if (mode === 'after') {
      return `A partir de las ${afterTime || '19:00'}`;
    }
    return 'Horario flexible';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">
              📅 Disponibilidad y Horarios de la Banda
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-0.5 rounded-full">
              {participants.length} respuestas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Días marcados con casillas de verificación y disponibilidad de horario por amigo
          </p>
        </div>

        <button
          onClick={onOpenRegister}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition"
        >
          <UserCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>{currentParticipantId ? 'Actualizar mis días' : 'Agregar mis días'}</span>
        </button>
      </div>

      {/* Days Score Bar (Semáforo de coincidencia) */}
      <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
        {DAYS_LIST.map((day) => {
          const count = dayCounts[day];
          const pct = participants.length > 0 ? Math.round((count / participants.length) * 100) : 0;
          const isWinner = count === maxDayVotes && maxDayVotes > 0;

          return (
            <div
              key={day}
              className={`p-2.5 rounded-2xl border text-center transition ${
                isWinner
                  ? 'bg-gradient-to-b from-emerald-50 to-teal-50/50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-xs font-bold text-slate-700">{day.substring(0, 3)}</span>
                {isWinner && <Sparkles className="w-3 h-3 text-emerald-600" />}
              </div>
              <div
                className={`text-lg font-black ${
                  isWinner ? 'text-emerald-700' : 'text-slate-800'
                }`}
              >
                {count}/{participants.length}
              </div>
              <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{pct}% pueden</div>
            </div>
          );
        })}
      </div>

      {/* Friends list cards */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Detalle por Persona:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {participants.map((friend) => {
            const isMe = friend.id === currentParticipantId;

            return (
              <div
                key={friend.id}
                className={`p-4 rounded-2xl border transition ${
                  isMe
                    ? 'border-teal-300 bg-teal-50/20 shadow-2xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                {/* User Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.avatar}
                      alt={friend.nombre}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-800">
                          {friend.nombre} {friend.apellido}
                        </span>
                        {isMe && (
                          <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded-md">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatHorario(friend)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Day pills */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {DAYS_LIST.map((day) => {
                    const canGo = friend.diasDisponibles.includes(day);
                    if (!canGo) return null;
                    return (
                      <span
                        key={day}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800"
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                        {day}
                      </span>
                    );
                  })}
                </div>

                {/* Optional comment */}
                {friend.comentario && (
                  <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="italic">“{friend.comentario}”</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
