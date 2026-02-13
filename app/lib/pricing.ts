/**
 * ============================================================================
 * SMART ROUTING & RISK-ADJUSTED PRICING ENGINE
 * ============================================================================
 *
 * ARCHITECTURE:
 * This module implements a two-stage quoting system that combines geospatial
 * routing with material-based risk pricing:
 *
 * Stage 1: Distance Matrix Routing
 * ├─ Calls Google Maps Distance Matrix API with business origin
 * ├─ Calculates actual driving distance (not straight-line)
 * ├─ GUARDRAIL: Rejects jobs > 45km (unprofitable service radius)
 * └─ OPTIMIZATION: Applies tiered surcharging ($2.50/km beyond 20km)
 *
 * Stage 2: Material Risk Adjustment
 * ├─ Multiplies base rate by material complexity factor
 * ├─ Vinyl (1.0x): Standard—common, predictable surfaces
 * ├─ Brick (1.1x): Moderate complexity—harder surface, risk of damage
 * └─ Stucco (1.35x): High complexity—delicate, specialized techniques
 *
 * PRICING FORMULA:
 * Quote = (Base Rate × Material Multiplier) + Travel Surcharge
 *
 * BUSINESS IMPACT:
 * • Eliminates unprofitable long-distance jobs automatically
 * • Fair pricing across materials prevents subsidization
 * • Distance-based margins protect profit on fuel/labor costs
 * ============================================================================
 */

const BUSINESS_ORIGIN = process.env.OWNER_ADDRESS || 'Langley, BC, Canada';

const BASE_RATE_PER_STORY = {
  1: 350,
  2: 500,
  3: 650,
} as const;

const MATERIAL_MULTIPLIERS: Record<string, number> = {
  'vinyl': 1.0,
  'brick': 1.1,
  'stucco': 1.35,
};

const ROUTING_CONFIG = {
  MAX_SERVICE_DISTANCE_KM: 45,
  SURCHARGE_THRESHOLD_KM: 20,
  SURCHARGE_RATE_PER_KM: 2.50,
};

/**
 * Error types for routing validation
 */
export enum RoutingError {
  OUT_OF_SERVICE_AREA = 'OUT_OF_SERVICE_AREA',
  API_ERROR = 'API_ERROR',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
}

/**
 * Routing result interface
 */
export interface RoutingResult {
  distance: number;        // Distance in kilometers
  duration: string;        // Travel duration (formatted string)
  travelSurcharge: number; // Additional charge for travel
  isValid: boolean;        // Whether the location is serviceable
  error?: RoutingError;    // Error code if invalid
}

/**
 * Quote breakdown interface
 */
export interface QuoteBreakdown {
  basePrice: number;
  materialMultiplier: number;
  subtotal: number;
  travelSurcharge: number;
  total: number;
  minPrice: number;
  maxPrice: number;
  breakdown: {
    basePrice: number;
    materialSurcharge: number;
    travelSurcharge: number;
  };
}

/**
 * Calculate routing distance and travel surcharge using Google Maps Distance Matrix API.
 *
 * BUSINESS LOGIC:
 * 1. GUARDRAIL (Reject Unprofitable): If distance > 45km, reject job entirely.
 *    Rationale: Beyond 45km, fuel/time costs + current pricing model = negative margin
 * 2. OPTIMIZATION (Surcharge for Recovery): If distance > 20km, charge $2.50/km extra.
 *    Rationale: Covers vehicle depreciation ($0.70/km), fuel (~$1.50), driver time
 *    20km threshold = break-even for local service area
 * 3. GRACE ZONE: Jobs ≤ 20km absorb travel cost in base rate (local coverage)
 *
 * RESILIENCE:
 * • Validates API response at each stage to catch invalid data early
 * • Returns structured error codes for frontend decision-making
 * • Catches exceptions and returns safe defaults (not throwing)
 */
