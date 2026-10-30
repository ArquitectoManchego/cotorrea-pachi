import { NextRequest, NextResponse } from 'next/server';
import { toggleVotePlace } from '@/lib/dataStore';

export async function POST(req: NextRequest) {
  try {
    const { placeId, participantId } = await req.json();
    if (!placeId || !participantId) {
      return NextResponse.json({ error: 'placeId y participantId son obligatorios' }, { status: 400 });
    }
    const updated = toggleVotePlace(placeId, participantId);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando voto' }, { status: 500 });
  }
}
