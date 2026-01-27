import { NextRequest, NextResponse } from 'next/server';

interface QuoteRequest {
  address: string;
  stories: number;
  addOns: {
    driveway: boolean;
    gutters: boolean;
    deckPatio: boolean;
  };
  lat: number;
  lng: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as QuoteRequest;

    const { address, stories, addOns, lat, lng } = body;

    // Validate required fields
    if (!address || !stories || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Base pricing by story count
    let basePrice = 0;
    if (stories === 1) {
      basePrice = 350;
    } else if (stories === 2) {
      basePrice = 450;
    } else {
      basePrice = 600;
    }

    // Add-on pricing
    let addOnsCost = 0;
    if (addOns.driveway) addOnsCost += 250;
    if (addOns.gutters) addOnsCost += 150;
    if (addOns.deckPatio) addOnsCost += 200;

    // Location-based adjustment (example: higher price for areas far from base)
    // Langley, BC approximate center: 49.05, -122.75
    const langleyLat = 49.05;
    const langleyLng = -122.75;
    const distanceDelta =
      Math.abs(lat - langleyLat) + Math.abs(lng - langleyLng);
    const locationMultiplier = 1 + distanceDelta * 0.05; // 5% increase per degree

    const subtotal = (basePrice + addOnsCost) * locationMultiplier;

    // Calculate min and max with margin
    const minPrice = Math.round(subtotal);
    const maxPrice = Math.round(subtotal * 1.15); // 15% margin

    return NextResponse.json({ minPrice, maxPrice }, { status: 200 });
  } catch (error) {
    console.error('Quote API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    );
  }
}
