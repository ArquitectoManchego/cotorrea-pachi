import { NextResponse } from 'next/server';
import { resetToDemo } from '@/lib/dataStore';

export async function POST() {
  const updated = await resetToDemo();
  return NextResponse.json(updated);
}
