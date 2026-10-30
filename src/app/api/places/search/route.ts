import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) {
    return NextResponse.json([]);
  }

  try {
    const cleanQuery = q.trim();
    // Fetch from OpenStreetMap Nominatim with proper User-Agent
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        cleanQuery
      )}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CotorreaPachi/1.0 (https://cotorrea-pachi.vercel.app; info@cotorreapachi.app)',
          'Accept-Language': 'es,en;q=0.9',
        },
      }
    );

    if (!res.ok) {
      console.warn(`Geocoding response status: ${res.status}`);
      return NextResponse.json([]);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      return NextResponse.json([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = data.map((item: any) => {
      const parts = (item.display_name || '').split(',');
      const shortName = parts[0]?.trim() || cleanQuery;
      const address = parts.slice(1, 4).join(',').trim() || item.display_name;

      return {
        name: shortName,
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: address,
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in /api/places/search:', error);
    return NextResponse.json([]);
  }
}
