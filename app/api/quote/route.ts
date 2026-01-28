import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

interface QuoteRequest {
  address: string;
  stories: number;
  squareFeet: number;
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

// Get client IP address
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Escape HTML to prevent injection
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
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Skip rate limiting on localhost (development)
    const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1';

    let rateLimitHeaders = {
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '5',
      'X-RateLimit-Reset': Date.now().toString(),
    };

    if (!isLocalhost) {
      // Check rate limit only for non-localhost
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

    const { address, stories, squareFeet, addOns, lat, lng, email } = body;

    // Validate required fields
    if (!address || !stories || !lat || !lng || !email || squareFeet === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        {
          status: 400,
          headers: rateLimitHeaders,
        }
      );
    }

    // Check for "Estate Service" homes (4,500+ sq ft)
    if (squareFeet >= 4500) {
      // Send estate notification email instead of quote
      sendEstateNotification(address, email, stories, squareFeet, addOns).catch(
        (error) => console.error('Estate notification failed:', error)
      );

      return NextResponse.json(
        { estate: true, message: 'Estate Service Required' },
        {
          status: 200,
          headers: rateLimitHeaders,
        }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
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
      basePrice = 500;
    } else {
      basePrice = 650;
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
    sendEmails(address, email, minPrice, maxPrice, stories, addOns).catch(
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

  // Sanitize address for HTML output
  const sanitizedAddress = escapeHtml(address);

  // Email 1: Admin notification (to owner)
  const adminEmailPromise = resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ownerEmail,
    subject: `New Lead: ${sanitizedAddress} - $${minPrice.toLocaleString()}-$${maxPrice.toLocaleString()}`,
    text: `New Quote Request\n\nAddress: ${address}\nStories: ${stories}\nAdd-ons: ${addOnsText}\nPrice Range: $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}\nCustomer Email: ${customerEmail}`,
  }).catch((error) => {
    console.error('Failed to send admin email:', error);
  });

  // Email 2: Customer confirmation
  const customerEmailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2d3a6b;">We've Received Your Quote Request</h2>
      <p>Hi there,</p>
      <p>Thanks for requesting a quote for pressure washing at:</p>
      <p style="font-weight: bold; color: #2d3a6b; font-size: 16px;">${sanitizedAddress}</p>
      
      <h3 style="color: #2d3a6b; margin-top: 30px;">Your Estimated Price</h3>
      <p style="font-size: 24px; color: #2d3a6b; font-weight: bold;">$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}</p>
      
      <h3 style="color: #2d3a6b; margin-top: 30px;">Details</h3>
      <ul style="line-height: 1.8; color: #333;">
        <li><strong>Stories:</strong> ${stories}</li>
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

  // Send both emails in parallel
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

  const sanitizedAddress = escapeHtml(address);

  // Email 1: Owner notification of estate inquiry
  const adminEmailPromise = resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ownerEmail,
    subject: `🏛️ ESTATE SERVICE INQUIRY: ${sanitizedAddress} (${squareFeet.toLocaleString()} sq ft)`,
    text: `Estate Service Request\n\nAddress: ${address}\nSquare Footage: ${squareFeet.toLocaleString()} sq ft\nStories: ${stories}\nCustomer Email: ${customerEmail}\n\nThis property qualifies for Executive Soft Wash service. Call customer within 15 minutes to discuss custom pricing.`,
  }).catch((error) => {
    console.error('Failed to send estate admin email:', error);
  });

  // Email 2: Customer confirmation - premium messaging
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

  // Send both emails in parallel
  await Promise.all([adminEmailPromise, customerEmailPromise]);
}
