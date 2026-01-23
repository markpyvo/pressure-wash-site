import Link from "next/link";
import Image from "next/image";

export default function HouseWashing() {
  return (
    <main className="min-h-screen flex flex-col px-6 py-12 overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div className="flex flex-col gap-6">
          <div>
            <Link href="/" className="hover:opacity-70 mb-3 inline-block transition font-bold" style={{ color: "#2d3a6b" }}>
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "#2d3a6b" }}>
              House Washing
            </h1>
          </div>
          <p className="text-lg text-gray-700">
            Safe, effective soft washing to remove dirt, algae, and mildew from siding without damage.
          </p>
          <div className="flex flex-col gap-3 text-gray-700">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Gentle on siding, trim, and fascia</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Removes dirt, algae, and mildew</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Eco-friendly, safe detergents</span>
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
              src="/softwashing.jpeg"
              alt="Soft washing a house exterior"
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
              Why Soft Washing
            </h2>
            <p className="text-gray-700">
              Traditional pressure can damage siding and force water behind panels. Soft washing uses low pressure with detergents to safely lift and rinse away organic growth.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-3" style={{ color: "#2d3a6b" }}>
              What We Clean
            </h2>
            <p className="text-gray-700">
              Vinyl, painted wood, Hardie board, stucco accents, trims and fascia. We avoid high pressure on delicate areas to protect finishes and caulking.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-3" style={{ color: "#2d3a6b" }}>
              When to Schedule
            </h2>
            <p className="text-gray-700">
              Ideal in spring to refresh after winter and fall to remove mildew before the wet season. Also great ahead of listing or repainting.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6" style={{ color: "#2d3a6b" }}>
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border p-5">
              <p className="font-semibold mb-2" style={{ color: "#2d3a6b" }}>Is it safe for plants?</p>
              <p className="text-gray-700">Yes. We pre-wet landscaping, use diluted, house-safe detergents, and rinse thoroughly to protect plants and finishes.</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="font-semibold mb-2" style={{ color: "#2d3a6b" }}>How long does it take?</p>
              <p className="text-gray-700">Most homes take 2–4 hours depending on size, complexity, and buildup. We’ll provide a time estimate with your quote.</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="font-semibold mb-2" style={{ color: "#2d3a6b" }}>Do you use high pressure?</p>
              <p className="text-gray-700">Only on appropriate hard surfaces. For siding, we use low pressure with detergents to avoid damage and streaking.</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="font-semibold mb-2" style={{ color: "#2d3a6b" }}>Will it remove all stains?</p>
              <p className="text-gray-700">Organic growth and dirt lift well. Some oxidization or deep staining may require painting or specialized treatment.</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold" style={{ color: "#2d3a6b" }}>
              Ready to Freshen Your Home?
            </h2>
            <p className="text-gray-700">
              Share your address and a few photos of the siding if possible. We’ll send a quick quote and scheduling options.
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
                src="/softwashing.jpeg"
                alt="Soft washing siding"
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
