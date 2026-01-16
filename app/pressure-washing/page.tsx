import Link from "next/link";

export default function PressureWashing() {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="hover:opacity-70 mb-6 inline-block transition font-bold" style={{ color: "#2d3a6b" }}>
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-6">Pressure Washing</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Our high-powered pressure washing service is perfect for driveways, patios, decks, 
          and more. We remove stubborn stains, algae, and buildup to restore surfaces to like-new condition.
        </p>

        <div className="bg-gray-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">What's Included</h2>
          <ul className="space-y-3 text-gray-700">
            <li>✓ Driveway cleaning</li>
            <li>✓ Patio and deck washing</li>
            <li>✓ Concrete surface cleaning</li>
            <li>✓ Sidewalk and walkway cleaning</li>
            <li>✓ Commercial property washing</li>
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
