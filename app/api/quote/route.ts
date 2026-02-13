/**
 * ============================================================================
 * QUOTE GENERATION API ENDPOINT
 * ============================================================================
 *
 * PURPOSE:
 * Receives quote requests and returns pricing quotes with routing validation
 * and material-based risk adjustment.
 *
 * FLOW:
 * 1. Rate Limiting → Prevent quote request abuse (5 per customer per 24h)
 * 2. Input Validation → Reject malformed requests early
 * 3. Geospatial Routing → Call Distance Matrix, validate service area
 * 4. Risk Pricing → Apply material multiplier to base rate
 * 5. Response → Return itemized breakdown with routing details
 * 6. Notifications → Async email to admin + customer
 *
 * SECURITY:
 * • Rate limiting protects backend from flood attacks
 * • HTML escaping prevents XSS in email templates
 * • Email validation prevents invalid address abuse
 * • API returns 400/503 on validation failures (not 500)
 *
 * ============================================================================
 */
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import {
  calculateRouting,
  calculateQuoteWithMaterial,
  RoutingError,
} from '@/app/lib/pricing';

interface QuoteRequest {
  address: string;
  stories: number;
  squareFeet: number;
  material?: string; // New: material type for risk-based pricing
  addOns: {
    driveway: boolean;
    gutters: boolean;
    deckPatio: boolean;
  };
  lat: number;
  lng: number;
  email: string;
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

// UTILITY: Extract client IP for rate limiting (respects proxy headers)
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

// VALIDATION: RFC 5321 email format check
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// SECURITY: HTML entity encoding prevents XSS in email templates
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export async function POST(request: NextRequest) {
  try {
    // RATE LIMITING: Prevent abuse—max 5 requests per customer per 24 hours
    const clientIp = getClientIp(request);
    const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1';

    let rateLimitHeaders = {
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '5',
      'X-RateLimit-Reset': Date.now().toString(),
    };

    if (!isLocalhost) {
      const { success, limit, remaining, reset } = await ratelimit.limit(
        `quote_${clientIp}`
      );

      rateLimitHeaders = {
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
    }

    const body = (await request.json()) as QuoteRequest;
    const { address, stories, squareFeet, material = 'vinyl', addOns, lat, lng, email } = body;

    // INPUT VALIDATION: Reject incomplete requests immediately
    if (!address || !stories || !lat || !lng || !email || squareFeet === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    // BUSINESS RULE: Estate properties (4500+ sq ft) require manual quoting
    // Rationale: Complexity and custom requirements prevent accurate automation
    if (squareFeet >= 4500) {
      sendEstateNotification(address, email, stories, squareFeet, addOns).catch(
        (error) => console.error('Estate notification failed:', error)
      );

      return NextResponse.json(
        { estate: true, message: 'Estate Service Required' },
        { status: 200, headers: rateLimitHeaders }
      );
    }

    // EMAIL VALIDATION: Prevent invalid address abuse
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    // GEOSPATIAL ROUTING: Validate service area and calculate travel surcharge
    const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!googleMapsKey) {
      console.error('Google Maps API key not configured');
      return NextResponse.json(
        { error: 'Routing service unavailable. Please try again later.' },
        { status: 503, headers: rateLimitHeaders }
      );
    }

    const routingResult = await calculateRouting(address, googleMapsKey);

    // GUARDRAIL: Reject jobs outside profitable service area
    if (!routingResult.isValid) {
      if (routingResult.error === RoutingError.OUT_OF_SERVICE_AREA) {
        return NextResponse.json(
          {
            error: 'Outside service area',
            message: `Your location is ${Math.round(routingResult.distance)}km away. We currently serve within 45km of Langley, BC.`,
            distance: Math.round(routingResult.distance),
          },
          { status: 400, headers: rateLimitHeaders }
        );
      } else if (routingResult.error === RoutingError.INVALID_ADDRESS) {
        return NextResponse.json(
          { error: 'Invalid address. Please verify your location.' },
          { status: 400, headers: rateLimitHeaders }
        );
      }
    }

    // RISK-ADJUSTED PRICING: Apply material multiplier to base rate
    const quoteBreakdown = calculateQuoteWithMaterial(
      stories,
      material,
      routingResult.travelSurcharge
    );

    const { minPrice, maxPrice, breakdown } = quoteBreakdown;

    // ASYNC NOTIFICATIONS: Send itemized emails (non-blocking)
    sendEmails(
      address,
      email,
      minPrice,
      maxPrice,
      stories,
      addOns,
      material,
      breakdown,
      routingResult.distance
    ).catch((error) => console.error('Email sending failed:', error));

    return NextResponse.json(
      {
        minPrice,
        maxPrice,
        breakdown,
        routing: {
          distance: Math.round(routingResult.distance),
          duration: routingResult.duration,
          travelSurcharge: routingResult.travelSurcharge,
        },
      },
      { status: 200, headers: rateLimitHeaders }
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
  addOns: { driveway: boolean; gutters: boolean; deckPatio: boolean },
  material: string,
  breakdown: { basePrice: number; materialSurcharge: number; travelSurcharge: number },
  distance: number
) {
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!ownerEmail) {
    console.warn('OWNER_EMAIL not set, skipping notifications');
    return;
  }

  // Build add-ons list
  const selectedAddOns = [];
  if (addOns.driveway) selectedAddOns.push('Driveway Cleaning');
  if (addOns.gutters) selectedAddOns.push('Gutter Cleaning');
  if (addOns.deckPatio) selectedAddOns.push('Deck/Patio Cleaning');
  const addOnsText =
    selectedAddOns.length > 0 ? selectedAddOns.join(', ') : 'None';

  // SECURITY: HTML entity encoding prevents XSS attacks in email templates
  const sanitizedAddress = escapeHtml(address);

  // ADMIN NOTIFICATION: Itemized breakdown enables informed business decisions
  // Includes distance metrics to track profitability patterns and routing efficiency
  const adminEmailPromise = resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ownerEmail,
    subject: `New Lead: ${sanitizedAddress} - $${minPrice.toLocaleString()}-$${maxPrice.toLocaleString()} (${Math.round(distance)}km)`,
    text: `New Quote Request\n\nAddress: ${address}\nDistance: ${Math.round(distance)}km\nStories: ${stories}\nMaterial: ${material}\nAdd-ons: ${addOnsText}\n\nPrice Breakdown:\n- Base Price: $${breakdown.basePrice}\n- Material Surcharge: $${breakdown.materialSurcharge.toFixed(2)}\n- Travel Surcharge: $${breakdown.travelSurcharge.toFixed(2)}\n\nEstimated Range: $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}\nCustomer Email: ${customerEmail}`,
  }).catch((error) => {
    console.error('Failed to send admin email:', error);
  });

  // CUSTOMER TRANSPARENCY: Itemized pricing breakdown builds trust
  // Line items show cost factors (base service, material complexity, travel distance)
  // Educates customers on value proposition and justifies pricing
  const customerEmailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2d3a6b;">We've Received Your Quote Request</h2>
      <p>Hi there,</p>
      <p>Thanks for requesting a quote for pressure washing at:</p>
      <p style="font-weight: bold; color: #2d3a6b; font-size: 16px;">${sanitizedAddress}</p>
      
      <h3 style="color: #2d3a6b; margin-top: 30px;">Your Estimated Price</h3>
      <p style="font-size: 24px; color: #2d3a6b; font-weight: bold;">$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}</p>
      
