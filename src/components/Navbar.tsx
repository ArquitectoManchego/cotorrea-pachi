'use client';

import React, { useState } from 'react';
import { Participant, EventData } from '@/types';
import { Beer, Share2, UserPlus, Check, Plus, Database, Copy, MessageCircle } from 'lucide-react';

interface NavbarProps {
  currentEvent: EventData | null;
  currentParticipant: Participant | null;
  onOpenCreateEvent: () => void;
  onOpenRegister: () => void;
  onOpenShareModal: () => void;
  dbStatus?: {
    provider: string;
    isConfigured: boolean;
    name: string;
  };
  onOpenDbModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentEvent,
  currentParticipant,
  onOpenCreateEvent,
  onOpenRegister,
  onOpenShareModal,
  dbStatus,
  onOpenDbModal,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    if (!currentEvent) return;
    await navigator.clipboard.writeText(currentEvent.codigo);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 group-hover:scale-105 transition">
              <Beer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-800 tracking-tight">Cotorrea Pachi</span>
                {currentEvent && (
                  <button
                    onClick={handleCopyCode}
                    title="Copiar código de salida"
                    className="flex items-center gap-1 text-[11px] font-bold bg-teal-50 border border-teal-200 text-teal-800 px-2 py-0.5 rounded-full hover:bg-teal-100 transition"
                  >
                    <span>{currentEvent.codigo}</span>
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-2.5 h-2.5 opacity-60" />}
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Planeador de quedadas y salidas con amigos</p>
            </div>
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud DB Status badge */}
          {onOpenDbModal && (
            <button
              onClick={onOpenDbModal}
              title={dbStatus?.isConfigured ? 'Base de datos en la nube activa' : 'Configurar base de datos gratuita en la nube'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
                dbStatus?.isConfigured
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  dbStatus?.isConfigured ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              />
              <Database className="w-3.5 h-3.5" />
              <span>{dbStatus?.isConfigured ? 'Supabase' : 'BD Nube'}</span>
            </button>
          )}

          {/* Botón Crear Salida siempre visible */}
          <button
            onClick={onOpenCreateEvent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-600 bg-teal-50 text-teal-900 hover:bg-teal-100 text-xs sm:text-sm font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-teal-700" />
            <span>Crear Salida</span>
          </button>

          {/* Invitar por WhatsApp si hay evento activo */}
          {currentEvent && (
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-semibold transition shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">Invitar Amigos</span>
            </button>
          )}

          {/* Usuario / Registro */}
          {currentParticipant ? (
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 transition"
            >
              <img
                src={currentParticipant.avatar}
                alt={currentParticipant.nombre}
                className="w-7 h-7 rounded-full object-cover border border-white"
              />
              <span className="text-xs font-semibold text-teal-900 max-w-[100px] truncate">
                {currentParticipant.nombre}
              </span>
              <span className="text-[10px] text-teal-600 font-normal underline">Editar</span>
            </button>
          ) : currentEvent ? (
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-medium transition shadow-sm shadow-teal-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Unirme a salida</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
