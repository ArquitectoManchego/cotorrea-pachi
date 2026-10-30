'use client';

import React, { useState } from 'react';
import { Participant } from '@/types';
import { Beer, Share2, UserPlus, Check, RotateCcw, Database } from 'lucide-react';

interface NavbarProps {
  currentParticipant: Participant | null;
  onOpenRegister: () => void;
  onResetDemo: () => void;
  totalParticipants: number;
  dbStatus?: {
    provider: string;
    isConfigured: boolean;
    name: string;
  };
  onOpenDbModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentParticipant,
  onOpenRegister,
  onResetDemo,
  totalParticipants,
  dbStatus,
  onOpenDbModal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cotorrea Pachi - Quedada con Amigos',
          text: '¡Entra y selecciona qué días y horarios puedes, y propón dónde vernos!',
          url: url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
            <Beer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-800 tracking-tight">Cotorrea Pachi</span>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {totalParticipants} amigos listos
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Planeador de quedadas y salidas con amigos</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud DB Status indicator button */}
          {onOpenDbModal && (
            <button
              onClick={onOpenDbModal}
              title={dbStatus?.isConfigured ? 'Base de datos en la nube activa' : 'Configurar base de datos gratuita en la nube'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
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
              <span className="hidden md:inline">
                {dbStatus?.isConfigured ? 'Nube Conectada' : 'BD en Nube'}
              </span>
            </button>
          )}

          <button
            onClick={onResetDemo}
            title="Reiniciar con datos de prueba"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium transition shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">¡Enlace Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Invitar amigos</span>
              </>
            )}
          </button>

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
          ) : (
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-medium transition shadow-sm shadow-teal-600/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Unirme</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