      <h3 style="color: #2d3a6b; margin-top: 30px;">Price Breakdown</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 10px 0; color: #333;">Base Service (${stories} story/stories)</td>
          <td style="padding: 10px 0; color: #333; text-align: right;">$${breakdown.basePrice.toFixed(2)}</td>
        </tr>
        ${breakdown.materialSurcharge > 0 ? `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 10px 0; color: #333;">${material.charAt(0).toUpperCase() + material.slice(1)} Material Surcharge</td>
          <td style="padding: 10px 0; color: #333; text-align: right;">$${breakdown.materialSurcharge.toFixed(2)}</td>
        </tr>
        ` : ''}
        ${breakdown.travelSurcharge > 0 ? `
        <tr style="border-bottom: 1px solid #e0e0e0;">
          <td style="padding: 10px 0; color: #333;">Travel Surcharge (${Math.round(distance)}km)</td>
          <td style="padding: 10px 0; color: #333; text-align: right;">$${breakdown.travelSurcharge.toFixed(2)}</td>
        </tr>
        ` : ''}
      </table>
      
      <h3 style="color: #2d3a6b; margin-top: 30px;">Details</h3>
      <ul style="line-height: 1.8; color: #333;">
        <li><strong>Stories:</strong> ${stories}</li>
        <li><strong>Material:</strong> ${material.charAt(0).toUpperCase() + material.slice(1)}</li>
        <li><strong>Distance:</strong> ${Math.round(distance)}km</li>
        <li><strong>Add-ons:</strong> ${addOnsText}</li>
      </ul>

