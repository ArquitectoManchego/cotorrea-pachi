export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export type TimeMode = 'any' | 'range' | 'after';

export interface TimeAvailability {
  mode: TimeMode;
  fromTime?: string; // e.g. "18:00"
  toTime?: string;   // e.g. "23:00"
  afterTime?: string; // e.g. "19:30"
}

export interface Participant {
  id: string;
  nombre: string;
  apellido: string;
  avatar: string;
  diasDisponibles: DayOfWeek[];
  horario: TimeAvailability;
  comentario?: string;
  registeredAt: string;
}

export type PlaceCategory = 'restaurante' | 'bar' | 'cafe' | 'parque' | 'casa' | 'terraza' | 'entretenimiento' | 'otro';

export interface PlaceOption {
  id: string;
  nombre: string;
  categoria: PlaceCategory;
  descripcion?: string;
  tieneUbicacionMapa: boolean;
  latitud?: number;
  longitud?: number;
  direccionAprox?: string;
  propuestoPorId: string;
  propuestoPorNombre: string;
  propuestoPorAvatar: string;
  votos: string[]; // array of participant IDs who voted
  createdAt: string;
}

export interface EventData {
  id: string; // unique code e.g. "PACHI-8392"
  codigo: string;
  titulo: string;
  descripcion?: string;
  organizadorNombre: string;
  organizadorId: string;
  participantes: Participant[];
  lugaresPropuestos: PlaceOption[];
  createdAt: string;
}

// Center of Boulevard Manuel Ávila Camacho, Veracruz / Boca del Río
export const VERACRUZ_DEFAULT_COORDS = {
  lat: 19.1620,
  lng: -96.1100,
  zoom: 14,
  name: 'Boulevard Manuel Ávila Camacho, Veracruz / Boca del Río',
};
