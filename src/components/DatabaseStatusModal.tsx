'use client';

import React, { useState } from 'react';
import { Database, X, Check, Copy, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus: {
    provider: string;
    isConfigured: boolean;
    name: string;
  };
}

const SUPABASE_SQL = `CREATE TABLE IF NOT EXISTS cotorrea_events (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE cotorrea_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura y escritura publica" 
ON cotorrea_events 
FOR ALL 
USING (true) 
WITH CHECK (true);`;

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  dbStatus,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = async () => {
    await navigator.clipboard.writeText(SUPABASE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/90 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 to-teal-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Base de Datos en la Nube</h2>
              <p className="text-xs text-slate-500">Persistencia global para todos los amigos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-600">
          {/* Current Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              dbStatus.isConfigured
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full animate-ping ${
                  dbStatus.isConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <div>
                <p className="font-bold text-sm">
                  {dbStatus.isConfigured
                    ? '¡Conectada a la Nube!'
                    : 'Modo Local / Servidor Activo'}
                </p>
                <p className="text-[11px] opacity-90">{dbStatus.name}</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                dbStatus.isConfigured
                  ? 'bg-emerald-200 text-emerald-900'
                  : 'bg-amber-200 text-amber-900'
              }`}
            >
              {dbStatus.isConfigured ? 'Activo' : 'Pendiente'}
            </span>
          </div>

          {/* Guide to connect free Supabase */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span>¿Cómo conectar Supabase Gratis en 2 minutos?</span>
              </h3>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
              >
                <span>Ir a Supabase</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="space-y-2 list-decimal list-inside text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <li>
                Crea una cuenta gratuita en{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-slate-800"
                >
                  supabase.com
                </a>{' '}
                (no requiere tarjeta de crédito).
              </li>
              <li>Crea un proyecto (ej. <em>cotorrea-pachi</em>).</li>
              <li>
                Ve al menú <strong>SQL Editor</strong> y ejecuta este script para crear la tabla:
              </li>
            </ol>

            {/* SQL Snippet box */}
            <div className="relative bg-slate-900 text-slate-100 p-3 rounded-2xl font-mono text-[11px] overflow-x-auto">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-700">
                <span className="text-slate-400 text-[10px]">supabase_schema.sql</span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar SQL</span>
                    </>
                  )}
                </button>
              </div>
              <pre>{SUPABASE_SQL}</pre>
            </div>

            <ol start={4} className="space-y-2 list-decimal list-inside text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <li>
                Ve a <strong>Settings → Data API</strong> en Supabase y copia:
                <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 font-mono text-[10px] text-teal-800">
                  <li>NEXT_PUBLIC_SUPABASE_URL</li>
                  <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                </ul>
              </li>
              <li>
                Pégalas en <strong>Vercel (Settings → Environment Variables)</strong> o en tu archivo <code>.env.local</code>. ¡Y la app persistirá al instante en la nube para siempre!
              </li>
            </ol>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