      <p style="margin-top: 30px; color: #333;">We'll review your property details and get back to you shortly to confirm the final price.</p>
      
      <p style="color: #333;">Best regards,<br><strong>The Water Boys Team</strong></p>
      <p style="color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
        This is an automated message. Please don't reply to this email.
      </p>
    </div>
  `;

  const customerEmailPromise = resend.emails.send({
    from: 'onboarding@resend.dev',
    to: customerEmail,
    subject: `Your Quote from Water Boys Pressure Washing`,
    html: customerEmailTemplate,
  }).catch((error) => {
    console.error('Failed to send customer email:', error);
  });

  // NOTIFICATION PATTERN: Parallel async execution prevents blocking
  // Both emails sent concurrently, failures logged but don't impact API response
  await Promise.all([adminEmailPromise, customerEmailPromise]);
}

// Helper function to send estate service notification
async function sendEstateNotification(
  address: string,
  customerEmail: string,
  stories: number,
  squareFeet: number,
  addOns: { driveway: boolean; gutters: boolean; deckPatio: boolean }
) {
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!ownerEmail) {
    console.warn('OWNER_EMAIL not set, skipping estate notification');
    return;
  }

  // SECURITY: HTML entity encoding prevents XSS attacks in email templates
  const sanitizedAddress = escapeHtml(address);

  // ESTATE QUALIFICATION: Properties 4500+ sq ft trigger manual sales workflow
  // Rationale: Complex properties require custom site assessment and specialized pricing
  const adminEmailPromise = resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ownerEmail,
    subject: `🏛️ ESTATE SERVICE INQUIRY: ${sanitizedAddress} (${squareFeet.toLocaleString()} sq ft)`,
    text: `Estate Service Request\n\nAddress: ${address}\nSquare Footage: ${squareFeet.toLocaleString()} sq ft\nStories: ${stories}\nCustomer Email: ${customerEmail}\n\nThis property qualifies for Executive Soft Wash service. Call customer within 15 minutes to discuss custom pricing.`,
  }).catch((error) => {
    console.error('Failed to send estate admin email:', error);
  });

  // CUSTOMER EXPERIENCE: Premium messaging for high-value prospects
  // Positions property as "estate" requiring specialized service (justifies premium pricing model)
  const customerEmailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2d3a6b;">Estate Service Required</h2>
      <p>Hi there,</p>
      <p>Thank you for requesting a quote for your beautiful property at:</p>
      <p style="font-weight: bold; color: #2d3a6b; font-size: 16px;">${sanitizedAddress}</p>
      
      <h3 style="color: #2d3a6b; margin-top: 30px;">Executive Soft Wash Package</h3>
      <p style="color: #333;">Based on the size of your property (${squareFeet.toLocaleString()} sq ft), your home qualifies for our <strong>Executive Soft Wash package</strong>.</p>
      
      <p style="color: #333; margin-top: 20px;">For premium properties like yours, we perform a manual safety assessment to ensure delicate materials (slate, cedar, imported stone, copper gutters) are protected with our most specialized techniques.</p>

      <h3 style="color: #2d3a6b; margin-top: 30px;">What Happens Next</h3>
      <p style="color: #333;"><strong>Mark (Owner) will call you within 15 minutes</strong> to discuss your property's unique needs and provide a custom rate tailored to your home.</p>

      <p style="color: #333; margin-top: 20px;">This ensures we give you the premium service your estate deserves.</p>
      
      <p style="color: #333; margin-top: 30px;">Best regards,<br><strong>The Water Boys Team</strong></p>
      <p style="color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
        This is an automated message. Please don't reply to this email.
      </p>
    </div>
  `;

  const customerEmailPromise = resend.emails.send({
    from: 'onboarding@resend.dev',
    to: customerEmail,
    subject: `Your Executive Soft Wash Consultation - ${sanitizedAddress}`,
    html: customerEmailTemplate,
  }).catch((error) => {
    console.error('Failed to send estate customer email:', error);
  });

  // NOTIFICATION PATTERN: Parallel async execution prevents blocking
  // Both emails sent concurrently, failures logged but don't impact API response
  await Promise.all([adminEmailPromise, customerEmailPromise]);
}
