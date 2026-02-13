/**
 * SMART ROUTING & RISK-BASED PRICING SYSTEM
 * ==========================================
 * 
 * Implementation guide for the quoting engine with distance-based routing
 * and material-based risk pricing multipliers.
 */

// ============================================================================
// 1. BACKEND SETUP (API Route)
// ============================================================================

/**
 * Location: /app/api/quote/route.ts
 * 
 * Key Updates:
 * - Added Google Maps Distance Matrix API integration
 * - Implements rejection rule for out-of-service areas (>45km)
 * - Calculates travel surcharge for distances >20km
 * - Material-based risk pricing with multipliers
 * - Returns detailed pricing breakdown to frontend
 */

// Example API Request:
// POST /api/quote
// {
//   "address": "123 Main St, Langley, BC",
//   "stories": 2,
//   "squareFeet": 2500,
//   "material": "stucco",      // NEW: material for risk-based pricing
//   "addOns": {
//     "driveway": false,
//     "gutters": true,
//     "deckPatio": false
//   },
//   "lat": 49.1858,
//   "lng": -122.6504,
//   "email": "customer@example.com"
// }

// Example API Response (Success):
// {
//   "minPrice": 676,
//   "maxPrice": 777,
//   "breakdown": {
//     "basePrice": 500,
//     "materialSurcharge": 175,      // 35% markup for stucco
//     "travelSurcharge": 12.50       // 2.5 km over 20km threshold × $2.50/km
//   },
//   "routing": {
//     "distance": 22.5,
//     "duration": "28 mins",
//     "travelSurcharge": 12.50
//   }
// }

// Example API Response (Out of Service Area):
// {
//   "error": "Outside service area",
//   "message": "Your location is 52km away. We currently serve within 45km of Langley, BC.",
//   "distance": 52
// }

// ============================================================================
// 2. PRICING LOGIC (/app/lib/pricing.ts)
// ============================================================================

/**
 * Base Rate (per story):
 * - 1 story: $350
 * - 2 stories: $500
 * - 3+ stories: $650
 * 
 * Material Multipliers (applied to base rate):
 * - vinyl:  1.0x  (standard - no surcharge)
 * - brick:  1.1x  (10% surcharge - harder surface)
 * - stucco: 1.35x (35% surcharge - delicate, high-risk)
 * 
 * Formula:
 * Subtotal = Base Rate × Material Multiplier
 * Final Price = Subtotal + Travel Surcharge
 * 
 * Example Calculations:
 * 
 * Case 1: 2-story vinyl house, 15km away
 * ├─ Base: $500 × 1.0 = $500
 * ├─ Travel Surcharge: $0 (under 20km threshold)
 * └─ Total: $500
 * 
 * Case 2: 2-story brick house, 25km away
 * ├─ Base: $500 × 1.1 = $550
 * ├─ Travel Surcharge: (25-20) × $2.50 = $12.50
 * └─ Total: $562.50
 * 
 * Case 3: 2-story stucco house, 30km away
 * ├─ Base: $500 × 1.35 = $675
 * ├─ Travel Surcharge: (30-20) × $2.50 = $25
 * └─ Total: $700
 */

// ============================================================================
// 3. ROUTING VALIDATION (Business Rules)
// ============================================================================

/**
 * REJECTION RULE (Out of Service Area)
 * ├─ Condition: Distance > 45km
 * ├─ Action: Return RoutingError.OUT_OF_SERVICE_AREA
 * └─ Frontend: Show error message to customer
 * 
 * Rationale: Beyond 45km, travel time and costs make the job unprofitable
 * even at higher pricing. Better to reject upfront than generate bad leads.
 * 
 * SURCHARGE RULE (Travel Cost Recovery)
 * ├─ Threshold: 20km
 * ├─ Rate: $2.50 per km over threshold
 * ├─ Calculation: (distance - 20) × $2.50
 * └─ Covers: Fuel, vehicle wear, driver time
 * 
 * Under 20km: No surcharge (local service area)
 * This encourages local customers and covers basic travel in local pricing
 */

// ============================================================================
// 4. FRONTEND INTEGRATION (/app/components/QuoteGenerator.tsx)
// ============================================================================

