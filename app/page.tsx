import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold mb-2">
        Langley & Surrounding Areas
      </h1>
      <h2 className="text-3xl font-bold mb-6" style={{ color: "#2d3a6b" }}>
        #1 Exterior Cleaners
      </h2>

      <p className="text-lg max-w-xl mb-8 text-gray-600">
        Driveways, siding, decks, and more. Reliable, affordable pressure washing
        services that make your home look brand new.
      </p>

      <Link
        href="/quote"
        className="bg-black text-white px-8 py-4 rounded-lg text-lg"
      >
        Get a Free Quote
      </Link>
    </main>
  );
}