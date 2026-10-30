import { NextRequest, NextResponse } from 'next/server';
import { saveParticipant } from '@/lib/dataStore';
import { Participant } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: Participant = await req.json();
    if (!body.nombre || !body.apellido) {
      return NextResponse.json({ error: 'Nombre y apellido son obligatorios' }, { status: 400 });
    }
    const updated = saveParticipant(body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 500 });
  }
}
