import { NextRequest, NextResponse } from 'next/server';
import { toggleVotePlace } from '@/lib/dataStore';

export async function POST(req: NextRequest) {
  try {
    const { eventId, placeId, participantId } = await req.json();

    if (!eventId || !placeId || !participantId) {
      return NextResponse.json(
        { error: 'eventId, placeId y participantId son obligatorios' },
        { status: 400 }
      );
    }

    const updated = await toggleVotePlace(eventId, placeId, participantId);
    if (!updated) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json({ error: 'Error procesando voto' }, { status: 500 });
  }
}
