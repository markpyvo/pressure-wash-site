import Link from "next/link";

export default function Gallery() {
  const galleryImages = [
    { id: 1, title: "House Washing Project 1", category: "House Washing" },
    { id: 2, title: "Pressure Washing Driveway", category: "Pressure Washing" },
    { id: 3, title: "Window Cleaning Service", category: "Window Cleaning" },
    { id: 4, title: "House Washing Project 2", category: "House Washing" },
    { id: 5, title: "Pressure Washing Patio", category: "Pressure Washing" },
    { id: 6, title: "Window Cleaning Commercial", category: "Window Cleaning" },
  ];

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link href="/" className="hover:opacity-70 mb-6 inline-block transition font-bold" style={{ color: "#2d3a6b" }}>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-2">Gallery</h1>
        <p className="text-gray-600 mb-12">Check out some of our recent projects and satisfied customers.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryImages.map((image) => (
            <div key={image.id} className="bg-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
              <div className="w-full h-64 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <span className="text-gray-600 font-semibold">{image.title}</span>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold" style={{ color: "#2d3a6b" }}>
                  {image.category}
                </p>
                <p className="text-gray-700">{image.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
