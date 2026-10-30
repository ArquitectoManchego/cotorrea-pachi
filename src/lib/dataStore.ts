import { EventData, Participant, PlaceOption } from '@/types';
import { fetchEventFromCloud, saveEventToCloud } from './cloudDb';

const INITIAL_EVENT: EventData = {
  id: 'cotorreo-amigos',
  titulo: '🍻 Quedada de Fin de Semana con la Banda',
  descripcion: '¡Vamos a ponernos de acuerdo para vernos! Selecciona qué días puedes, tus horarios y propón lugares en el mapa o por nombre.',
  organizador: 'Alex Manchego',
  createdAt: new Date().toISOString(),
  participantes: [
    {
      id: 'part-1',
      nombre: 'Alex',
      apellido: 'Manchego',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      diasDisponibles: ['Viernes', 'Sábado'],
      horario: {
        mode: 'after',
        afterTime: '19:00',
      },
      comentario: '¡Salgo de trabajar a las 6:30! Yo pongo el carro si vamos lejos 🚗',
      registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'part-2',
      nombre: 'Sofía',
      apellido: 'Ramos',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      diasDisponibles: ['Viernes', 'Sábado', 'Domingo'],
      horario: {
        mode: 'range',
        fromTime: '17:00',
        toTime: '23:30',
      },
      comentario: 'Cualquier lugar con buena comida me late. ¡Prefiero terraza!',
      registeredAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'part-3',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      diasDisponibles: ['Jueves', 'Viernes', 'Sábado'],
      horario: {
        mode: 'any',
      },
      comentario: '¡Tengo libre todo el fin! Donde ustedes digan pachi.',
      registeredAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'part-4',
      nombre: 'Mariana',
      apellido: 'Ortiz',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      diasDisponibles: ['Sábado', 'Domingo'],
      horario: {
        mode: 'after',
        afterTime: '18:30',
      },
      comentario: 'El sábado tengo curso hasta las 6, después me lanzo directo.',
      registeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
  lugaresPropuestos: [
    {
      id: 'place-1',
      nombre: 'Cervecería & Terraza El Campanario',
      categoria: 'bar',
      descripcion: 'Cerveza artesanal, pizzas al horno de leña y música en vivo al aire libre.',
      tieneUbicacionMapa: true,
      latitud: 19.4326,
      longitud: -99.1332,
      direccionAprox: 'Centro Histórico, CDMX',
      propuestoPorId: 'part-1',
      propuestoPorNombre: 'Alex Manchego',
      propuestoPorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      votos: ['part-1', 'part-2', 'part-3'],
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'place-2',
      nombre: 'Taquería & Mezcal Los Farolitos',
      categoria: 'restaurante',
      descripcion: 'Tacos de arrachera, volcanes y muy buen ambiente para platicar a gusto.',
      tieneUbicacionMapa: true,
      latitud: 19.4195,
      longitud: -99.1610,
      direccionAprox: 'Colonia Roma Norte',
      propuestoPorId: 'part-2',
      propuestoPorNombre: 'Sofía Ramos',
      propuestoPorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      votos: ['part-2', 'part-4'],
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'place-3',
      nombre: 'Terraza en casa de Carlos (Asador & Botana)',
      categoria: 'casa',
      descripcion: 'Hacemos carne asada tranquila, cada quien lleva lo que toma y ponemos música chida.',
      tieneUbicacionMapa: false,
      direccionAprox: 'Casa de Carlos (sin marcar coordenadas)',
      propuestoPorId: 'part-3',
      propuestoPorNombre: 'Carlos Mendoza',
      propuestoPorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      votos: ['part-1', 'part-3'],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'place-4',
      nombre: 'Bowling & Arcade Gamezone',
      categoria: 'entretenimiento',
      descripcion: 'Líneas de boliche, billar, alitas y cerveza de barril.',
      tieneUbicacionMapa: true,
      latitud: 19.3980,
      longitud: -99.1725,
      direccionAprox: 'Av. Insurgentes Sur',
      propuestoPorId: 'part-4',
      propuestoPorNombre: 'Mariana Ortiz',
      propuestoPorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      votos: ['part-4'],
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ],
};

let globalEventData: EventData = JSON.parse(JSON.stringify(INITIAL_EVENT));
let hasLoadedFromCloud = false;

export async function getEventData(): Promise<EventData> {
  const cloudEvent = await fetchEventFromCloud('cotorreo-amigos');
  if (cloudEvent) {
    globalEventData = cloudEvent;
    hasLoadedFromCloud = true;
    return globalEventData;
  }

  // If this is the first run on an empty cloud database, seed with initial demo
  if (!hasLoadedFromCloud) {
    await saveEventToCloud(globalEventData);
    hasLoadedFromCloud = true;
  }

  return globalEventData;
}

export async function saveParticipant(participant: Participant): Promise<EventData> {
  // Sync latest from cloud first
  const cloudEvent = await fetchEventFromCloud('cotorreo-amigos');
  if (cloudEvent) {
    globalEventData = cloudEvent;
  }

  const existingIdx = globalEventData.participantes.findIndex((p) => p.id === participant.id);
  if (existingIdx >= 0) {
    globalEventData.participantes[existingIdx] = participant;
  } else {
    globalEventData.participantes.push(participant);
  }

  // Persist to cloud database
  await saveEventToCloud(globalEventData);
  return globalEventData;
}

export async function addPlaceOption(place: PlaceOption): Promise<EventData> {
  const cloudEvent = await fetchEventFromCloud('cotorreo-amigos');
  if (cloudEvent) {
    globalEventData = cloudEvent;
  }

  globalEventData.lugaresPropuestos.unshift(place);

  // Persist to cloud database
  await saveEventToCloud(globalEventData);
  return globalEventData;
}

export async function toggleVotePlace(placeId: string, participantId: string): Promise<EventData> {
  const cloudEvent = await fetchEventFromCloud('cotorreo-amigos');
  if (cloudEvent) {
    globalEventData = cloudEvent;
  }

  const place = globalEventData.lugaresPropuestos.find((p) => p.id === placeId);
  if (place) {
    const hasVoted = place.votos.includes(participantId);
    if (hasVoted) {
      place.votos = place.votos.filter((id) => id !== participantId);
    } else {
      place.votos.push(participantId);
    }
  }

  // Persist to cloud database
  await saveEventToCloud(globalEventData);
  return globalEventData;
}

export async function resetToDemo(): Promise<EventData> {
  globalEventData = JSON.parse(JSON.stringify(INITIAL_EVENT));
  await saveEventToCloud(globalEventData);
  return globalEventData;
}
