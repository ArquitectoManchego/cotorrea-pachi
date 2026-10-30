import { NextResponse } from 'next/server';
import { getEventData } from '@/lib/dataStore';

export async function GET() {
  return NextResponse.json(getEventData());
}
