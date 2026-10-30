import { NextRequest, NextResponse } from 'next/server';
import { saveParticipant } from '@/lib/dataStore';
import { Participant } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { eventId, participant } = await req.json();

    if (!eventId || !participant || !participant.nombre || !participant.apellido) {
      return NextResponse.json(
        { error: 'eventId, nombre y apellido son obligatorios' },
        { status: 400 }
      );
    }

    const updated = await saveParticipant(eventId, participant as Participant);
    if (!updated) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error saving participant:', error);
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 500 });
  }
}
