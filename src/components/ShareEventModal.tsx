'use client';

import React, { useState } from 'react';
import { EventData } from '@/types';
import { X, Copy, Check, MessageCircle, Share2, Sparkles, ExternalLink } from 'lucide-react';

interface ShareEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
}

export const ShareEventModal: React.FC<ShareEventModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://cotorrea-pachi.vercel.app';
  const shareUrl = `${currentOrigin}/?e=${event.codigo}`;

  const whatsappMessage = `🍻 *¡Qué onda! Te invito a armar la salida: ${event.titulo}* 🍻\n\n` +
    `Entra al link para poner qué días y horarios puedes, y proponer lugares en el mapa:\n` +
    `👉 ${shareUrl}\n\n` +
    `🔑 *Código de la salida:* ${event.codigo}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(event.codigo);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg">
              🍻
            </div>
            <div>
              <h2 className="text-lg font-bold">¡Salida Lista para Invitar!</h2>
              <p className="text-xs text-emerald-100">Comparte el código o el link con tus amigos</p>
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Big Code Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Código Único de Salida
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-black tracking-widest text-teal-800">
                {event.codigo}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copiar código"
                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-200 rounded-lg transition"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">Tus amigos pueden entrar escribiendo este código</p>
          </div>

          {/* Direct Link Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Enlace directo:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-600 select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shrink-0 transition"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary Action: WhatsApp Button */}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition transform active:scale-98"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Enviar Invitación por WhatsApp</span>
            </a>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium underline"
            >
              Cerrar y ver la salida
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
