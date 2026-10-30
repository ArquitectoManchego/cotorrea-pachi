import { NextResponse } from 'next/server';
import { getEventData } from '@/lib/dataStore';

export async function GET() {
  const data = await getEventData();
  return NextResponse.json(data);
}
