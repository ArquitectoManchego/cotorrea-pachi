'use client';

import React, { useState } from 'react';
import { EventData, DayOfWeek } from '@/types';
import confetti from 'canvas-confetti';
import { Sparkles, Calendar, Clock, MapPin, Check, Copy, CalendarPlus, Share2 } from 'lucide-react';

interface ConsensusBannerProps {
  event: EventData;
  onOpenShareModal?: () => void;
  onOpenResultsModal?: () => void;
}

const DAYS_ORDER: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const ConsensusBanner: React.FC<ConsensusBannerProps> = ({
  event,
  onOpenShareModal,
  onOpenResultsModal,
}) => {
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // 1. Calculate best day
  const dayCounts: { [key in DayOfWeek]: number } = {
    Lunes: 0,
    Martes: 0,
    Miércoles: 0,
    Jueves: 0,
    Viernes: 0,
    Sábado: 0,
    Domingo: 0,
  };

  event.participantes.forEach((p) => {
    p.diasDisponibles.forEach((day) => {
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
  });

  let bestDay: DayOfWeek = 'Sábado';
  let bestDayVotes = 0;
  DAYS_ORDER.forEach((day) => {
    if (dayCounts[day] > bestDayVotes) {
      bestDayVotes = dayCounts[day];
      bestDay = day;
    }
  });

  // 2. Calculate top venue
  const sortedPlaces = [...event.lugaresPropuestos].sort((a, b) => b.votos.length - a.votos.length);
  const topPlace = sortedPlaces[0];

  // 3. Recommended time estimate
  let recommendedTime = 'A convenir';
  const afterHours = event.participantes
    .filter((p) => p.horario.mode === 'after' && p.horario.afterTime)
    .map((p) => p.horario.afterTime as string)
    .sort();

  if (afterHours.length > 0) {
    const latestStart = afterHours[afterHours.length - 1];
    recommendedTime = `A partir de las ${latestStart} hrs`;
  } else if (event.participantes.length > 0) {
    const ranges = event.participantes.filter((p) => p.horario.mode === 'range');
    if (ranges.length > 0 && ranges[0].horario.fromTime) {
      recommendedTime = `${ranges[0].horario.fromTime} a ${ranges[0].horario.toTime || '23:00'} hrs`;
    } else {
      recommendedTime = 'Horario flexible / Todo el día';
    }
  }

  const handleConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0d9488', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
    });
  };

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://cotorrea-pachi.vercel.app';
  const shareUrl = `${currentOrigin}/?e=${event.codigo}`;

  const generateWhatsAppMessage = () => {
    const placeName = topPlace ? topPlace.nombre : 'Por proponer en el mapa';
    const placeAddress = topPlace?.direccionAprox ? ` (${topPlace.direccionAprox})` : '';
    const participantsList = event.participantes.map((p) => p.nombre).join(', ');

    return `🍻 *¡Qué onda plebes! Ya tenemos acuerdo en Cotorrea Pachi* 🍻\n\n` +
      `📌 *Salida:* ${event.titulo}\n` +
      `📅 *Día con más amigos:* ${bestDay} (${bestDayVotes}/${event.participantes.length || 1} amigos)\n` +
      `⏰ *Horario sugerido:* ${recommendedTime}\n` +
      `📍 *Lugar favorito:* ${placeName}${placeAddress}\n\n` +
      `👥 *Confirmados:* ${participantsList || 'Sé el primero'}\n\n` +
      `👉 Entra aquí para votar o proponer más lugares:\n${shareUrl}\n` +
      `🔑 Código: ${event.codigo}`;
  };

  const handleCopyWhatsApp = async () => {
    const msg = generateWhatsAppMessage();
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(msg);
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2500);
    }
  };

  const handleDownloadICS = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Cotorrea Pachi//Event Planner//ES',
      'BEGIN:VEVENT',
      `SUMMARY:${event.titulo}`,
      `DESCRIPTION:Quedada coordinada en Cotorrea Pachi. Lugar: ${topPlace ? topPlace.nombre : 'Por definir'}`,
      `LOCATION:${topPlace ? topPlace.nombre + (topPlace.direccionAprox ? ' ' + topPlace.direccionAprox : '') : 'Veracruz'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `cotorrea-${event.codigo}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white shadow-lg p-6 sm:p-8">
      {/* Decorative ambient blobs */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Optimal Match */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-emerald-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Consenso en Tiempo Real ({event.codigo})</span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              🎯 Mejor Opción para la Salida
            </h2>
            <p className="text-teal-100/90 text-xs sm:text-sm mt-1">
              Basado en los días y horarios que van marcando tus amigos:
            </p>
          </div>

          {/* Cards metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Día */}
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="flex items-center gap-1.5 text-xs text-teal-200 font-medium mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Día Ganador</span>
              </div>
              <div className="font-bold text-base text-white">{bestDayVotes > 0 ? bestDay : 'Esperando votos'}</div>
              <div className="text-[11px] text-teal-200">
                {bestDayVotes} de {event.participantes.length} amigos listos
              </div>
            </div>

            {/* Horario */}
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="flex items-center gap-1.5 text-xs text-teal-200 font-medium mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Horario Óptimo</span>
              </div>
              <div className="font-bold text-sm text-white truncate">{recommendedTime}</div>
              <div className="text-[11px] text-teal-200">Coincidencia de horarios</div>
            </div>

            {/* Lugar */}
            <div
              onClick={onOpenResultsModal}
              className={`p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 transition ${
                onOpenResultsModal ? 'cursor-pointer hover:bg-white/20 hover:scale-[1.02]' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-xs text-teal-200 font-medium mb-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Lugar Favorito (Ganador)</span>
                </div>
                {onOpenResultsModal && (
                  <span className="text-[10px] text-amber-300 font-bold underline">Ver Likes 🏆</span>
                )}
              </div>
              <div className="font-bold text-sm text-white truncate">
                {topPlace ? topPlace.nombre : 'Sin lugares aún'}
              </div>
              <div className="text-[11px] text-teal-200">
                {topPlace ? `❤️ ${topPlace.votos.length} likes acumulados` : 'Usa el buscador para agregar'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
          <button
            onClick={handleConfetti}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm transition shadow-lg shadow-amber-400/30 transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>¡Concretar Salida! 🥳</span>
          </button>

          <button
            onClick={handleCopyWhatsApp}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs border border-white/20 backdrop-blur-md transition"
          >
            {copiedWhatsApp ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-200 font-semibold">¡Copiado para WhatsApp!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-teal-200" />
                <span>Copiar Resumen para WhatsApp</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadICS}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-transparent hover:bg-white/10 text-teal-100 font-medium text-xs transition"
          >
            <CalendarPlus className="w-4 h-4 text-teal-200" />
            <span>Descargar archivo Calendario (.ics)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
