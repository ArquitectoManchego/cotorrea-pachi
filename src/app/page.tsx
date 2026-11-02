'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { EventData, Participant, PlaceOption } from '@/types';
import { Navbar } from '@/components/Navbar';
import { ConsensusBanner } from '@/components/ConsensusBanner';
import { AvailabilityGrid } from '@/components/AvailabilityGrid';
import { PlacesList } from '@/components/PlacesList';
import { UnifiedMapView } from '@/components/UnifiedMapView';
import { PlaceSearchAndAdd } from '@/components/PlaceSearchAndAdd';
import { RegisterModal } from '@/components/RegisterModal';
import { ProposePlaceModal } from '@/components/ProposePlaceModal';
import { CreateEventModal } from '@/components/CreateEventModal';
import { ShareEventModal } from '@/components/ShareEventModal';
import { DatabaseStatusModal } from '@/components/DatabaseStatusModal';
import { ResultsModal } from '@/components/ResultsModal';
import { CreateEventParams } from '@/lib/dataStore';
import {
  MapPin,
  CalendarDays,
  Plus,
  Users,
  Sparkles,
  Info,
  Compass,
  ArrowRight,
  MessageCircle,
  Clock,
  History,
  Trophy,
} from 'lucide-react';

interface DbStatus {
  provider: string;
  isConfigured: boolean;
  name: string;
}

