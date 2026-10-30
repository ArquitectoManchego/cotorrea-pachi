import { NextResponse } from 'next/server';
import { getActiveDbProvider } from '@/lib/cloudDb';

export async function GET() {
  const status = getActiveDbProvider();
  return NextResponse.json(status);
}