/**
 * Step 1: Address Selection (unchanged)
 * ├─ Collect customer address
 * ├─ Use Google Places API autocomplete
 * └─ Get latitude/longitude
 * 
 * Step 2: Property Details (UPDATED)
 * ├─ Square footage slider
 * ├─ Number of stories (1, 2, 3+)
 * └─ Material selection (NEW - vinyl, brick, stucco)
 * 
 * Step 3: Add-ons (unchanged)
 * ├─ Driveway cleaning
 * ├─ Gutter cleaning
 * └─ Deck/patio cleaning
 * 
 * Step 4: Contact & Quote (UPDATED)
 * ├─ Email entry
 * ├─ Display estimated price range
 * ├─ Show pricing breakdown (NEW)
 * │  ├─ Base service cost
 * │  ├─ Material surcharge line item
 * │  └─ Travel surcharge line item (if applicable)
 * └─ Show distance/routing info (NEW)
 * 
 * API Call Integration:
 * - Send "material" field along with address and other data
 * - Handle routing error responses (out of service area)
 * - Display breakdown in summary (base, material, travel)
 * - Show distance in km in the summary
 */

// ============================================================================
// 5. ERROR HANDLING
// ============================================================================

/**
 * Error Scenarios:
 * 
 * 1. Out of Service Area (> 45km)
 *    ├─ HTTP Status: 400 Bad Request
 *    ├─ Response: { error, message, distance }
 *    └─ Frontend: Alert user, suggest checking address
 * 
 * 2. Invalid Address
 *    ├─ HTTP Status: 400 Bad Request
 *    ├─ Response: { error: "Invalid address..." }
 *    └─ Frontend: Ask user to verify address
 * 
 * 3. Routing API Error
 *    ├─ HTTP Status: 503 Service Unavailable or continues with estimate
 *    ├─ Response: { error: "Routing service unavailable" }
 *    └─ Frontend: Show error or use fallback estimate
 * 
 * 4. Missing Required Fields
 *    ├─ HTTP Status: 400 Bad Request
 *    ├─ Response: { error: "Missing required fields" }
 *    └─ Frontend: Form validation before submitting
 */

// ============================================================================
// 6. GUARDRAILS & VALIDATION
// ============================================================================

/**
 * Input Validation:
 * ✓ Address not empty
 * ✓ Stories between 1-3
 * ✓ Square footage reasonable (500-10,000)
 * ✓ Material in allowed list (vinyl, brick, stucco)
 * ✓ Email format valid
 * ✓ Coordinates present
 * 
 * Business Logic Checks:
 * ✓ Estate service check (>4500 sq ft) - triggers manual quote
 * ✓ Distance validation - rejects >45km jobs
 * ✓ Rate limiting - max 5 quotes per customer per 24h
 * ✓ Email sanitization - prevents injection attacks
 * 
 * Pricing Guardrails:
 * ✓ Minimum multiplier: 1.0x (vinyl = no markup)
 * ✓ Maximum surcharge: 1.35x (stucco = 35% markup)
 * ✓ Price margin: +15% (min to max range)
 * ✓ All monetary values rounded to cents
 */

// ============================================================================
// 7. CONFIGURATION & ENVIRONMENT VARIABLES
// ============================================================================

/**
 * Required Environment Variables (.env.local):
 * 
 * NEXT_PUBLIC_GOOGLE_MAPS_KEY=<your-api-key>
 * ├─ Public key for frontend (Places API, Maps)
 * └─ Server uses same key for Distance Matrix API
 * 
 * UPSTASH_REDIS_REST_URL=<your-redis-url>
 * UPSTASH_REDIS_REST_TOKEN=<your-token>
 * └─ Used for rate limiting
 * 
 * RESEND_API_KEY=<your-resend-key>
 * └─ Email service for quote confirmations
 * 
 * OWNER_EMAIL=<your-email>
 * └─ Where lead notifications are sent
 * 
 * Modifiable Constants (in /app/lib/pricing.ts):
 * - BUSINESS_ORIGIN: Your service origin address
 * - BASE_RATE_PER_STORY: Pricing by stories
 * - MATERIAL_MULTIPLIERS: Risk multipliers
 * - ROUTING_CONFIG: Distance rules
 */

