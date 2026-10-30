-- ========================================================
-- COTORREA PACHI - SCRIPT SQL PARA SUPABASE (100% GRATUITO)
-- ========================================================
-- 1. Ve a https://supabase.com y crea una cuenta gratuita.
-- 2. Crea un nuevo proyecto (ej. "cotorrea-pachi-db").
-- 3. Ve al menú lateral "SQL Editor" y pega este script:

CREATE TABLE IF NOT EXISTS cotorrea_events (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) con acceso público para la web app
ALTER TABLE cotorrea_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura y escritura publica" 
ON cotorrea_events 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ========================================================
-- ¡Listo! Ahora solo copia de Supabase (Settings -> API):
-- NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
--
-- Y agrégalas en Vercel (Project Settings -> Environment Variables)
-- ========================================================
