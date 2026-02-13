# Smart Routing & Risk-Based Pricing - Quick Reference

## 📊 Pricing Formula

```
Final Price = (Base Rate × Material Multiplier) + Travel Surcharge
```

### Base Rates (per story)
| Stories | Rate |
|---------|------|
| 1       | $350 |
| 2       | $500 |
| 3+      | $650 |

### Material Multipliers
| Material | Multiplier | Surcharge | Use Case |
|----------|-----------|-----------|----------|
| Vinyl    | 1.0x      | None      | Standard siding |
| Brick    | 1.1x      | +10%      | Hard surfaces |
| Stucco   | 1.35x     | +35%      | Delicate, high-risk |

### Travel Surcharge
| Distance | Surcharge |
|----------|-----------|
| < 20km   | $0        |
| 20-45km  | $2.50/km over 20km |
| > 45km   | ❌ REJECTED |

## 🧮 Quick Calculation Examples

### Example 1: 2-Story Vinyl, 15km away
```
Base:          $500 × 1.0 = $500
Travel:        $0 (under 20km)
─────────────────────────────
Total:         $500
Range:         $500-$575 (with 15% margin)
```

### Example 2: 2-Story Brick, 25km away
```
Base:          $500 × 1.1 = $550
Travel:        (25-20) × $2.50 = $12.50
─────────────────────────────
Total:         $562.50
Range:         $563-$647
```

### Example 3: 2-Story Stucco, 30km away
```
Base:          $500 × 1.35 = $675
Travel:        (30-20) × $2.50 = $25.00
─────────────────────────────
Total:         $700.00
Range:         $700-$805
```

## 📝 Material Selection in Frontend

The QuoteGenerator shows material options in Step 2:

```tsx
const materialOptions = [
  { label: 'Vinyl', value: 'vinyl', riskLevel: '(Standard)' },
  { label: 'Brick', value: 'brick', riskLevel: '(Moderate Risk)' },
  { label: 'Stucco', value: 'stucco', riskLevel: '(High Risk)' },
];
```

Each option displays:
- Material name
- Risk level (helps customer understand why stucco costs more)

## 🛣️ Routing Rules

### Distance Validation
✓ **0-20km**: No surcharge (local service area)
✓ **20-45km**: $2.50 per km surcharge (covers travel costs)
❌ **>45km**: Auto-rejected (out of service area)

### Business Logic
- **Rejection**: Beyond 45km, travel costs make job unprofitable
- **Surcharge threshold**: 20km covers basic local service area
- **Rate**: $2.50/km covers fuel (~$1.50), vehicle wear (~$0.70), driver time (~$0.30)

## 🔌 API Request/Response

### Request
```json
{
  "address": "123 Main St, Langley, BC",
  "stories": 2,
  "squareFeet": 2500,
  "material": "stucco",
  "lat": 49.1858,
  "lng": -122.6504,
  "email": "customer@example.com",
  "addOns": {
    "driveway": false,
    "gutters": true,
    "deckPatio": false
  }
}
```

### Success Response
```json
{
  "minPrice": 688,
  "maxPrice": 791,
  "breakdown": {
    "basePrice": 500,
    "materialSurcharge": 175,
    "travelSurcharge": 12.50
  },
  "routing": {
    "distance": 22,
    "duration": "28 mins",
    "travelSurcharge": 12.50
  }
}
```

### Error Response (Out of Service)
```json
{
  "error": "Outside service area",
  "message": "Your location is 52km away. We serve within 45km.",
  "distance": 52
}
```

## 📧 Pricing Breakdown Display

### Frontend (Step 4)
```
Your Estimated Price
$688 - $791

Price Breakdown
Base Service (2 stories):      $500.00
Stucco Material Surcharge:     +$175.00
Travel Surcharge (22km):        +$12.50

Distance: 22 km
```

### Customer Email
```
Base Service (2 stories):       $500.00
Stucco Material Surcharge:      +$175.00
Travel Surcharge (22km):        +$12.50
───────────────────────────────────────
Estimated Price Range:      $688 - $791
```

### Owner Email Subject
```
New Lead: 123 Main St - $688-$791 (22km)
```

## 🐛 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Outside service area" | Distance > 45km | Customer needs to be within service radius |
| "Invalid address" | Address not found | Customer verifies address spelling |
| "Routing service unavailable" | Google API issue | Refresh and try again |
| "Missing required fields" | Incomplete form | Fill all required fields |

## 🔧 Configuration Files

### Key Environment Variables
```
NEXT_PUBLIC_GOOGLE_MAPS_KEY=<api-key>  # Required for routing
OWNER_EMAIL=<email>                     # Where leads go
RESEND_API_KEY=<key>                    # Email service
```

### Pricing Constants (`/app/lib/pricing.ts`)
```typescript
const BUSINESS_ORIGIN = 'Langley, BC, Canada';
const MAX_SERVICE_DISTANCE_KM = 45;
const SURCHARGE_THRESHOLD_KM = 20;
const SURCHARGE_RATE_PER_KM = 2.50;
```

To modify:
1. Edit constants in `pricing.ts`
2. No frontend changes needed (uses API values)
3. Prices update for all new quotes immediately

## 📱 Frontend Components

### QuoteGenerator (`/app/components/QuoteGenerator.tsx`)
- Step 1: Address selection (unchanged)
- Step 2: Details + **Material selection** (NEW)
- Step 3: Add-ons (unchanged)
- Step 4: Summary + **Pricing breakdown** (NEW)

### Pricing Library (`/app/lib/pricing.ts`)
- `calculateRouting()` - Distance Matrix API call
- `calculateQuoteWithMaterial()` - Price calculation
- `getMaterialOptions()` - Material list

### API Route (`/app/api/quote/route.ts`)
- Validates routing
- Calculates material pricing
- Rejects out-of-service jobs
- Sends detailed emails

## ✅ Testing Checklist

- [ ] Local address (< 20km) - no surcharge
- [ ] Distant address (20-45km) - shows surcharge
- [ ] Out of service (> 45km) - shows error
- [ ] Different materials - correct multipliers
- [ ] Email breakdown - matches quote display
- [ ] Admin email - includes distance & surcharge
- [ ] Rate limiting - max 5 quotes per 24h
- [ ] Form validation - requires email

## 📈 Monitoring Metrics

Track these KPIs:
- Quotes generated per day
- % rejected (out of service area)
- Average quote value (by material)
- Conversion rate (quote → job)
- Average distance of jobs
- Travel surcharge impact on pricing

## 🚀 Deployment Notes

1. **Environment Variables**: Set all required keys in production
2. **Google Maps**: Ensure Distance Matrix API is enabled
3. **Rate Limiting**: Uses Upstash Redis - verify connection
4. **Email Service**: Resend API key must be valid
5. **Business Address**: Update BUSINESS_ORIGIN if you relocate

---

For detailed documentation, see:
- `SMART_ROUTING_GUIDE.ts` - Complete implementation guide
- `INTEGRATION_EXAMPLES.md` - Real code examples
