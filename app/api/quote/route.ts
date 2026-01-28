import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

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

// Initialize Redis and Rate Limiter
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '24 h'), // 5 requests per 24 hours
  analytics: true,
});

// Get client IP address
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Check rate limit
    const { success, limit, remaining, reset } = await ratelimit.limit(
      `quote_${clientIp}`
    );

    // Prepare rate limit headers
    const rateLimitHeaders = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    };

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Maximum 5 quotes per 24 hours allowed.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      );
    }

    const body = (await request.json()) as QuoteRequest;

    const { address, stories, addOns, lat, lng } = body;

    // Validate required fields
    if (!address || !stories || !lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
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

    return NextResponse.json(
      { minPrice, maxPrice },
      {
        status: 200,
        headers: rateLimitHeaders,
      }
    );
  } catch (error) {
    console.error('Quote API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    );
  }
}
