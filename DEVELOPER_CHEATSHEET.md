# Developer Cheat Sheet: Smart Routing System

Quick reference for common tasks and modifications.

## 🔧 Common Changes

### Change Service Area Radius
**File**: `/app/lib/pricing.ts`

```typescript
// Find this line:
MAX_SERVICE_DISTANCE_KM: 45,

// Change to:
MAX_SERVICE_DISTANCE_KM: 60,  // Now serves up to 60km
```

**Impact**: Quotes beyond 60km will be rejected. No frontend changes needed.

### Change Travel Surcharge Rate
**File**: `/app/lib/pricing.ts`

```typescript
// Find:
SURCHARGE_RATE_PER_KM: 2.50,

// Change to:
SURCHARGE_RATE_PER_KM: 3.00,  // $3 per km instead of $2.50
```

**When to change**: If fuel costs increase, adjust surcharge accordingly.

### Change Travel Surcharge Threshold
**File**: `/app/lib/pricing.ts`

```typescript
// Find:
SURCHARGE_THRESHOLD_KM: 20,

// Change to:
SURCHARGE_THRESHOLD_KM: 25,  // Start charging after 25km instead of 20km
```

**When to change**: To expand local service area without charge.

### Update Base Rates
**File**: `/app/lib/pricing.ts`

```typescript
// Find:
const BASE_RATE_PER_STORY = {
  1: 350,
  2: 500,
  3: 650,
};

// Change to:
const BASE_RATE_PER_STORY = {
  1: 400,   // Increased from 350
  2: 550,   // Increased from 500
  3: 700,   // Increased from 650
};
```

**When to change**: Seasonal rate adjustments, inflation, market conditions.

### Add New Material Type
**File**: `/app/lib/pricing.ts`

```typescript
// Find:
const MATERIAL_MULTIPLIERS: Record<string, number> = {
  'vinyl': 1.0,
  'brick': 1.1,
  'stucco': 1.35,
};

// Add new line:
const MATERIAL_MULTIPLIERS: Record<string, number> = {
  'vinyl': 1.0,
  'brick': 1.1,
  'stucco': 1.35,
  'wood': 1.15,        // Add this
  'fibered-cement': 1.2, // Add this
};
```

**Then update frontend options** in `/app/components/QuoteGenerator.tsx`:

```typescript
const materialOptions = [
  { label: 'Vinyl', value: 'vinyl', riskLevel: '(Standard)' },
  { label: 'Brick', value: 'brick', riskLevel: '(Moderate Risk)' },
  { label: 'Stucco', value: 'stucco', riskLevel: '(High Risk)' },
  { label: 'Wood', value: 'wood', riskLevel: '(Moderate Risk)' },  // Add
  { label: 'Fiber Cement', value: 'fibered-cement', riskLevel: '(Moderate Risk)' },  // Add
];
```

### Change Business Origin Address
**File**: `/app/lib/pricing.ts`

```typescript
// Find:
const BUSINESS_ORIGIN = 'Langley, BC, Canada';

// Change to:
const BUSINESS_ORIGIN = '123 Main St, Langley, BC, Canada';
```

**Impact**: Distance calculations measured from this new origin.

## 📊 How to Check If Changes Work

### Test After Each Change
```bash
# 1. Rebuild the project
npm run build

# 2. Start dev server
npm run dev

# 3. Go to quote form and test
# Navigate to http://localhost:3000/quote
```

### Verify in API Response
Open DevTools → Network tab, submit a quote:
1. Look for POST to `/api/quote`
2. Check response breakdown
3. Verify numbers match your expectations

