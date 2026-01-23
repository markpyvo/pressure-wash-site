import Link from "next/link";
import Image from "next/image";

export default function WindowCleaning() {
  return (
    <main className="min-h-screen flex flex-col px-6 py-12 overflow-x-hidden">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div className="flex flex-col gap-6">
          <div>
            <Link href="/" className="hover:opacity-70 mb-3 inline-block transition font-bold" style={{ color: "#2d3a6b" }}>
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "#2d3a6b" }}>
              Window Cleaning
            </h1>
          </div>
          <p className="text-lg text-gray-700">
            Crystal clear, streak-free windows to brighten your home and let in more light.
          </p>
          <div className="flex flex-col gap-3 text-gray-700">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Interior and exterior panes</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Frames and sills cleaned</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Streak-free, spotless finish</span>
            </div>
          </div>
          <Link
            href="/quote"
            className="px-6 py-3 rounded-lg font-bold text-lg w-fit"
            style={{ backgroundColor: "#2d3a6b", color: "#f5f1e8" }}
          >
            Get a Free Quote
          </Link>
        </div>

        <div className="w-full flex justify-center">
          <div className="w-full max-w-md h-72 rounded-2xl overflow-hidden relative" style={{ backgroundColor: "#f0f0f0" }}>
            <Image
              src="/windowwash.jpg"
              alt="Cleaning residential windows"
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
              Why Pro Cleaning
            </h2>
            <p className="text-gray-700">
              Streak-free results with the right tools and technique. We clean panes, frames, and sills for a complete finish.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-3" style={{ color: "#2d3a6b" }}>
              What’s Included
            </h2>
            <p className="text-gray-700">
              Inside and outside panes, wiped frames and sills, light screen dusting on request. Exterior focus by default to keep things simple.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-3" style={{ color: "#2d3a6b" }}>
              How Often
            </h2>
            <p className="text-gray-700">
              Twice a year keeps glass bright. Seasonal pollen or coastal spray may need more frequent care.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6" style={{ color: "#2d3a6b" }}>
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border p-5">
              <p className="font-semibold mb-2" style={{ color: "#2d3a6b" }}>Do you clean interior windows?</p>
              <p className="text-gray-700">Yes—on request. Exterior cleans are standard; interior service is available with scheduling.</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="font-semibold mb-2" style={{ color: "#2d3a6b" }}>What about screens?</p>
              <p className="text-gray-700">We can remove and lightly dust or rinse exterior screens as part of service if requested.</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="font-semibold mb-2" style={{ color: "#2d3a6b" }}>Can you fix hard-water spots?</p>
              <p className="text-gray-700">Light spots often lift. Heavy mineral deposits may need specialized treatment; we’ll advise on options.</p>
            </div>
            <div className="rounded-xl border p-5">
              <p className="font-semibold mb-2" style={{ color: "#2d3a6b" }}>What if it rains?</p>
              <p className="text-gray-700">Rain itself doesn’t dirty clean glass. If weather disrupts, we’ll reschedule promptly.</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold" style={{ color: "#2d3a6b" }}>
              Ready for Crystal Clear Glass?
            </h2>
            <p className="text-gray-700">
              Send your address and number of window panes or a few photos. We’ll reply with a quick quote and scheduling.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/quote"
                className="px-6 py-3 rounded-lg font-bold text-lg"
                style={{ backgroundColor: "#2d3a6b", color: "#f5f1e8" }}
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
                src="/windowwash.jpg"
                alt="Cleaning residential windows"
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
