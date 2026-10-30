import { NextRequest, NextResponse } from 'next/server';
import { getEventData } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('id');

  if (!eventId) {
    return NextResponse.json({ error: 'Falta el ID del evento' }, { status: 400 });
  }

  const data = await getEventData(eventId);
  if (!data) {
    return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
  }

  return NextResponse.json(data);
}
