import Link from "next/link";
import Image from "next/image";

export default function PressureWashing() {
  return (
    <main className="min-h-screen flex flex-col px-6 py-12 overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div className="flex flex-col gap-6">
          <div>
            <Link href="/" className="hover:opacity-70 mb-3 inline-block transition font-bold" style={{ color: "#2d3a6b" }}>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "#2d3a6b" }}>
              Pressure Washing
            </h1>
          </div>
          <p className="text-lg text-gray-700">
            High-powered cleaning for driveways, patios, decks, and more—removing stains, algae, and buildup to restore a like-new finish.
          </p>
          <div className="flex flex-col gap-3 text-gray-700">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Driveways, patios, decks, sidewalks</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Removes stains, algae, and buildup</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Commercial and residential</span>
            </div>
          </div>
          <Link
            href="/quote"
            className="px-6 py-3 rounded-lg font-bold text-lg w-fit"
            style={{ backgroundColor: "#2d3a6b", color: "#ffffff" }}
          >
            Get a Free Quote
          </Link>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-md h-72 rounded-2xl overflow-hidden relative" style={{ backgroundColor: "#f0f0f0" }}>
            <Image
              src="/wash.jpg"
              alt="Pressure washing a driveway"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
              priority
            />
          </div>
        </div>
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-3" style={{ color: "#2d3a6b" }}>
              Where It Shines
            </h2>
            <p className="text-gray-700">
              Concrete, pavers, brick, and durable decks respond best to pressure washing, removing grime, algae, and tire marks.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-3" style={{ color: "#2d3a6b" }}>
              Careful Prep
            </h2>
            <p className="text-gray-700">
              We pre-rinse plants, guard nearby siding and doors, and use appropriate tips and pressure for each surface.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-3" style={{ color: "#2d3a6b" }}>
              Good Timing
            </h2>
            <p className="text-gray-700">
              Perfect before listing, after winter, or when algae appears. Dry weather helps results set cleanly.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6" style={{ color: "#2d3a6b" }}>
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border p-5">
              <p className="font-semibold mb-2" style={{ color: "#2d3a6b" }}>Will it damage surfaces?</p>
              <p className="text-gray-700">No—when used correctly. We match pressure and tips to the surface to avoid etching or furring.</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="font-semibold mb-2" style={{ color: "#2d3a6b" }}>Do you use detergents?</p>
              <p className="text-gray-700">For tough algae or oil, we may pre-treat with appropriate cleaners, then rinse thoroughly.</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="font-semibold mb-2" style={{ color: "#2d3a6b" }}>How long until it’s dry?</p>
              <p className="text-gray-700">Most areas are walkable within an hour depending on sun and airflow.</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="font-semibold mb-2" style={{ color: "#2d3a6b" }}>Can you seal after?</p>
              <p className="text-gray-700">We can recommend sealing options and prep the surface cleanly if you plan to seal.</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold" style={{ color: "#2d3a6b" }}>
              Ready to Restore Curb Appeal?
            </h2>
            <p className="text-gray-700">
                Send your address and a couple photos of the area. We’ll provide a fast quote and schedule options.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/quote"
                className="px-6 py-3 rounded-lg font-bold text-lg"
                  style={{ backgroundColor: "#2d3a6b", color: "#ffffff" }}
              >
                Request a Quote
              </Link>
              <a
                href="mailto:markpyvovarov@gmail.com"
                className="px-6 py-3 rounded-lg font-bold text-lg border"
                style={{ borderColor: "#2d3a6b", color: "#2d3a6b" }}
              >
                Email Mark
              </a>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <div className="w-full max-w-md h-64 rounded-2xl overflow-hidden relative" style={{ backgroundColor: "#f0f0f0" }}>
              <Image
                src="/wash.jpg"
                alt="Pressure washing concrete"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>
    </main>
  );
}
