import Link from "next/link";

export default function HouseWashing() {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="hover:opacity-70 mb-6 inline-block transition font-bold" style={{ color: "#2d3a6b" }}>
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-6">House Washing</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Our professional house washing service will transform the appearance of your home. 
          We use safe, effective cleaning methods to remove dirt, algae, and mildew from your 
          siding without causing damage.
        </p>

        <div className="bg-gray-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">What's Included</h2>
          <ul className="space-y-3 text-gray-700">
            <li>✓ Exterior siding cleaning</li>
            <li>✓ Roof soft washing</li>
            <li>✓ Gutter cleaning</li>
            <li>✓ Trim and fascia cleaning</li>
            <li>✓ Environmentally friendly products</li>
          </ul>
        </div>

        <Link
          href="/quote"
          className="mt-8 inline-block bg-black text-white px-8 py-4 rounded-lg text-lg hover:bg-gray-800"
        >
          Get a Free Quote
        </Link>
      </div>
    </main>
  );
}