export async function calculateRouting(
  destinationAddress: string,
  googleMapsKey: string
): Promise<RoutingResult> {
  try {
    if (!destinationAddress || !destinationAddress.trim()) {
      return {
        distance: 0,
        duration: '0 mins',
        travelSurcharge: 0,
        isValid: false,
        error: RoutingError.INVALID_ADDRESS,
      };
    }

    if (!googleMapsKey) {
      console.error('Google Maps API key not configured');
      return {
        distance: 0,
        duration: '0 mins',
        travelSurcharge: 0,
        isValid: false,
        error: RoutingError.API_ERROR,
      };
    }

    // GEOSPATIAL INTEGRATION: Call Distance Matrix API with business origin
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(BUSINESS_ORIGIN)}&destinations=${encodeURIComponent(destinationAddress)}&key=${googleMapsKey}&mode=driving`
    );

    if (!response.ok) {
      console.error('Distance Matrix API request failed:', response.statusText);
      return {
        distance: 0,
        duration: '0 mins',
        travelSurcharge: 0,
        isValid: false,
        error: RoutingError.API_ERROR,
      };
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Distance Matrix API error:', data.status, data.error_message);
      return {
        distance: 0,
        duration: '0 mins',
        travelSurcharge: 0,
        isValid: false,
        error: RoutingError.API_ERROR,
      };
    }

    if (!data.rows || data.rows.length === 0 || !data.rows[0].elements || data.rows[0].elements.length === 0) {
      return {
        distance: 0,
        duration: '0 mins',
        travelSurcharge: 0,
        isValid: false,
        error: RoutingError.INVALID_ADDRESS,
      };
    }

    const element = data.rows[0].elements[0];

    if (element.status !== 'OK') {
      console.error('Distance Matrix element error:', element.status);
      return {
        distance: 0,
        duration: '0 mins',
        travelSurcharge: 0,
        isValid: false,
        error: RoutingError.INVALID_ADDRESS,
      };
    }

    const distanceMeters = element.distance.value;
    const durationSeconds = element.duration.value;
    const distanceKm = distanceMeters / 1000;
    const durationMinutes = Math.round(durationSeconds / 60);

    // GUARDRAIL: Reject out-of-service-area jobs
    // Business rationale: 45km+ jobs have unsustainable travel costs relative to service value
    if (distanceKm > ROUTING_CONFIG.MAX_SERVICE_DISTANCE_KM) {
      return {
        distance: distanceKm,
        duration: `${durationMinutes} mins`,
        travelSurcharge: 0,
        isValid: false,
        error: RoutingError.OUT_OF_SERVICE_AREA,
      };
    }

    // SURCHARGE OPTIMIZATION: Calculate distance-based travel cost recovery
    // Jobs within 20km = local coverage (cost absorbed in base rate)
    // Jobs 20-45km = progressive cost recovery at $2.50/km
    let travelSurcharge = 0;
    if (distanceKm > ROUTING_CONFIG.SURCHARGE_THRESHOLD_KM) {
      const excessDistance = distanceKm - ROUTING_CONFIG.SURCHARGE_THRESHOLD_KM;
      travelSurcharge = Math.round(excessDistance * ROUTING_CONFIG.SURCHARGE_RATE_PER_KM * 100) / 100;
    }

    return {
      distance: distanceKm,
      duration: `${durationMinutes} mins`,
      travelSurcharge,
      isValid: true,
    };
  } catch (error) {
    console.error('Routing calculation error:', error);
    return {
      distance: 0,
      duration: '0 mins',
      travelSurcharge: 0,
      isValid: false,
      error: RoutingError.API_ERROR,
    };
  }
}

/**
 * Calculate final quote by applying material-based risk adjustment to base rate.
 *
 * BUSINESS LOGIC:
 * Base pricing by property size (stories) does NOT account for material complexity.
 * This function applies fair risk-adjusted multipliers:
 *
 * • VINYL (1.0x): Standard—common sidings, predictable results, minimal risk
 * • BRICK (1.1x): Moderate—harder surface, more careful technique required,
 *   slight liability risk if mortar damaged
 * • STUCCO (1.35x): High—delicate finish, easily damaged by pressure, requires
 *   specialized low-pressure technique, highest liability exposure
 *
 * PRICING INTEGRITY:
 * Without multipliers, stucco customers would subsidize vinyl customers despite
 * 5x higher service complexity. This preserves margin across all material types.
 *
 * FORMULA:
 * Quote = (Base Rate × Material Multiplier) + Travel Surcharge + [15% margin buffer]
 */
export function calculateQuoteWithMaterial(
  stories: number,
  material: string,
  travelSurcharge: number
): QuoteBreakdown {
  const basePrice = BASE_RATE_PER_STORY[stories as keyof typeof BASE_RATE_PER_STORY] || 650;
  const materialMultiplier = MATERIAL_MULTIPLIERS[material.toLowerCase()] || 1.0;

  // RISK ADJUSTMENT: Apply material multiplier to account for complexity & liability
  const materialSurcharge = basePrice * (materialMultiplier - 1);
  const subtotal = basePrice * materialMultiplier;
  const total = Math.round((subtotal + travelSurcharge) * 100) / 100;

  // MARGIN BUFFER: Apply 15% range for on-site negotiation flexibility
  const minPrice = Math.round(total);
  const maxPrice = Math.round(total * 1.15);

  return {
    basePrice,
    materialMultiplier,
    subtotal,
    travelSurcharge,
    total,
    minPrice,
    maxPrice,
    breakdown: {
      basePrice,
      materialSurcharge: Math.round(materialSurcharge * 100) / 100,
      travelSurcharge,
    },
  };
}

/**
 * Get available material options with their complexity levels.
 * Used by frontend to display material selection during quote flow.
 */
export function getMaterialOptions() {
  return Object.entries(MATERIAL_MULTIPLIERS).map(([material, multiplier]) => ({
    material,
    multiplier,
    riskLevel: getRiskLevel(multiplier),
  }));
}

function getRiskLevel(multiplier: number): string {
  if (multiplier === 1.0) return 'Standard';
  if (multiplier <= 1.15) return 'Moderate';
  return 'High';
}
