'use client';

import React, { useEffect, useState } from 'react';
import { EventData, Participant, PlaceOption } from '@/types';
import { Navbar } from '@/components/Navbar';
import { ConsensusBanner } from '@/components/ConsensusBanner';
import { AvailabilityGrid } from '@/components/AvailabilityGrid';
import { PlacesList } from '@/components/PlacesList';
import { InteractiveMap } from '@/components/InteractiveMap';
import { RegisterModal } from '@/components/RegisterModal';
import { ProposePlaceModal } from '@/components/ProposePlaceModal';
import {
  MapPin,
  CalendarDays,
  Plus,
  Users,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';

export default function HomePage() {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isProposeOpen, setIsProposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'schedule'>('map');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load event data from server
  const fetchEvent = async () => {
    try {
      const res = await fetch('/api/event');
      if (res.ok) {
        const data: EventData = await res.json();
        setEventData(data);

        // Check local storage for current participant
        const savedId = localStorage.getItem('cotorrea_pachi_participant_id');
        if (savedId) {
          const found = data.participantes.find((p) => p.id === savedId);
          if (found) {
            setCurrentParticipant(found);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching event data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  const handleSaveParticipant = async (participant: Participant) => {
    try {
      const res = await fetch('/api/event/participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participant),
      });
      if (res.ok) {
        const updated: EventData = await res.json();
        setEventData(updated);
        setCurrentParticipant(participant);
        localStorage.setItem('cotorrea_pachi_participant_id', participant.id);
      }
    } catch (err) {
      console.error('Error saving participant:', err);
    }
  };

  const handleProposePlace = async (place: PlaceOption) => {
    try {
      const res = await fetch('/api/event/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(place),
      });
      if (res.ok) {
        const updated: EventData = await res.json();
        setEventData(updated);
        setSelectedPlaceId(place.id);
      }
    } catch (err) {
      console.error('Error proposing place:', err);
    }
  };

  const handleVote = async (placeId: string) => {
    if (!currentParticipant) {
      setIsRegisterOpen(true);
      return;
    }
    try {
      const res = await fetch('/api/event/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, participantId: currentParticipant.id }),
      });
      if (res.ok) {
        const updated: EventData = await res.json();
        setEventData(updated);
      }
    } catch (err) {
      console.error('Error voting on place:', err);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('¿Deseas reiniciar los datos a la demostración original?')) return;
    try {
      const res = await fetch('/api/event/reset', { method: 'POST' });
      if (res.ok) {
        const updated: EventData = await res.json();
        setEventData(updated);
        localStorage.removeItem('cotorrea_pachi_participant_id');
        setCurrentParticipant(null);
      }
    } catch (err) {
      console.error('Error resetting demo:', err);
    }
  };

  if (isLoading || !eventData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md animate-pulse">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-600 mt-4">Cargando Cotorrea Pachi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentParticipant={currentParticipant}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onResetDemo={handleResetDemo}
        totalParticipants={eventData.participantes.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Event Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                Quedada Activa
              </span>
              <span className="text-xs text-slate-400">
                Organizado por {eventData.organizador}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {eventData.titulo}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {eventData.descripcion}
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-sm shadow-teal-600/20"
            >
              <Users className="w-4 h-4" />
              <span>{currentParticipant ? 'Mi Disponibilidad' : 'Registrar mis días'}</span>
            </button>

            <button
              onClick={() => setIsProposeOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition shadow-sm shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Proponer Lugar</span>
            </button>
          </div>
        </div>

        {/* Smart Consensus / Matchmaker Result */}
        <ConsensusBanner event={eventData} />

        {/* View Switcher / Tabs for Responsive layout */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'map'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Mapa y Lugares ({eventData.lugaresPropuestos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'schedule'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Días y Horarios ({eventData.participantes.length} amigos)</span>
            </button>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5" />
            <span>Actualizado en tiempo real</span>
          </span>
        </div>

        {/* Tab Content 1: Map and Places */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Interactive Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  <span>Explorador de Lugares en el Mapa</span>
                </h3>
                <span className="text-xs text-slate-500">
                  Haz clic en cualquier pin para ver quién lo propuso y votar
                </span>
              </div>
              <InteractiveMap
                places={eventData.lugaresPropuestos}
                currentParticipantId={currentParticipant?.id}
                onVote={handleVote}
                selectedPlaceId={selectedPlaceId}
              />
            </div>

            {/* Places List */}
            <PlacesList
              places={eventData.lugaresPropuestos}
              currentParticipantId={currentParticipant?.id}
              onVote={handleVote}
              onOpenPropose={() => setIsProposeOpen(true)}
              onSelectOnMap={(placeId) => {
                setSelectedPlaceId(placeId);
                window.scrollTo({ top: 320, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* Tab Content 2: Availability Schedule */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <AvailabilityGrid
              participants={eventData.participantes}
              onOpenRegister={() => setIsRegisterOpen(true)}
              currentParticipantId={currentParticipant?.id}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            🍻 <strong>Cotorrea Pachi</strong> &copy; 2026. Diseñado para que armar la salida sea rápido y sin pleitos.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ArquitectoManchego/cotorrea-pachi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-teal-700 font-medium underline"
            >
              GitHub Repo
            </a>
            <a
              href="https://cotorrea-pachi.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-teal-700 font-medium underline"
            >
              Vercel App
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        currentParticipant={currentParticipant}
        onSave={handleSaveParticipant}
      />

      <ProposePlaceModal
        isOpen={isProposeOpen}
        onClose={() => setIsProposeOpen(false)}
        currentParticipant={currentParticipant}
        onPropose={handleProposePlace}
        onRequireParticipant={() => {
          setIsProposeOpen(false);
          setIsRegisterOpen(true);
        }}
      />
    </div>
  );
}
