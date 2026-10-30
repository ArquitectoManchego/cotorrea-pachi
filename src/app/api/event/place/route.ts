import { NextRequest, NextResponse } from 'next/server';
import { addPlaceOption } from '@/lib/dataStore';
import { PlaceOption } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: PlaceOption = await req.json();
    if (!body.nombre) {
      return NextResponse.json({ error: 'El nombre del lugar es obligatorio' }, { status: 400 });
    }
    const updated = addPlaceOption(body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 500 });
  }
}
