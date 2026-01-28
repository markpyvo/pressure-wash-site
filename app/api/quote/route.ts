import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

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

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send emails asynchronously (don't wait for them)
    sendEmails(address, body.email, minPrice, maxPrice, stories, body.addOns).catch(
      (error) => console.error('Email sending failed:', error)
    );

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

// Helper function to send emails
async function sendEmails(
  address: string,
  customerEmail: string,
  minPrice: number,
  maxPrice: number,
  stories: number,
  addOns: { driveway: boolean; gutters: boolean; deckPatio: boolean }
) {
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!ownerEmail) {
    console.warn('OWNER_EMAIL not set, skipping owner notification');
    return;
  }

  // Build add-ons list
  const selectedAddOns = [];
  if (addOns.driveway) selectedAddOns.push('Driveway Cleaning');
  if (addOns.gutters) selectedAddOns.push('Gutter Cleaning');
  if (addOns.deckPatio) selectedAddOns.push('Deck/Patio Cleaning');
  const addOnsText =
    selectedAddOns.length > 0 ? selectedAddOns.join(', ') : 'None';

  // Email 1: To Business Owner
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ownerEmail,
    subject: `New Lead: ${address} - $${minPrice.toLocaleString()}-$${maxPrice.toLocaleString()}`,
    text: `New Quote Request\n\nAddress: ${address}\nStories: ${stories}\nAdd-ons: ${addOnsText}\nPrice Range: $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}\nCustomer Email: ${customerEmail}`,
  });

  // Email 2: To Customer
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2d3a6b;">We've Received Your Quote Request</h2>
      <p>Hi there,</p>
      <p>Thank you for requesting a quote for your pressure washing service at:</p>
      <p style="font-weight: bold; color: #2d3a6b;">${address}</p>
      
      <h3 style="color: #2d3a6b; margin-top: 30px;">Quote Details</h3>
      <ul style="line-height: 1.8;">
        <li><strong>Estimated Price Range:</strong> $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}</li>
        <li><strong>Stories:</strong> ${stories}</li>
        <li><strong>Add-ons:</strong> ${addOnsText}</li>
      </ul>

      <p style="margin-top: 30px;">We'll review your request and get back to you shortly with more details. Feel free to reach out if you have any questions!</p>
      
      <p>Best regards,<br><strong>Water Boys Pressure Washing</strong></p>
      <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
        This is an automated message. Please don't reply to this email.
      </p>
    </div>
  `;

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: customerEmail,
    subject: `Your Pressure Washing Quote for ${address}`,
    html: htmlTemplate,
  });
}
