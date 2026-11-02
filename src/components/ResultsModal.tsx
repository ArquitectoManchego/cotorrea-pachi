'use client';

import React from 'react';
import { EventData, PlaceOption, Participant } from '@/types';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Heart,
  X,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Share2,
  Plus,
  Compass,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
  currentParticipant: Participant | null;
  onVote: (placeId: string) => void;
  onOpenPropose: () => void;
  onOpenShareModal: () => void;
  onViewOnMap: (place?: PlaceOption) => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  event,
  currentParticipant,
  onVote,
  onOpenPropose,
  onOpenShareModal,
  onViewOnMap,
}) => {
  if (!isOpen) return null;

  // Calculate sorted places by likes count
  const sortedPlaces = [...event.lugaresPropuestos].sort(
    (a, b) => b.votos.length - a.votos.length
  );
  const maxLikes = Math.max(...event.lugaresPropuestos.map((p) => p.votos.length), 0);
  const winningPlace = maxLikes > 0 ? sortedPlaces[0] : null;

  // Calculate best day
  const dayCounts: { [key: string]: number } = {};
  event.participantes.forEach((p) => {
    p.diasDisponibles.forEach((day) => {
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
  });

  let bestDay = 'Por definir';
  let bestDayVotes = 0;
  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > bestDayVotes) {
      bestDayVotes = count;
      bestDay = day;
    }
  });

  // Recommended time
  let recommendedTime = 'Horario flexible';
  const afterHours = event.participantes
    .filter((p) => p.horario.mode === 'after' && p.horario.afterTime)
    .map((p) => p.horario.afterTime as string)
    .sort();

  if (afterHours.length > 0) {
    recommendedTime = `A partir de las ${afterHours[afterHours.length - 1]} hrs`;
  } else if (event.participantes.length > 0) {
    const ranges = event.participantes.filter((p) => p.horario.mode === 'range');
    if (ranges.length > 0 && ranges[0].horario.fromTime) {
      recommendedTime = `${ranges[0].horario.fromTime} a ${ranges[0].horario.toTime || '23:00'} hrs`;
    }
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0d9488', '#10b981', '#f59e0b', '#ec4899'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header with success notification */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              🎉
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider text-teal-100 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  Captura Terminada
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                ¡Información Guardada con Éxito!
              </h2>
              <p className="text-xs text-teal-100">
                Tus días y horarios quedaron registrados. Conoce los resultados y likes de los lugares:
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* WINNER SPOTLIGHT */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Lugar Ganador Hasta el Momento</span>
              </h3>
              {winningPlace && (
                <button
                  type="button"
                  onClick={triggerConfetti}
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Celebrar 🎊</span>
                </button>
              )}
            </div>

            {winningPlace ? (
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50/60 to-emerald-50 border-2 border-amber-300/80 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                        <Trophy className="w-3 h-3 fill-current" />
                        🏆 1er Lugar en Votos
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/80 border border-amber-200 text-[10px] font-semibold text-slate-700">
                        {winningPlace.categoria.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-slate-900 leading-tight">
                      {winningPlace.nombre}
                    </h4>

                    {winningPlace.direccionAprox && (
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{winningPlace.direccionAprox}</span>
                      </p>
                    )}

                    {/* Voted friends avatars */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Le gusta a:</span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {winningPlace.votos.map((voterId) => {
                          const voter = event.participantes.find((p) => p.id === voterId);
                          return (
                            <img
                              key={voterId}
                              src={voter?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={voter?.nombre || 'Amigo'}
                              title={voter ? `${voter.nombre} ${voter.apellido}` : 'Amigo'}
                              className="w-6 h-6 rounded-full border-2 border-white object-cover"
                            />
                          );
                        })}
                      </div>
                      <span className="font-bold text-amber-700">
                        ({winningPlace.votos.length} {winningPlace.votos.length === 1 ? 'amigo' : 'amigos'})
                      </span>
                    </div>
                  </div>

                  {/* Likes Pill & Actions */}
                  <div className="flex flex-col items-end gap-2.5 shrink-0">
                    <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-900 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                      <div>
                        <span className="text-xl font-black leading-none">{winningPlace.votos.length}</span>
                        <span className="text-[11px] font-bold block text-amber-800">
                          {winningPlace.votos.length === 1 ? 'Like' : 'Likes'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onViewOnMap(winningPlace);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center gap-1 shadow-2xs transition"
                      >
                        <Compass className="w-3.5 h-3.5 text-teal-600" />
                        <span>Ver en Mapa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onVote(winningPlace.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1 shadow-2xs transition ${
                          currentParticipant && winningPlace.votos.includes(currentParticipant.id)
                            ? 'bg-rose-50 border-rose-300 text-rose-700'
                            : 'bg-white hover:bg-rose-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            currentParticipant && winningPlace.votos.includes(currentParticipant.id)
                              ? 'text-rose-600 fill-rose-600'
                              : 'text-slate-400'
                          }`}
                        />
                        <span>
                          {currentParticipant && winningPlace.votos.includes(currentParticipant.id)
                            ? 'Te gusta'
                            : 'Dar Like'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  Aún no hay votos registrados para los lugares propuestos.
                </p>
                <p className="text-[11px] text-teal-700 font-medium">
                  ¡Sé el primero en darle like a tu opción favorita en la tabla de abajo!
                </p>
              </div>
            )}
          </div>

          {/* ALL PLACES RANKING & LIKES COUNT */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Ranking de Todos los Lugares y Conteo de Likes</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {event.lugaresPropuestos.length} lugares propuestos
              </span>
            </div>

            {event.lugaresPropuestos.length === 0 ? (
              <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 text-center space-y-2">
                <p className="text-xs text-teal-900 font-medium">
                  Aún no se ha propuesto ningún lugar para esta salida.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPropose();
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Proponer el Primer Lugar</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {sortedPlaces.map((place, index) => {
                  const hasVoted = currentParticipant
                    ? place.votos.includes(currentParticipant.id)
                    : false;
                  const percent =
                    event.participantes.length > 0
                      ? Math.round((place.votos.length / event.participantes.length) * 100)
                      : 0;
                  const isTop = index === 0 && place.votos.length > 0;

                  return (
                    <div
                      key={place.id}
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition ${
                        isTop ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Left: Position & Details */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isTop
                              ? 'bg-amber-400 text-amber-950 shadow-2xs'
                              : index === 1
                              ? 'bg-slate-200 text-slate-800'
                              : index === 2
                              ? 'bg-orange-100 text-orange-900'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          #{index + 1}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {place.nombre}
                            </span>
                            <span className="text-[10px] uppercase font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {place.categoria}
                            </span>
                          </div>

                          {place.direccionAprox && (
                            <p className="text-[11px] text-slate-500 truncate max-w-xs">
                              {place.direccionAprox}
                            </p>
                          )}

                          {/* Progress bar of likes */}
                          <div className="flex items-center gap-2 pt-1 w-44">
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isTop ? 'bg-amber-500' : 'bg-teal-500'
                                }`}
                                style={{ width: `${Math.min(percent, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-600 shrink-0">
                              {percent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Likes Badge & Vote Action */}
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                          <span>{place.votos.length} {place.votos.length === 1 ? 'like' : 'likes'}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onVote(place.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 shadow-2xs ${
                            hasVoted
                              ? 'bg-rose-600 border-rose-600 text-white'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${hasVoted ? 'fill-white text-white' : 'text-slate-400'}`}
                          />
                          <span>{hasVoted ? '¡Te gusta!' : 'Dar Like'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CONSENSUS SUMMARY CARD (DÍA Y HORARIO) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">
                  Día con mayor disponibilidad:
                </span>
                <span className="font-bold text-slate-900 text-sm">{bestDay}</span>
                <span className="text-slate-600 text-[11px] block">
                  {bestDayVotes} de {event.participantes.length} amigos coinciden
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 block">
                  Horario estimado sugerido:
                </span>
                <span className="font-bold text-slate-900 text-sm">{recommendedTime}</span>
                <span className="text-slate-600 text-[11px] block">
                  Basado en las respuestas del grupo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenShareModal();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invitar a más amigos por WhatsApp</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewOnMap();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
            >
              Ver en el Mapa
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-2xs transition"
            >
              Listo, Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
