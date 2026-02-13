/**
 * INTEGRATION EXAMPLES: Smart Routing & Risk-Based Pricing
 * 
 * This file demonstrates how the system works end-to-end
 * with real code examples and expected outputs.
 */

// ============================================================================
// EXAMPLE 1: Local Vinyl House (No Travel Surcharge)
// ============================================================================

/**
 * SCENARIO:
 * Customer in Langley (15km from origin), 2-story house, vinyl siding
 * 
 * FRONTEND REQUEST:
 */
const request1 = {
  address: "456 Oak Avenue, Langley, BC",
  stories: 2,
  squareFeet: 2200,
  material: "vinyl",
  addOns: {
    driveway: true,
    gutters: false,
    deckPatio: false,
  },
  lat: 49.1858,
  lng: -122.6504,
  email: "john@example.com",
};

/**
 * BACKEND PROCESSING:
 * 
 * 1. Distance Matrix API Call:
 *    ├─ Origin: "Langley, BC, Canada"
 *    ├─ Destination: "456 Oak Avenue, Langley, BC"
 *    └─ Response: distance = 15.2 km, duration = "18 mins"
 * 
 * 2. Routing Validation:
 *    ├─ Is 15.2 > 45? NO ✓ (not rejected)
 *    ├─ Is 15.2 > 20? NO
 *    └─ Travel Surcharge = $0
 * 
 * 3. Material Risk Pricing:
 *    ├─ Base Rate (2 stories) = $500
 *    ├─ Material Multiplier (vinyl) = 1.0x
 *    ├─ Subtotal = $500 × 1.0 = $500
 *    ├─ Travel Surcharge = $0
 *    ├─ Total = $500
 *    ├─ Min Price = $500
 *    └─ Max Price = $500 × 1.15 = $575
 */

/**
 * BACKEND RESPONSE:
 */
const response1 = {
  minPrice: 500,
  maxPrice: 575,
  breakdown: {
    basePrice: 500,
    materialSurcharge: 0,
    travelSurcharge: 0,
  },
  routing: {
    distance: 15,
    duration: "18 mins",
    travelSurcharge: 0,
  },
};

/**
 * FRONTEND DISPLAY:
 * 
 * ┌─────────────────────────────────────────┐
 * │ Your Estimated Price                    │
 * │ $500 - $575                             │
 * │                                          │
 * │ Price Breakdown                         │
 * │ Base Service (2 stories):      $500.00  │
 * │ (No material surcharge)                 │
 * │ (No travel surcharge - local)           │
 * │                                          │
 * │ Distance: 15 km                         │
 * └─────────────────────────────────────────┘
 * 
 * EMAIL SENT TO CUSTOMER:
 * "Your Quote from Water Boys Pressure Washing"
 * 
 * Breakdown:
 * Base Service (2 stories):       $500.00
 * ────────────────────────────────────────
 * Estimated Price Range:      $500 - $575
 */

// ============================================================================
// EXAMPLE 2: Distant Brick House (With Travel Surcharge)
// ============================================================================

/**
 * SCENARIO:
 * Customer in suburb (28km away), 2-story house, brick siding
 * 
 * FRONTEND REQUEST:
 */
const request2 = {
  address: "789 Maple Drive, Aldergrove, BC",
  stories: 2,
  squareFeet: 2800,
  material: "brick",
  addOns: {
    driveway: false,
    gutters: true,
    deckPatio: false,
  },
  lat: 49.0858,
  lng: -122.6004,
  email: "sarah@example.com",
};

/**
 * BACKEND PROCESSING:
 * 
 * 1. Distance Matrix API Call:
 *    ├─ Origin: "Langley, BC, Canada"
 *    ├─ Destination: "789 Maple Drive, Aldergrove, BC"
 *    └─ Response: distance = 28.4 km, duration = "34 mins"
 * 
 * 2. Routing Validation:
 *    ├─ Is 28.4 > 45? NO ✓ (not rejected)
 *    ├─ Is 28.4 > 20? YES
 *    └─ Travel Surcharge = (28.4 - 20) × $2.50 = $21.00
 * 
 * 3. Material Risk Pricing:
 *    ├─ Base Rate (2 stories) = $500
 *    ├─ Material Multiplier (brick) = 1.1x
 *    ├─ Material Surcharge = $500 × (1.1 - 1.0) = $50
 *    ├─ Subtotal = $500 × 1.1 = $550
 *    ├─ Travel Surcharge = $21.00
 *    ├─ Total = $571.00
 *    ├─ Min Price = $571
 *    └─ Max Price = $571 × 1.15 = $657
 */

