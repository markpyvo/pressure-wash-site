import Image from "next/image";

export default function Gallery() {
  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-6">Gallery</h1>

        <div className="space-y-6">
          <div className="flex rounded-xl overflow-hidden h-56">
            <div className="flex-1 relative">
              <Image src="/housebefore.jpg" alt="House before cleaning" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" priority />
            </div>
            <div className="flex-1 relative">
              <Image src="/houseafter.jpg" alt="House after cleaning" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" priority />
            </div>
          </div>
          <div className="flex rounded-xl overflow-hidden h-56">
            <div className="flex-1 relative">
              <Image src="/before2.JPEG" alt="Second project before cleaning" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            <div className="flex-1 relative">
              <Image src="/after2.JPEG" alt="Second project after cleaning" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
