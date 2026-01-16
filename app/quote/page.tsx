import Link from "next/link";

export default function Quote() {
  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/" className="hover:opacity-70 mb-6 inline-block transition font-bold" style={{ color: "#2d3a6b" }}>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-2">Get a Free Quote</h1>
        <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>

        <form className="bg-gray-50 p-8 rounded-lg shadow-sm space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="(206) 619-7551"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Service Type</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a service</option>
              <option value="house-washing">House Washing</option>
              <option value="pressure-washing">Pressure Washing</option>
              <option value="window-cleaning">Window Cleaning</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Property Address</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="123 Main St, Seattle, WA"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Additional Details</label>
            <textarea
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Tell us more about what you need..."
            ></textarea>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="marketing"
              className="w-4 h-4 border border-gray-300 rounded focus:outline-none"
            />
            <label htmlFor="marketing" className="ml-3 text-gray-700">
              I'd like to receive marketing emails and updates about special offers
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
          >
            Get Free Quote
          </button>
        </form>
      </div>
    </main>
  );
}
