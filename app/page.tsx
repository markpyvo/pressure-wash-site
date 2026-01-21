import Link from "next/link";
import Image from "next/image";
import BeforeAfterSlider from "./components/BeforeAfterSlider";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl w-full items-center">
        {/* Image on the left */}
        <div className="flex justify-center">
          <Image
            src="/yellowguy.jpg"
            alt="Professional Pressure Washing"
            width={400}
            height={400}
            className="w-full max-w-md h-auto rounded-2xl"
          />
        </div>
        
        {/* Text on the right */}
        <div className="flex flex-col items-start text-left">
          <h1 className="text-5xl font-bold mb-2">
            Langley & Surrounding Areas
          </h1>
          <h2 className="text-3xl font-bold mb-6" style={{ color: "#2d3a6b" }}>
            #1 Exterior Cleaners
          </h2>

          <p className="text-lg mb-8 text-gray-600">
            Driveways, siding, decks, and more. Reliable, affordable pressure washing
            services that make your home look brand new.
          </p>

          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">Licensed & Fully Insured</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">Student Owned Company</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">100% Satisfaction Guaranteed</span>
            </div>
          </div>

          <Link
            href="/quote"
            className="bg-black text-white px-8 py-4 rounded-lg text-lg hover:bg-gray-800"
          >
            Get a Free Quote
          </Link>
        </div>
      </div>

      {/* Before/After Slider */}
      <div className="mt-20 w-full">
        <BeforeAfterSlider />
      </div>
    </main>
  );
}