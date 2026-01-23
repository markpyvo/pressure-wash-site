import Link from "next/link";
import Image from "next/image";
import BeforeAfterSlider from "./components/BeforeAfterSlider";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12 overflow-x-hidden">
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

      {/* Services Section */}
      <div
        className="mt-20 w-screen max-w-[100vw] box-border rounded-2xl p-12 mb-8 overflow-hidden ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]"
        style={{ backgroundColor: "rgba(45, 58, 107, 0.08)", overflowX: "clip" }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: "#2d3a6b" }}>
            Services We Offer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pressure Washing */}
            <Link href="/pressure-washing">
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer h-full">
                <div className="w-full h-40 rounded-lg overflow-hidden mb-4 relative" style={{ backgroundColor: "#f0f0f0" }}>
                  <Image
                    src="/wash.jpg"
                    alt="Pressure washing a driveway"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
                    priority
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: "#2d3a6b" }}>
                  Pressure Washing
                </h3>
                <p className="text-gray-600 mb-4">
                  High-powered water spray to clean driveways, patios, and concrete surfaces.
                </p>
                <span className="font-semibold hover:opacity-80 transition" style={{ color: "#2d3a6b" }}>Learn More</span>
              </div>
            </Link>

            {/* House Washing */}
            <Link href="/house-washing">
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer h-full">
                <div className="w-full h-40 rounded-lg overflow-hidden mb-4 relative" style={{ backgroundColor: "#f0f0f0" }}>
                  <Image
                    src="/softwashing.jpeg"
                    alt="Soft washing a house exterior"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: "#2d3a6b" }}>
                  House Washing
                </h3>
                <p className="text-gray-600 mb-4">
                  Soft washing to clean your home's siding, exterior walls, and trim safely.
                </p>
                <span className="font-semibold hover:opacity-80 transition" style={{ color: "#2d3a6b" }}>Learn More</span>
              </div>
            </Link>

            {/* Window Cleaning */}
            <Link href="/window-cleaning">
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer h-full">
                <div className="w-full h-40 rounded-lg overflow-hidden mb-4 relative" style={{ backgroundColor: "#f0f0f0" }}>
                  <Image
                    src="/windowwash.jpg"
                    alt="Cleaning residential windows"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: "#2d3a6b" }}>
                  Window Cleaning
                </h3>
                <p className="text-gray-600 mb-4">
                  Crystal clear windows for your home's interior and exterior sides.
                </p>
                <span className="font-semibold hover:opacity-80 transition" style={{ color: "#2d3a6b" }}>Learn More</span>
              </div>
            </Link>

            {/* Gutter Cleaning */}
            <Link href="/gutter-cleaning">
              <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer h-full">
                <div className="w-full h-40 rounded-lg overflow-hidden mb-4 relative" style={{ backgroundColor: "#f0f0f0" }}>
                  <Image
                    src="/cloggedgutters.jpg"
                    alt="Clearing debris from gutters"
                    width={640}
                    height={360}
                    className="object-cover w-full h-full"
                    sizes="(min-width: 1024px) 320px, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: "#2d3a6b" }}>
                  Gutter Cleaning
                </h3>
                <p className="text-gray-600 mb-4">
                  Clear debris, protect fascia, and keep water flowing away from your home.
                </p>
                <span className="font-semibold hover:opacity-80 transition" style={{ color: "#2d3a6b" }}>Learn More</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Before/After Slider */}
      <div className="mt-8 w-full">
        <BeforeAfterSlider />
      </div>
    </main>
  );
}