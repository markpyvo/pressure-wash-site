import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <main className="min-h-screen flex flex-col px-6 py-12">
      <div className="max-w-6xl mx-auto w-full">
        {/* Hero/Tagline */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold mb-4" style={{ color: "#2d3a6b" }}>
            Transforming Spaces, One Clean at a Time
          </h1>
        </div>

        {/* Who We Are Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8" style={{ color: "#2d3a6b" }}>
            Who We Are
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            Hi, we're Water Boys Pressure Washing, led by Mark Pyvovarov, a Computer Science student at McGill University. During summers away from studies, we provide pressure washing and exterior cleaning services to our neighbours and the Langley community.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            What started as a way to earn extra money during high school has grown into a genuine passion. Balancing computer science coursework with this hands-on work has taught our team discipline and time management. We've discovered that with the right approach and tools, transforming a driveway, patio, or home exterior can make a real difference in how people feel about their space.
          </p>
          <p className="text-lg text-gray-600">
            We take pride in delivering quality work at fair prices, giving every property our full attention and care. By combining a strong work ethic with a desire to help our community, we've built a reputation for reliability and excellent service in Langley.
          </p>
        </div>

        {/* Our Mission Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8" style={{ color: "#2d3a6b" }}>
            Our Mission
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: "#2d3a6b" }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1" style={{ color: "#2d3a6b" }}>
                  For Our Clients
                </h3>
                <p className="text-gray-600">
                  Deliver premium exterior cleaning services with professionalism, quality, and reliability.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: "#2d3a6b" }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1" style={{ color: "#2d3a6b" }}>
                  For Our Craft
                </h3>
                <p className="text-gray-600">
                  Constantly improve our skills and stay current with the latest techniques and equipment.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: "#2d3a6b" }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1" style={{ color: "#2d3a6b" }}>
                  For Our Community
                </h3>
                <p className="text-gray-600">
                  Serve with integrity, fair pricing, and a genuine desire to help our neighbours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Process Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-8" style={{ color: "#2d3a6b" }}>
            How We Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: "#2d3a6b" }}>
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#2d3a6b" }}>
                    Free Consultation
                  </h3>
                  <p className="text-gray-600">
                    Contact us to discuss your needs. We'll assess the project and provide a detailed, fair quote.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: "#2d3a6b" }}>
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#2d3a6b" }}>
                    Custom Plan
                  </h3>
                  <p className="text-gray-600">
                    We create a tailored approach based on your property's specific needs and concerns.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: "#2d3a6b" }}>
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#2d3a6b" }}>
                    Professional Cleaning
                  </h3>
                  <p className="text-gray-600">
                    We use professional-grade equipment and proven techniques to deliver exceptional results.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold" style={{ backgroundColor: "#2d3a6b" }}>
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#2d3a6b" }}>
                    Quality Check
                  </h3>
                  <p className="text-gray-600">
                    We conduct a thorough review to ensure every detail meets our high standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: "#2d3a6b" }}>
          <h2 className="text-4xl font-bold mb-4 text-white">
            Ready to Transform Your Property?
          </h2>
          <p className="text-lg text-gray-100 mb-8">
            Get a free quote today and see the difference professional pressure washing can make.
          </p>
          <Link
            href="/quote"
            className="inline-block px-8 py-3 rounded-lg font-bold text-lg transition"
            style={{ backgroundColor: "#ffffff", color: "#2d3a6b" }}
          >
            Get a Free Quote
          </Link>
        </div>
      </div>
    </main>
  );
}