// ============================================================================
// 8. BUSINESS LOGIC EXPLAINED
// ============================================================================

/**
 * Why Smart Routing?
 * 
 * Traditional: Flat rate for all customers
 * Problem: Long-distance jobs unprofitable, local jobs overpriced
 * 
 * Smart Routing: Distance-based surcharge
 * Solution: 
 * - Cover travel costs for distant customers
 * - Keep local pricing competitive
 * - Auto-reject unprofitable jobs (>45km)
 * 
 * Why Material Risk Pricing?
 * 
 * Traditional: Single rate regardless of surface
 * Problem: Vinyl customers subsidize stucco customers
 * 
 * Risk-Based: Multiplier per material type
 * Solution:
 * - Vinyl (1.0x): Standard - fast, straightforward
 * - Brick (1.1x): Moderate - harder surface, more care
 * - Stucco (1.35x): High - delicate, specialized techniques
 * 
 * This ensures profitability and fair pricing
 */

// ============================================================================
// 9. EMAIL NOTIFICATIONS
// ============================================================================

/**
 * Owner Email (Admin Notification)
 * Includes:
 * - Full quote breakdown (base, material surcharge, travel surcharge)
 * - Distance in km
 * - Customer email
 * - All property details
 * 
 * Example Subject:
 * "New Lead: 123 Main St, Langley - $575-$661 (22km)"
 * 
 * Customer Email (Confirmation)
 * Includes:
 * - Itemized price breakdown table
 * - Material type and surcharge reason
 * - Travel surcharge (distance × rate)
 * - Estimated range ($X - $Y)
 * - Property details summary
 * 
 * Example Section:
 * Base Service (2 stories):       $500.00
 * Stucco Material Surcharge:      +$175.00
 * Travel Surcharge (22km):        +$12.50
 * ────────────────────────────────────────
 * Estimated Price Range:    $688 - $791
 */

// ============================================================================
// 10. TESTING THE IMPLEMENTATION
// ============================================================================

/**
 * Manual Testing Checklist:
 * 
 * 1. Local Address (< 20km)
 *    ├─ Address: Local Langley property
 *    ├─ Material: Vinyl
 *    └─ Expected: No travel surcharge
 * 
 * 2. Distant Address (20-45km)
 *    ├─ Address: Far suburb (e.g., 30km away)
 *    ├─ Material: Brick
 *    └─ Expected: Travel surcharge = (30-20) × $2.50 = $25
 * 
 * 3. Out of Service Area (> 45km)
 *    ├─ Address: Far outside service area (e.g., 60km)
 *    └─ Expected: Error message, no quote generated
 * 
 * 4. High-Risk Material
 *    ├─ Address: Local
 *    ├─ Material: Stucco
 *    ├─ Stories: 2
 *    └─ Expected: Price = $500 × 1.35 = $675 (before margin)
 * 
 * 5. API Error Handling
 *    └─ Disable Google Maps key temporarily and test error response
 */

// ============================================================================
// 11. FUTURE ENHANCEMENTS
// ============================================================================

/**
 * Potential Improvements:
 * 
 * 1. Dynamic Service Radius
 *    - Adjust MAX_SERVICE_DISTANCE based on time/season
 *    - Expand service area as business grows
 * 
 * 2. Additional Material Types
 *    - Wood (1.15x): Moderate - needs careful handling
 *    - Fiber Cement (1.2x): Moderate-High
 *    - Custom multipliers per material
 * 
 * 3. Zone-Based Pricing
 *    - Premium rates for certain areas
 *    - Different surcharge rates by zone
 * 
 * 4. Time-of-Day Pricing
 *    - Rush hour surcharge
 *    - Seasonal pricing adjustments
 * 
 * 5. Machine Learning
 *    - Historical quote acceptance rates
 *    - Auto-adjust pricing for optimal conversion
 * 
 * 6. Real-Time Rate Display
 *    - Show live surcharge as customer types address
 *    - Display material multiplier explanation
 */

export {};
