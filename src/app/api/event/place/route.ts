import { NextRequest, NextResponse } from 'next/server';
import { addPlaceOption } from '@/lib/dataStore';
import { PlaceOption } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { eventId, place } = await req.json();

    if (!eventId || !place || !place.nombre) {
      return NextResponse.json(
        { error: 'eventId y nombre del lugar son obligatorios' },
        { status: 400 }
      );
    }

    const updated = await addPlaceOption(eventId, place as PlaceOption);
    if (!updated) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error adding place:', error);
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 500 });
  }
}