### Check Email Output
1. Go to [Resend Dashboard](https://resend.com/emails)
2. Look for test emails
3. Verify pricing breakdown in email body

## 🔍 Understanding the Code Flow

```
User fills form
        ↓
Frontend sends POST /api/quote
        ↓
Backend: calculateRouting()
├─ Calls Google Maps API
├─ Gets distance
├─ Validates < 45km
├─ Calculates travel surcharge
        ↓
Backend: calculateQuoteWithMaterial()
├─ Gets base rate for stories
├─ Applies material multiplier
├─ Adds travel surcharge
├─ Returns breakdown
        ↓
API Response sent to frontend
        ↓
Frontend displays breakdown
        ↓
Emails sent (admin + customer)
```

## 🐛 Debugging Tips

### Check What Google Maps Returns
Add console.log in `/app/lib/pricing.ts`:

```typescript
const data = await response.json();
console.log('Distance Matrix Response:', data);  // Add this line
const element = data.rows[0].elements[0];
```

Then check server logs in terminal.

### Verify Material Multiplier Applied
Check the breakdown in API response:
- `materialSurcharge` should equal `basePrice × (multiplier - 1)`
- Example: $500 × (1.35 - 1) = $175 ✓

### Test Distance Calculation
For 25km distance:
- `travelSurcharge` should equal `(25 - 20) × 2.50 = $12.50`

### See Full Request/Response
In DevTools Network tab:
1. Filter by "quote"
2. Click on the request
3. View "Request" tab for what was sent
4. View "Response" tab for what came back

## 📧 Testing Email Output

### View Sent Emails
1. Go to [Resend Dashboard](https://resend.com/emails)
2. Look for emails sent to your test address
3. Check pricing breakdown in HTML

### Test Email Content
```typescript
// Example breakdown to verify in email:
Base Service (2 stories):       $500.00
Brick Material Surcharge:        +$50.00
Travel Surcharge (25km):        +$12.50
────────────────────────────────────────
Estimated Price Range:      $563 - $647
```

## 🎨 Modifying Discount/Margin

The system applies a **15% margin**:
- Min Price = Total (no margin)
- Max Price = Total × 1.15

To change:
**File**: `/app/lib/pricing.ts`, look for `calculateQuoteWithMaterial()`:

```typescript
const maxPrice = Math.round(total * 1.15);  // Change 1.15 to 1.20 for 20% margin
```

## 🔐 Security Notes

- ✅ Email addresses sanitized (HTML escaped)
- ✅ Rate limiting enabled (5 quotes per 24h per IP)
- ✅ Distance validation prevents bad data
- ✅ All inputs validated server-side
- ✅ API key protected (use NEXT_PUBLIC_ for public only)

## 📱 Mobile Testing

### Test Responsive Design
```bash
# Dev tools F12 → Responsive Design Mode
# Or test on actual devices
http://localhost:3000/quote
```

### Test Slow Network
In DevTools → Network tab:
- Set throttling to "Slow 3G"
- Watch how loading states display
- Verify error handling works

## 📊 Monitoring in Production

### Track These Metrics
```javascript
// In Vercel Analytics or Google Analytics:
- Quotes requested
- Quotes generated
- % rejected (out of service)
- Average quote value
- Conversion rate (quote → booking)
```

### Debug Production Issues
**If quotes show wrong price:**
1. Check Google Maps API key valid
2. Verify material value sent in request
3. Check if distance calculation changed
4. Review routing response in Network tab

## 🚀 Performance Tips

The system is already optimized, but if you scale:

### Cache Distance Results
If same address requested multiple times, could cache:
```typescript
// Pseudocode - not implemented yet
const distanceCache = new Map();
if (distanceCache.has(address)) {
  return distanceCache.get(address);
}
```

### Batch Requests
If bulk quoting needed:
```typescript
// Batch multiple requests instead of individual calls
Promise.all(addresses.map(addr => calculateRouting(addr)))
```

## 🔄 Version Control Tips

### Before Committing Changes
```bash
# Run build to check for errors
npm run build

# Run linter
npm run lint

# View what changed
git diff app/lib/pricing.ts
```

### Example Commit Messages
```
"feat: increase service radius to 60km"
"fix: adjust stucco multiplier to 1.4x"
"refactor: add wood siding as material option"
"docs: update pricing documentation"
```

## 🆘 If Something Breaks

### Check These First
1. **Build fails?** → Check TypeScript syntax in modified files
2. **Quote not working?** → Check Google Maps API key
3. **Wrong price?** → Check material multiplier is correct
4. **No email?** → Check OWNER_EMAIL in .env.local
5. **Can't see breakdown?** → Check frontend is sending material field

### Roll Back a Change
```bash
git diff                    # See what changed
git checkout -- file.ts     # Restore original file
```

### Get Help
Look for:
- Error messages in terminal (dev server)
- Error messages in browser console (F12)
- API response in Network tab (DevTools)
- Server logs (if deployed to Vercel, check Vercel dashboard)

---

**Remember**: All configuration is in `/app/lib/pricing.ts`. Change constants there, and the system automatically updates everywhere else!