/**
 * BACKEND RESPONSE:
 */
const response2 = {
  minPrice: 571,
  maxPrice: 657,
  breakdown: {
    basePrice: 500,
    materialSurcharge: 50,
    travelSurcharge: 21.0,
  },
  routing: {
    distance: 28,
    duration: "34 mins",
    travelSurcharge: 21.0,
  },
};

/**
 * FRONTEND DISPLAY:
 * 
 * ┌─────────────────────────────────────────┐
 * │ Your Estimated Price                    │
 * │ $571 - $657                             │
 * │                                          │
 * │ Price Breakdown                         │
 * │ Base Service (2 stories):      $500.00  │
 * │ Brick Material Surcharge:       +$50.00 │
 * │ Travel Surcharge (28km):        +$21.00 │
 * │                                          │
 * │ Distance: 28 km                         │
 * └─────────────────────────────────────────┘
 * 
 * ADMIN EMAIL SUBJECT:
 * "New Lead: 789 Maple Drive, Aldergrove - $571-$657 (28km)"
 * 
 * ADMIN EMAIL BODY EXCERPT:
 * Price Breakdown:
 * - Base Price: $500
 * - Material Surcharge: $50.00
 * - Travel Surcharge: $21.00
 * 
 * CUSTOMER EMAIL SNIPPET:
 * Base Service (2 stories):       $500.00
 * Brick Material Surcharge:       +$50.00
 * Travel Surcharge (28km):        +$21.00
 * ────────────────────────────────────────
 * Estimated Price Range:      $571 - $657
 */

// ============================================================================
// EXAMPLE 3: High-Risk Stucco House (Large Surcharge)
// ============================================================================

/**
 * SCENARIO:
 * Customer 35km away, 2-story house, delicate stucco siding
 * 
 * FRONTEND REQUEST:
 */
const request3 = {
  address: "321 Cedar Lane, Mission, BC",
  stories: 2,
  squareFeet: 2600,
  material: "stucco",
  addOns: {
    driveway: true,
    gutters: true,
    deckPatio: true,
  },
  lat: 49.1858,
  lng: -122.3004,
  email: "mike@example.com",
};

/**
 * BACKEND PROCESSING:
 * 
 * 1. Distance Matrix API Call:
 *    ├─ Origin: "Langley, BC, Canada"
 *    ├─ Destination: "321 Cedar Lane, Mission, BC"
 *    └─ Response: distance = 35.7 km, duration = "42 mins"
 * 
 * 2. Routing Validation:
 *    ├─ Is 35.7 > 45? NO ✓ (not rejected)
 *    ├─ Is 35.7 > 20? YES
 *    └─ Travel Surcharge = (35.7 - 20) × $2.50 = $39.25
 * 
 * 3. Material Risk Pricing:
 *    ├─ Base Rate (2 stories) = $500
 *    ├─ Material Multiplier (stucco) = 1.35x
 *    ├─ Material Surcharge = $500 × (1.35 - 1.0) = $175
 *    ├─ Subtotal = $500 × 1.35 = $675
 *    ├─ Travel Surcharge = $39.25
 *    ├─ Total = $714.25
 *    ├─ Min Price = $714
 *    └─ Max Price = $714 × 1.15 = $822
 */

/**
 * BACKEND RESPONSE:
 */
const response3 = {
  minPrice: 714,
  maxPrice: 822,
  breakdown: {
    basePrice: 500,
    materialSurcharge: 175,
    travelSurcharge: 39.25,
  },
  routing: {
    distance: 36,
    duration: "42 mins",
    travelSurcharge: 39.25,
  },
};

/**
 * FRONTEND DISPLAY:
 * 
 * ┌─────────────────────────────────────────┐
 * │ Your Estimated Price                    │
 * │ $714 - $822                             │
 * │                                          │
 * │ Price Breakdown                         │
 * │ Base Service (2 stories):      $500.00  │
 * │ Stucco Material Surcharge:     +$175.00 │
 * │ Travel Surcharge (36km):        +$39.25 │
 * │                                          │
 * │ Distance: 36 km                         │
 * └─────────────────────────────────────────┘
 * 
 * MARKETING INSIGHT:
 * Customer sees breakdown explaining why stucco costs more
 * (requires specialized techniques, delicate surface protection)
 * This builds trust and justifies premium pricing
 */

// ============================================================================
// EXAMPLE 4: OUT OF SERVICE AREA (Rejection)
// ============================================================================

