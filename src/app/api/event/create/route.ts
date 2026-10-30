import { NextRequest, NextResponse } from 'next/server';
import { createNewEvent, CreateEventParams } from '@/lib/dataStore';

export async function POST(req: NextRequest) {
  try {
    const body: CreateEventParams = await req.json();

    if (!body.titulo || !body.organizadorNombre || !body.organizadorApellido) {
      return NextResponse.json(
        { error: 'Título y datos del organizador son obligatorios' },
        { status: 400 }
      );
    }

    const event = await createNewEvent(body);
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error creando evento:', error);
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 500 });
  }
}
