'use client';

import { useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

interface QuoteData {
  address: string;
  lat: number | null;
  lng: number | null;
  squareFeet: number;
  stories: number;
  material: string;  // Updated: material instead of sidingType
  addOns: {
    driveway: boolean;
    gutters: boolean;
    deckPatio: boolean;
  };
  email: string;
  quote: {
    min: number;
    max: number;
    breakdown?: {
      basePrice: number;
      materialSurcharge: number;
      travelSurcharge: number;
    };
    routing?: {
      distance: number;
      duration: string;
      travelSurcharge: number;
    };
  } | null;
  satelliteImage: string | null;
}

function getStaticMapUrl(lat: number, lng: number) {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=20&size=600x400&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
}

const QuoteGenerator = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [distanceError, setDistanceError] = useState<{ distance: number; address: string } | null>(null);
  const [data, setData] = useState<QuoteData>({
    address: '',
    lat: null,
    lng: null,
    squareFeet: 2500,
    stories: 2,
    material: 'vinyl',  // Updated: default material for risk-based pricing
    addOns: {
      driveway: false,
      gutters: false,
      deckPatio: false,
    },
    email: '',
    quote: null,
    satelliteImage: null,
  });

  const {
    value,
    suggestions,
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
  });

  const handleAddressSelect = async (address: string) => {
    setLoading(true);
    try {
      const results = await getGeocode({ address });
      const formattedAddress = results[0]?.formatted_address ?? address;
      const { lat, lng } = await getLatLng(results[0]);
      // Use backend proxy for image to avoid CORS issues
      const imageUrl = `/api/satellite-image?lat=${lat}&lng=${lng}`;

      setData((prev) => ({
        ...prev,
        address: formattedAddress,
        lat,
        lng,
        satelliteImage: imageUrl,
      }));
      setValue(formattedAddress, false);
      clearSuggestions();
    } finally {
      setLoading(false);
    }
  };

  const handleStorySelect = (storyCount: number) => {
    setData((prev) => ({
      ...prev,
      stories: storyCount,
      squareFeet: storyCount === 1 ? 1800 : storyCount === 2 ? 2500 : 3200,
    }));
  };

  const handleNextStep = async () => {
    if (step === 4) {
      setLoading(true);
      try {
        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: data.address,
            stories: data.stories,
            squareFeet: data.squareFeet,
            material: data.material,  // New: send material for risk-based pricing
            addOns: data.addOns,
            lat: data.lat,
            lng: data.lng,
            email: data.email,
          }),
        });

        const result = (await response.json()) as {
          minPrice?: number;
          maxPrice?: number;
          breakdown?: {
            basePrice: number;
            materialSurcharge: number;
            travelSurcharge: number;
          };
          routing?: {
            distance: number;
            duration: string;
            travelSurcharge: number;
          };
          estate?: boolean;
          message?: string;
          error?: string;
          distance?: number;
        };

        // PRIORITY 1: Handle out-of-service-area errors (400 with distance info)
        if (result.error && result.distance !== undefined) {
          setDistanceError({
            distance: result.distance,
            address: data.address,
          });
          setLoading(false);
          return;
        }

        // PRIORITY 2: Handle other API errors
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch quote');
        }

        if (result.estate) {
          // Estate service - show premium message
          setData((prev) => ({
            ...prev,
            quote: { min: 0, max: 0 }, // Placeholder
          }));
        } else {
          setData((prev) => ({
            ...prev,
            quote: {
              min: result.minPrice || 0,
              max: result.maxPrice || 0,
              breakdown: result.breakdown,
              routing: result.routing,
            },
          }));
        }
        // Move to thank you screen after quote is generated
        setSubmitted(true);
      } catch (error) {
        console.error('Quote request error:', error);
        alert(error instanceof Error ? error.message : 'Failed to generate quote. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const storyOptions = [
    { label: '1 Story', value: 1 },
    { label: '2 Story', value: 2 },
    { label: '3+ Story', value: 3 },
  ];

  // Updated: Material options for pricing
  const materialOptions = [
    { label: 'Vinyl', value: 'vinyl' },
    { label: 'Brick', value: 'brick' },
    { label: 'Stucco', value: 'stucco' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {distanceError ? (
          // Too Far Screen
          <div className="text-center">
            <div className="mb-12">
              <svg className="w-24 h-24 mx-auto mb-6" fill="none" stroke="#d32f2f" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-5xl font-bold mb-4" style={{ color: '#d32f2f' }}>
                Too Far Away
              </h1>
              <p className="text-2xl text-gray-600 mb-2">
                Unfortunately, we can't service this location
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-8">
              <div className="space-y-6">
                <div>
                  <p className="text-lg text-gray-600 mb-4">
                    <strong>{distanceError.address}</strong>
                  </p>
                  <p className="text-3xl font-bold" style={{ color: '#2d3a6b' }}>
                    {Math.round(distanceError.distance)}km away
                  </p>
                  <p className="text-gray-500 mt-4 text-lg">
                    We currently serve within 45km of Langley, BC.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <p className="text-gray-600 mb-4">
                    If you believe this is an error or would like to discuss possibilities, please feel free to contact us directly:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <strong>Phone:</strong>{' '}
                      <a href="tel:(206) 619-7551" className="text-blue-600 hover:underline">
                        (206) 619-7551
                      </a>
                    </p>
                    <p className="text-gray-700">
                      <strong>Email:</strong>{' '}
                      <a href={`mailto:${process.env.NEXT_PUBLIC_OWNER_EMAIL}`} className="text-blue-600 hover:underline">
                        {process.env.NEXT_PUBLIC_OWNER_EMAIL}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setDistanceError(null);
                setStep(1);
              }}
              className="px-8 py-3 rounded-lg font-bold text-lg hover:opacity-80 transition"
              style={{ backgroundColor: '#2d3a6b', color: '#ffffff' }}
            >
              Try Another Address
            </button>
          </div>
        ) : submitted ? (
          // Thank You Page
          <div className="text-center">
            <div className="mb-12">
              {data.squareFeet >= 4500 ? (
                <>
                  <svg className="w-24 h-24 mx-auto mb-6" fill="#2d3a6b" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26h6.79l-5.5 3.99 2.09 6.26L12 14.5l-5.38 3.99 2.09-6.26-5.5-3.99h6.79L12 2z" />
                  </svg>
                  <h1 className="text-5xl font-bold mb-4" style={{ color: '#2d3a6b' }}>
                    Estate Service Required
                  </h1>
                  <p className="text-2xl text-gray-600 mb-2">
                    Your home qualifies for our Executive Soft Wash package
                  </p>
                </>
              ) : (
                <>
                  <svg className="w-24 h-24 mx-auto mb-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h1 className="text-5xl font-bold mb-4" style={{ color: '#2d3a6b' }}>
                    Thank You!
                  </h1>
                  <p className="text-2xl text-gray-600 mb-2">
                    We've received your quote request
                  </p>
                </>
              )}
              <p className="text-lg text-gray-500">
                {data.squareFeet < 4500 && 'Mark will contact you before the end of the day'}
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-8">
              <div className="space-y-6">
                {data.squareFeet >= 4500 ? (
                  // Estate message
                  <div>
                    <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                      Based on the size of your property ({data.squareFeet.toLocaleString()} sq ft), your home qualifies for our <strong>Executive Soft Wash package</strong>.
                    </p>
                    <p className="text-gray-600 mb-4 text-lg leading-relaxed">
                      For premium properties like yours, we perform a manual safety assessment to ensure delicate materials (slate, cedar, imported stone, copper gutters) are protected with our most specialized techniques.
                    </p>
                    <p className="text-gray-600 text-lg leading-relaxed font-semibold">
                      Mark will call you within 15 minutes to discuss your property's unique needs and provide a custom rate.
                    </p>
                  </div>
                ) : (
                  // Standard quote
                  <div>
                    <p className="text-gray-600 mb-2">Quote Summary</p>
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Address:</span>
                        <span className="font-semibold">{data.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Stories:</span>
                        <span className="font-semibold">{data.stories}</span>
                      </div>
                      {Object.values(data.addOns).some((v) => v) && (
                        <div className="border-t pt-3">
                          <span className="text-gray-700">Add-ons:</span>
                          <div className="text-sm text-gray-600 mt-1">
                            {data.addOns.driveway && <div>✓ Driveway Cleaning</div>}
                            {data.addOns.gutters && <div>✓ Gutter Cleaning</div>}
                            {data.addOns.deckPatio && <div>✓ Deck/Patio Cleaning</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className={data.squareFeet >= 4500 ? '' : 'py-6 border-t'}>
                  {data.squareFeet < 4500 && (
                    <>
                      <p className="text-gray-600 text-lg mb-2">Estimated Price Range</p>
                      <p className="text-5xl font-bold" style={{ color: '#2d3a6b' }}>
                        ${data.quote?.min.toLocaleString()} - ${data.quote?.max.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-4">
                        Quote for wash only. Additional services will be calculated on site.
                      </p>
                    </>
                  )}
                  <p className="text-sm text-gray-500 mt-4">
                    Confirmation email sent to {data.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">Have questions? Contact us anytime</p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <a
                  href="tel:(206)619-7551"
                  className="px-8 py-4 rounded-xl font-bold text-lg transition-all"
                  style={{ backgroundColor: '#2d3a6b', color: 'white' }}
                >
                  Call Us: (206) 619-7551
                </a>
                <a
                  href="mailto:waterboys@example.com"
                  className="px-8 py-4 rounded-xl font-bold text-lg transition-all border-2"
                  style={{ borderColor: '#2d3a6b', color: '#2d3a6b' }}
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        ) : (
          // Original wizard pages
          <>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3" style={{ color: '#2d3a6b' }}>
            Get Your Free Quote
          </h1>
          <p className="text-lg text-gray-600">
            House Washing - We'll analyze your home and create a personalized estimate
          </p>
        </div>

        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 mx-2 rounded-full transition-all ${
                  s <= step ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {step} of 4
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-8">
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#2d3a6b' }}>
                  Find Your Home
                </h2>
                <p className="text-gray-600">Start with your property address</p>
              </div>

              <div className="relative">
                <label className="block text-lg font-semibold mb-3" style={{ color: '#2d3a6b' }}>
                  Property Address
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="123 Main St, Langley, BC..."
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 transition text-lg"
                />
                {suggestions.status === 'OK' && suggestions.data.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-2xl shadow-lg z-10">
                    {suggestions.data.map((suggestion) => (
                      <button
                        key={suggestion.place_id}
                        onClick={() => handleAddressSelect(suggestion.description)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b last:border-b-0"
                      >
                        <p className="font-medium">{suggestion.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {data.satelliteImage && !loading && (
                <div className="space-y-6">
                  <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={data.satelliteImage}
                      alt="Your property"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                    <p className="text-sm text-blue-700">
                      ✓ Selected: <span className="font-semibold">{data.address}</span>
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Estimated Square Footage: <span className="font-semibold">{data.squareFeet.toLocaleString()} sq ft</span>
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div
                    className="relative w-16 h-16 mb-6"
                    style={{
                      background: 'conic-gradient(#2d3a6b, transparent)',
                      borderRadius: '50%',
                      animation: 'spin 2s linear infinite',
                    }}
                  />
                  <p className="text-lg font-semibold text-gray-700">Finding your home...</p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#2d3a6b' }}>
                  Fine-Tune Details
                </h2>
                <p className="text-gray-600">Adjust your home details if needed</p>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-4" style={{ color: '#2d3a6b' }}>
                  Square Footage: <span className="text-2xl ml-2">
                    {data.squareFeet.toLocaleString()}
                  </span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="100"
                  value={data.squareFeet}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, squareFeet: parseInt(e.target.value) }))
                  }
                  className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #2d3a6b 0%, #2d3a6b ${
                      ((data.squareFeet - 500) / 9500) * 100
                    }%, #e5e7eb ${((data.squareFeet - 500) / 9500) * 100}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>500 sq ft</span>
                  <span>10,000 sq ft</span>
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-4" style={{ color: '#2d3a6b' }}>
                  Number of Stories
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {storyOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData((prev) => ({ ...prev, stories: option.value }))}
                      className={`p-6 rounded-2xl font-bold text-lg transition-all ${
                        data.stories === option.value
                          ? 'shadow-lg'
                          : 'shadow border border-gray-200'
                      }`}
                      style={{
                        backgroundColor:
                          data.stories === option.value ? '#2d3a6b' : '#ffffff',
                        color: data.stories === option.value ? '#ffffff' : '#2d3a6b',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-4" style={{ color: '#2d3a6b' }}>
                  Siding Material
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {materialOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData((prev) => ({ ...prev, material: option.value }))}
                      className={`p-4 rounded-2xl font-semibold transition-all text-left ${
                        data.material === option.value
                          ? 'shadow-lg'
                          : 'shadow border border-gray-200'
                      }`}
                      style={{
                        backgroundColor:
                          data.material === option.value ? '#2d3a6b' : '#ffffff',
                        color: data.material === option.value ? '#ffffff' : '#2d3a6b',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#2d3a6b' }}>
                  Add-ons
                </h2>
                <p className="text-gray-600">Enhance your cleaning package</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'driveway', label: 'Driveway Cleaning' },
                  { key: 'gutters', label: 'Gutter Cleaning' },
                  { key: 'deckPatio', label: 'Deck/Patio Cleaning' },
                ].map((addon) => (
                  <div
                    key={addon.key}
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        addOns: {
                          ...prev.addOns,
                          [addon.key]: !prev.addOns[addon.key as keyof typeof prev.addOns],
                        },
                      }))
                    }
                    className="flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer"
                    style={{
                      borderColor:
                        data.addOns[addon.key as keyof typeof data.addOns] ? '#2d3a6b' : '#e5e7eb',
                      backgroundColor:
                        data.addOns[addon.key as keyof typeof data.addOns] ? 'rgba(45, 58, 107, 0.05)' : '#ffffff',
                    }}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-lg" style={{ color: '#2d3a6b' }}>
                        {addon.label}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        data.addOns[addon.key as keyof typeof data.addOns] ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    >
                      {data.addOns[addon.key as keyof typeof data.addOns] && (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#2d3a6b' }}>
                  {data.quote ? 'Your Quote' : 'Contact & Review'}
                </h2>
                <p className="text-gray-600">
                  {data.quote ? 'Your personalized estimate' : 'Almost there! Give us your email'}
                </p>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div
                    className="relative w-20 h-20 mb-6"
                    style={{
                      background: 'conic-gradient(#2d3a6b, transparent)',
                      borderRadius: '50%',
                      animation: 'spin 2s linear infinite',
                    }}
                  />
                  <p className="text-lg font-semibold text-gray-700">Analyzing your home...</p>
                  <p className="text-sm text-gray-500 mt-2">Using AI to calculate your personalized quote</p>
                </div>
              )}

              {data.quote && !loading && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Address:</span>
                      <span className="font-semibold">{data.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Square Footage:</span>
                      <span className="font-semibold">{data.squareFeet.toLocaleString()} sq ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Stories:</span>
                      <span className="font-semibold">{data.stories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Material:</span>
                      <span className="font-semibold capitalize">{data.material}</span>
                    </div>
                    {data.quote?.routing && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">Distance:</span>
                        <span className="font-semibold">{data.quote.routing.distance} km</span>
                      </div>
                    )}
                    {Object.values(data.addOns).some((v) => v) && (
                      <>
                        <div className="border-t pt-3">
                          <span className="text-gray-700">Add-ons:</span>
                          <div className="text-sm text-gray-600 mt-1">
                            {data.addOns.driveway && <div>✓ Driveway Cleaning</div>}
                            {data.addOns.gutters && <div>✓ Gutter Cleaning</div>}
                            {data.addOns.deckPatio && <div>✓ Deck/Patio Cleaning</div>}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="text-center py-8">
                    <p className="text-gray-600 text-lg mb-2">Your Estimated Price</p>
                    <p className="text-5xl font-bold" style={{ color: '#2d3a6b' }}>
                      ${data.quote.min.toLocaleString()} - ${data.quote.max.toLocaleString()}
                    </p>
                    
                    {/* NEW: Display pricing breakdown with travel surcharge */}
                    {data.quote.breakdown && (
                      <div className="mt-8 bg-blue-50 rounded-2xl p-6 text-left">
                        <h3 className="font-bold mb-4" style={{ color: '#2d3a6b' }}>Price Breakdown</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700">Base Service ({data.stories} story/stories):</span>
                            <span className="font-semibold">${data.quote.breakdown.basePrice.toFixed(2)}</span>
                          </div>
                          {data.quote.breakdown.materialSurcharge > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-700">{data.material.charAt(0).toUpperCase() + data.material.slice(1)} Material Surcharge:</span>
                              <span className="font-semibold">+${data.quote.breakdown.materialSurcharge.toFixed(2)}</span>
                            </div>
                          )}
                          {data.quote.breakdown.travelSurcharge > 0 && (
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-gray-700">Travel Surcharge ({data.quote.routing?.distance}km):</span>
                              <span className="font-semibold text-orange-600">+${data.quote.breakdown.travelSurcharge.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500 mt-4">
                      Quote for wash only. Selected add-ons will be calculated on site.
                    </p>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-2" style={{ color: '#2d3a6b' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              )}

              {!data.quote && !loading && (
                <div>
                  <label className="block text-lg font-semibold mb-2" style={{ color: '#2d3a6b' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {step > 1 && (
            <button
              onClick={handlePrevStep}
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all border-2 border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNextStep}
            disabled={
              loading ||
              (step === 1 && !data.satelliteImage) ||
              (step === 4 && !data.email)
            }
            className="flex-1 px-6 py-4 rounded-xl font-bold text-lg text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#2d3a6b' }}
          >
            {loading ? 'Analyzing...' : step === 4 ? 'Generate Quote' : 'Next'}
          </button>
        </div>
        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
        </>
        )}
      </div>
    </div>
  );
};

export default QuoteGenerator;