/**
 * SCENARIO:
 * Customer 52km away - outside service area
 * 
 * FRONTEND REQUEST:
 */
const request4 = {
  address: "999 Summit Road, Squamish, BC",
  stories: 1,
  squareFeet: 1500,
  material: "vinyl",
  addOns: { driveway: false, gutters: false, deckPatio: false },
  lat: 49.7858,
  lng: -123.1504,
  email: "emma@example.com",
};

/**
 * BACKEND PROCESSING:
 * 
 * 1. Distance Matrix API Call:
 *    └─ Response: distance = 52.3 km
 * 
 * 2. Routing Validation:
 *    ├─ Is 52.3 > 45? YES - REJECTED ✗
 *    └─ Return OUT_OF_SERVICE_AREA error
 * 
 * 3. No quote generated
 */

/**
 * BACKEND RESPONSE:
 */
const response4 = {
  error: "Outside service area",
  message: "Your location is 52km away. We currently serve within 45km of Langley, BC.",
  distance: 52,
};

/**
 * FRONTEND BEHAVIOR:
 * 
 * JavaScript:
 * ```typescript
 * if (result.error && !result.estate) {
 *   alert("Your location is 52km away. We currently serve within 45km of Langley, BC.");
 *   // Keep step at same stage, user can modify address
 *   return;
 * }
 * ```
 * 
 * User Experience:
 * 1. User enters address 52km away
 * 2. Clicks "Generate Quote"
 * 3. App shows error alert
 * 4. User stays on form, can modify address or close
 * 
 * BUSINESS BENEFIT:
 * - Prevents generating unprofitable quotes
 * - Saves time for both customer and business
 * - Maintains clean lead list (only serviceable areas)
 */

// ============================================================================
// EXAMPLE 5: 3-Story House (Highest Base Rate)
// ============================================================================

/**
 * SCENARIO:
 * 3-story house, 25km away, brick siding
 * 
 * CALCULATIONS:
 * ├─ Base Rate (3 stories) = $650
 * ├─ Material Multiplier (brick) = 1.1x
 * ├─ Material Surcharge = $650 × 0.1 = $65
 * ├─ Subtotal = $650 × 1.1 = $715
 * ├─ Travel Surcharge = (25 - 20) × $2.50 = $12.50
 * ├─ Total = $727.50
 * ├─ Min Price = $728
 * └─ Max Price = $838
 * 
 * This demonstrates how the multipliers work across
 * different base rates
 */

// ============================================================================
// DEVELOPER: HOW TO TEST LOCALLY
// ============================================================================

/**
 * 1. Start dev server:
 *    npm run dev
 * 
 * 2. Navigate to quote form:
 *    http://localhost:3000/quote
 * 
 * 3. Fill in test case:
 *    - Address: "456 Oak Avenue, Langley, BC"
 *    - Stories: 2
 *    - Square Footage: 2200
 *    - Material: Vinyl
 *    - Email: test@example.com
 * 
 * 4. Open browser DevTools:
 *    - Network tab
 *    - Look for POST to /api/quote
 *    - Inspect response payload
 *    - Verify breakdown is correct
 * 
 * 5. Check email:
 *    - Resend dashboard shows sent emails
 *    - Verify pricing breakdown in both emails
 *    - Owner email includes distance/surcharge info
 * 
 * 6. Test error handling:
 *    - Enter address > 45km away
 *    - Should see error alert
 *    - No quote generated
 *    - No emails sent
 */

// ============================================================================
// DEBUGGING: COMMON ISSUES
// ============================================================================

/**
 * Issue: "Routing service unavailable"
 * ├─ Cause: Google Maps API key missing/invalid
 * ├─ Fix: Check NEXT_PUBLIC_GOOGLE_MAPS_KEY in .env.local
 * └─ Debug: Verify key in Distance Matrix API call
 * 
 * Issue: Price seems wrong
 * ├─ Cause: Material multiplier not applied
 * ├─ Fix: Check material field is sent in API request
 * └─ Debug: Log breakdown in API response
 * 
 * Issue: No travel surcharge showing
 * ├─ Cause: Distance calculation or threshold
 * ├─ Fix: Check if distance > 20km
 * └─ Debug: Verify routing response distance value
 * 
 * Issue: Quote rejected but seems within 45km
 * ├─ Cause: Driving distance ≠ straight-line distance
 * ├─ Fix: Google Maps uses actual road distance (longer)
 * └─ Debug: Check routing.distance in API response
 */

export {};
