'use client';

import { useState } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

interface QuoteData {
  address: string;
  lat: number | null;
  lng: number | null;
  squareFeet: number;
  stories: number;
  sidingType: string;
  addOns: {
    driveway: boolean;
    gutters: boolean;
    deckPatio: boolean;
  };
  email: string;
  quote: {
    min: number;
    max: number;
  } | null;
  satelliteImage: string | null;
}

function getStaticMapUrl(lat: number, lng: number) {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=20&size=600x400&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
}

const QuoteGenerator = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<QuoteData>({
    address: '',
    lat: null,
    lng: null,
    squareFeet: 2500,
    stories: 2,
    sidingType: 'vinyl',
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
            addOns: data.addOns,
            lat: data.lat,
            lng: data.lng,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }

        const result = (await response.json()) as {
          minPrice: number;
          maxPrice: number;
        };

        setData((prev) => ({
          ...prev,
          quote: { min: result.minPrice, max: result.maxPrice },
        }));
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

  const sidingOptions = [
    { label: 'Vinyl', value: 'vinyl' },
    { label: 'Wood', value: 'wood' },
    { label: 'Brick', value: 'brick' },
    { label: 'Stucco', value: 'stucco' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3" style={{ color: '#2d3a6b' }}>
            Get Your Free Quote
          </h1>
          <p className="text-lg text-gray-600">
            We'll analyze your home and create a personalized estimate
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
                  Siding Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {sidingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData((prev) => ({ ...prev, sidingType: option.value }))}
                      className={`p-4 rounded-2xl font-semibold transition-all ${
                        data.sidingType === option.value
                          ? 'shadow-lg'
                          : 'shadow border border-gray-200'
                      }`}
                      style={{
                        backgroundColor:
                          data.sidingType === option.value ? '#2d3a6b' : '#ffffff',
                        color: data.sidingType === option.value ? '#ffffff' : '#2d3a6b',
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
                      <span className="text-gray-700">Siding:</span>
                      <span className="font-semibold capitalize">{data.sidingType}</span>
                    </div>
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
                    <p className="text-sm text-gray-500 mt-4">
                      This is an estimate. Final price may vary based on job complexity.
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
            {loading ? 'Analyzing...' : data.quote && step === 4 ? 'Send Quote to Email' : step === 4 ? 'Generate Quote' : 'Next'}
          </button>
        </div>
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
    </div>
  );
};

export default QuoteGenerator;