interface RecentEventItem {
  id: string;
  codigo: string;
  titulo: string;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando Cotorrea Pachi...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [currentEvent, setCurrentEvent] = useState<EventData | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEventItem[]>([]);
  const [inputCode, setInputCode] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isProposeOpen, setIsProposeOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  // Map state
  const [previewPlace, setPreviewPlace] = useState<{ name: string; lat: number; lng: number; address: string } | null>(null);
  const [focusedPlace, setFocusedPlace] = useState<PlaceOption | null>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'map' | 'schedule'>('map');
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);

  const [dbStatus, setDbStatus] = useState<DbStatus>({
    provider: 'memory',
    isConfigured: false,
    name: 'Verificando base de datos...',
  });

  // Fetch Event by ID/code
  const loadEventByCode = async (code: string) => {
    setIsLoading(true);
    setNotFoundCode(null);
    try {
      const res = await fetch(`/api/event?id=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data: EventData = await res.json();
        setCurrentEvent(data);

        // Update URL cleanly without reload
        if (typeof window !== 'undefined') {
          const newUrl = `${window.location.pathname}?e=${data.codigo}`;
          window.history.pushState({ path: newUrl }, '', newUrl);
          localStorage.setItem('cotorrea_pachi_active_event_id', data.codigo);

          // Save to recent events
          saveToRecentEvents(data.codigo, data.titulo);

          // Check if current user is participant
          const savedUserId = localStorage.getItem(`cotorrea_user_${data.codigo}`);
          if (savedUserId) {
            const found = data.participantes.find((p) => p.id === savedUserId);
            if (found) setCurrentParticipant(found);
          } else if (data.participantes.length > 0) {
            // Check global user
            const globalUserId = localStorage.getItem('cotorrea_pachi_user_id');
            const found = data.participantes.find((p) => p.id === globalUserId);
            if (found) setCurrentParticipant(found);
          }
        }
      } else {
        setNotFoundCode(code);
        setCurrentEvent(null);
      }
    } catch (err) {
      console.error('Error cargando evento:', err);
      setNotFoundCode(code);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToRecentEvents = (code: string, titulo: string) => {
    try {
      const raw = localStorage.getItem('cotorrea_recent_events');
      let items: RecentEventItem[] = raw ? JSON.parse(raw) : [];
      items = items.filter((item) => item.codigo !== code);
      items.unshift({ id: code, codigo: code, titulo });
      items = items.slice(0, 5); // keep max 5
      localStorage.setItem('cotorrea_recent_events', JSON.stringify(items));
      setRecentEvents(items);
    } catch {}
  };

  // Initial load: parse URL query params or recent events
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('e') || params.get('evento') || params.get('code');

    // Load recent events list from local storage
    try {
      const raw = localStorage.getItem('cotorrea_recent_events');
      if (raw) setRecentEvents(JSON.parse(raw));
    } catch {}

    // Check DB status
    fetch('/api/db/status')
      .then((res) => res.json())
      .then((data) => setDbStatus(data))
      .catch(() => {});

    if (codeParam) {
      loadEventByCode(codeParam);
    } else {
      // Check if user had an active event
      const savedCode = localStorage.getItem('cotorrea_pachi_active_event_id');
      if (savedCode) {
        loadEventByCode(savedCode);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  // Action: Create New Event
  const handleCreateEvent = async (params: CreateEventParams) => {
    try {
      const res = await fetch('/api/event/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const newEvent: EventData = await res.json();
        setCurrentEvent(newEvent);
        setCurrentParticipant(newEvent.participantes[0]);

        localStorage.setItem('cotorrea_pachi_active_event_id', newEvent.codigo);
        localStorage.setItem(`cotorrea_user_${newEvent.codigo}`, newEvent.organizadorId);
        localStorage.setItem('cotorrea_pachi_user_id', newEvent.organizadorId);
        saveToRecentEvents(newEvent.codigo, newEvent.titulo);

        const newUrl = `${window.location.pathname}?e=${newEvent.codigo}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        setIsCreateModalOpen(false);
        setIsShareModalOpen(true);
      }
    } catch (err) {
      console.error('Error creando evento:', err);
    }
  };

  // Action: Save or Update Participant
  const handleSaveParticipant = async (participant: Participant) => {
    if (!currentEvent) return;

    try {
      const res = await fetch('/api/event/participant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: currentEvent.id, participant }),
      });

      if (res.ok) {
        const updated: EventData = await res.json();
        setCurrentEvent(updated);
        setCurrentParticipant(participant);
        localStorage.setItem(`cotorrea_user_${currentEvent.codigo}`, participant.id);
        localStorage.setItem('cotorrea_pachi_user_id', participant.id);
        setIsResultsOpen(true);
      }
    } catch (err) {
      console.error('Error guardando participante:', err);
    }
  };

  // Action: Propose a Place
  const handleAddPlace = async (place: PlaceOption) => {
    if (!currentEvent) return;

    try {
      const res = await fetch('/api/event/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: currentEvent.id, place }),
      });

      if (res.ok) {
        const updated: EventData = await res.json();
        setCurrentEvent(updated);
        setFocusedPlace(place);
      }
    } catch (err) {
      console.error('Error proponiendo lugar:', err);
    }
  };

  // Action: Vote for a Place
  const handleVote = async (placeId: string) => {
    if (!currentEvent) return;

    if (!currentParticipant) {
      setIsRegisterOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/event/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: currentEvent.id,
          placeId,
          participantId: currentParticipant.id,
        }),
      });

      if (res.ok) {
        const updated: EventData = await res.json();
        setCurrentEvent(updated);
      }
    } catch (err) {
      console.error('Error votando:', err);
    }
  };

  // Focus place and zoom on map from card click
  const handleSelectPlaceOnMap = (place: PlaceOption) => {
    setFocusedPlace(place);
    setActiveTab('map');
    if (mapSectionRef.current) {
      mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (isLoading) {
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
        currentEvent={currentEvent}
        currentParticipant={currentParticipant}
        onOpenCreateEvent={() => setIsCreateModalOpen(true)}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        dbStatus={dbStatus}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* VIEW A: NO EVENT SELECTED (LANDING & CREATE FLOW) */}
      {!currentEvent ? (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
          {/* Hero Banner */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
              <span>📍 Veracruz / Boca del Río &bull; Salidas con Amigos</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              ¿Cuándo y Dónde nos vemos?
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Crea una salida, define tus horarios y comparte un enlace único por WhatsApp para que tus amigos marquen sus días y propongan lugares en el mapa de Google sin pleitos.
            </p>

            {/* Main Action: Crear Salida */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-600/25 transition transform active:scale-95"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>Crear Nueva Salida</span>
              </button>
            </div>
          </div>

          {/* Join with code box */}
          <div className="max-w-md mx-auto bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ¿Te invitaron a una salida? Ingresa el código:
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. PACHI-8924"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-teal-500 text-center"
              />
              <button
                type="button"
                onClick={() => {
                  if (inputCode.trim()) loadEventByCode(inputCode.trim());
                }}
                disabled={!inputCode.trim()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Entrar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {notFoundCode && (
              <p className="text-xs text-rose-600 font-medium">
                ⚠️ No encontramos ninguna salida con el código &quot;{notFoundCode}&quot;. Revisa el código o crea una nueva.
              </p>
            )}
          </div>

          {/* Recent events in local storage */}
          {recentEvents.length > 0 && (
            <div className="max-w-md mx-auto space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Tus Salidas Recientes:</span>
              </h4>
              <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {recentEvents.map((item) => (
                  <button
                    key={item.codigo}
                    type="button"
                    onClick={() => loadEventByCode(item.codigo)}
                    className="w-full text-left p-3.5 hover:bg-teal-50/70 transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{item.titulo}</p>
                      <p className="text-[11px] text-teal-700 font-mono font-semibold">Código: {item.codigo}</p>
                    </div>
                    <span className="text-slate-400">&rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      ) : (
        /* VIEW B: ACTIVE EVENT PLANNER */
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Event Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                  Salida Activa: {currentEvent.codigo}
                </span>
                <span className="text-xs text-slate-400">
                  Creado por {currentEvent.organizadorNombre}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {currentEvent.titulo}
              </h1>
              {currentEvent.descripcion && (
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {currentEvent.descripcion}
                </p>
              )}
            </div>

            {/* Quick CTA Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsResultsOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs transition shadow-sm shadow-amber-500/20 active:scale-95"
              >
                <Trophy className="w-4 h-4 fill-white" />
                <span>Resultados y Likes 🏆</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition shadow-sm shadow-emerald-500/20 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Invitar por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-sm shadow-teal-600/20 active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span>{currentParticipant ? 'Mis Días / Horario' : 'Registrar mis días'}</span>
              </button>
            </div>
          </div>

          {/* Smart Consensus / Matchmaker Result */}
          <ConsensusBanner
            event={currentEvent}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onOpenResultsModal={() => setIsResultsOpen(true)}
          />

          {/* Search and Add Location with Google Maps */}
          <PlaceSearchAndAdd
            currentParticipant={currentParticipant}
            onAddPlace={handleAddPlace}
            onPreviewPlace={(preview) => setPreviewPlace(preview)}
            onRequireParticipant={() => setIsRegisterOpen(true)}
            externalSelectedPlace={previewPlace}
          />

          {/* Navigation View Switcher */}
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
                <Compass className="w-3.5 h-3.5" />
                <span>Mapa y Lugares ({currentEvent.lugaresPropuestos.length})</span>
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
                <span>Días y Horarios ({currentEvent.participantes.length} amigos)</span>
              </button>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5" />
              <span>Veracruz &bull; Blvd. Manuel Ávila Camacho</span>
            </span>
          </div>

          {/* Tab 1: Map and Places */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              {/* Map Section */}
              <div ref={mapSectionRef} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>Mapa de Lugares Propuestos (Veracruz / Blvd. Ávila Camacho)</span>
                  </h3>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    Todos los lugares se muestran con su pin y nombre
                  </span>
                </div>

                <UnifiedMapView
                  places={currentEvent.lugaresPropuestos}
                  currentParticipantId={currentParticipant?.id}
                  onVote={handleVote}
                  focusedPlace={focusedPlace}
                  previewPlace={previewPlace}
                  onSelectLocation={(loc) => {
                    setPreviewPlace(loc);
                  }}
                />
              </div>

              {/* Places List */}
              <PlacesList
                places={currentEvent.lugaresPropuestos}
                currentParticipantId={currentParticipant?.id}
                onVote={handleVote}
                onOpenPropose={() => setIsProposeOpen(true)}
                onSelectOnMap={handleSelectPlaceOnMap}
                selectedPlaceId={focusedPlace?.id}
              />
            </div>
          )}

          {/* Tab 2: Availability */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <AvailabilityGrid
                participants={currentEvent.participantes}
                onOpenRegister={() => setIsRegisterOpen(true)}
                currentParticipantId={currentParticipant?.id}
              />
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            🍻 <strong>Cotorrea Pachi</strong> &copy; 2026. Salidas organizadas en el Boulevard de Veracruz y en cualquier lugar.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="text-slate-600 hover:text-emerald-700 font-medium underline flex items-center gap-1"
            >
              <span>Base de Datos ({dbStatus.isConfigured ? 'Supabase Conectado' : 'Configurar'})</span>
            </button>
            <a
              href="https://github.com/ArquitectoManchego/cotorrea-pachi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-teal-700 font-medium underline"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateEvent}
      />

      {currentEvent && (
        <ShareEventModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          event={currentEvent}
        />
      )}

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
        onPropose={handleAddPlace}
        onRequireParticipant={() => {
          setIsProposeOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      <DatabaseStatusModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        dbStatus={dbStatus}
      />

      {currentEvent && (
        <ResultsModal
          isOpen={isResultsOpen}
          onClose={() => setIsResultsOpen(false)}
          event={currentEvent}
          currentParticipant={currentParticipant}
          onVote={handleVote}
          onOpenPropose={() => setIsProposeOpen(true)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onViewOnMap={(place) => {
            if (place) {
              handleSelectPlaceOnMap(place);
            } else {
              setActiveTab('map');
              if (mapSectionRef.current) {
                mapSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }}
        />
      )}
    </div>
  );
}
