import { EventData, Participant, PlaceOption, DayOfWeek, TimeAvailability } from '@/types';
import { fetchEventFromCloud, saveEventToCloud } from './cloudDb';

// Local in-memory cache for fast server responses
const memoryEvents = new Map<string, EventData>();

function generateEventCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PACHI-${code}`;
}

export async function getEventData(eventId?: string): Promise<EventData | null> {
  if (!eventId) return null;

  const normalizedId = eventId.trim().toUpperCase();

  // Check cloud first
  const cloudEvent = await fetchEventFromCloud(normalizedId);
  if (cloudEvent) {
    memoryEvents.set(normalizedId, cloudEvent);
    return cloudEvent;
  }

  // Fallback to memory
  if (memoryEvents.has(normalizedId)) {
    return memoryEvents.get(normalizedId) || null;
  }

  return null;
}

export interface CreateEventParams {
  titulo: string;
  descripcion?: string;
  organizadorNombre: string;
  organizadorApellido: string;
  avatar: string;
  diasDisponibles: DayOfWeek[];
  horario: TimeAvailability;
  comentario?: string;
}

export async function createNewEvent(params: CreateEventParams): Promise<EventData> {
  const codigo = generateEventCode();
  const organizerId = `part-${Date.now()}`;

  const organizerParticipant: Participant = {
    id: organizerId,
    nombre: params.organizadorNombre.trim(),
    apellido: params.organizadorApellido.trim(),
    avatar: params.avatar,
    diasDisponibles: params.diasDisponibles,
    horario: params.horario,
    comentario: params.comentario?.trim() || undefined,
    registeredAt: new Date().toISOString(),
  };

  const newEvent: EventData = {
    id: codigo,
    codigo: codigo,
    titulo: params.titulo.trim(),
    descripcion: params.descripcion?.trim() || undefined,
    organizadorNombre: `${params.organizadorNombre.trim()} ${params.organizadorApellido.trim()}`,
    organizadorId: organizerId,
    participantes: [organizerParticipant],
    lugaresPropuestos: [], // ZERO sample places! Real data only
    createdAt: new Date().toISOString(),
  };

  memoryEvents.set(codigo, newEvent);
  await saveEventToCloud(newEvent);

  return newEvent;
}

export async function saveParticipant(eventId: string, participant: Participant): Promise<EventData | null> {
  const event = await getEventData(eventId);
  if (!event) return null;

  const existingIdx = event.participantes.findIndex((p) => p.id === participant.id);
  if (existingIdx >= 0) {
    event.participantes[existingIdx] = participant;
  } else {
    event.participantes.push(participant);
  }

  memoryEvents.set(event.id, event);
  await saveEventToCloud(event);
  return event;
}

export async function addPlaceOption(eventId: string, place: PlaceOption): Promise<EventData | null> {
  const event = await getEventData(eventId);
  if (!event) return null;

  // Prevent duplicate by name or id
  const existing = event.lugaresPropuestos.find(
    (p) => p.id === place.id || p.nombre.toLowerCase() === place.nombre.toLowerCase()
  );
  if (!existing) {
    event.lugaresPropuestos.unshift(place);
  }

  memoryEvents.set(event.id, event);
  await saveEventToCloud(event);
  return event;
}

export async function toggleVotePlace(
  eventId: string,
  placeId: string,
  participantId: string
): Promise<EventData | null> {
  const event = await getEventData(eventId);
  if (!event) return null;

  const place = event.lugaresPropuestos.find((p) => p.id === placeId);
  if (place) {
    const hasVoted = place.votos.includes(participantId);
    if (hasVoted) {
      place.votos = place.votos.filter((id) => id !== participantId);
    } else {
      place.votos.push(participantId);
    }
  }

  memoryEvents.set(event.id, event);
  await saveEventToCloud(event);
  return event;
}
