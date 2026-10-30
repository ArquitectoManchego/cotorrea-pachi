import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { EventData } from '@/types';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const upstashUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize clients conditionally
const supabase = supabaseUrl && supabaseKey ? createSupabaseClient(supabaseUrl, supabaseKey) : null;
const redis = upstashUrl && upstashToken ? new Redis({ url: upstashUrl, token: upstashToken }) : null;

export type CloudDbProvider = 'supabase' | 'upstash' | 'memory';

export function getActiveDbProvider(): {
  provider: CloudDbProvider;
  isConfigured: boolean;
  name: string;
} {
  if (supabase) {
    return {
      provider: 'supabase',
      isConfigured: true,
      name: 'Supabase (PostgreSQL Gratuito)',
    };
  }
  if (redis) {
    return {
      provider: 'upstash',
      isConfigured: true,
      name: 'Upstash Redis / Vercel KV (Gratuito)',
    };
  }
  return {
    provider: 'memory',
    isConfigured: false,
    name: 'Memoria Servidor (Configura Supabase o Upstash)',
  };
}

export async function fetchEventFromCloud(eventId: string): Promise<EventData | null> {
  // 1. Try Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('cotorrea_events')
        .select('data')
        .eq('id', eventId)
        .single();

      if (!error && data && data.data) {
        return data.data as EventData;
      }
    } catch (err) {
      console.error('Error leyendo evento de Supabase:', err);
    }
  }

  // 2. Try Upstash / Vercel KV
  if (redis) {
    try {
      const cached = await redis.get<EventData>(`cotorrea_event_${eventId}`);
      if (cached) {
        return cached;
      }
    } catch (err) {
      console.error('Error leyendo evento de Upstash Redis:', err);
    }
  }

  return null;
}

export async function saveEventToCloud(eventData: EventData): Promise<boolean> {
  let saved = false;

  // 1. Try Supabase
  if (supabase) {
    try {
      const { error } = await supabase.from('cotorrea_events').upsert(
        {
          id: eventData.id,
          data: eventData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (!error) {
        saved = true;
      } else {
        console.error('Error en Supabase upsert:', error);
      }
    } catch (err) {
      console.error('Error guardando en Supabase:', err);
    }
  }

  // 2. Try Upstash / Vercel KV
  if (redis) {
    try {
      await redis.set(`cotorrea_event_${eventData.id}`, eventData);
      saved = true;
    } catch (err) {
      console.error('Error guardando en Upstash Redis:', err);
    }
  }

  return saved;
}
