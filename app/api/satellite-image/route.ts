import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing lat/lng parameters' },
        { status: 400 }
      );
    }

    const mapsUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=20&size=600x400&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;

    const response = await fetch(mapsUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch satellite image' },
        { status: response.status }
      );
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Satellite image API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch satellite image' },
      { status: 500 }
    );
  }
}
