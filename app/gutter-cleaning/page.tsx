import Link from "next/link";
import Image from "next/image";

export default function GutterCleaning() {
	return (
		<main className="min-h-screen flex flex-col px-6 py-12">
			<div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
				<div className="flex flex-col gap-6">
					<div>
						<p className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#2d3a6b" }}>
							Gutter Cleaning in Langley & Nearby
						</p>
						<h1 className="text-4xl md:text-5xl font-bold" style={{ color: "#2d3a6b" }}>
							Keep Water Flowing Away From Your Home
						</h1>
					</div>
					<p className="text-lg text-gray-700">
						Clogged gutters lead to overflowing water, fascia damage, foundation issues, and landscape erosion. We clear debris, flush downspouts, and check for problem spots so rainwater goes where it should.
					</p>
					<div className="flex flex-col gap-3 text-gray-700">
						<div className="flex items-start gap-3">
							<svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							<span>Debris removal and bagging</span>
						</div>
						<div className="flex items-start gap-3">
							<svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							<span>Downspout flushing and flow check</span>
						</div>
						<div className="flex items-start gap-3">
							<svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							<span>Photos before and after for peace of mind</span>
						</div>
						<div className="flex items-start gap-3">
							<svg className="w-6 h-6 flex-shrink-0" style={{ color: "#2d3a6b" }} fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							<span>Licensed, insured, student-run service</span>
						</div>
					</div>
					<div className="flex flex-wrap gap-4">
						<Link
							href="/quote"
							className="px-6 py-3 rounded-lg font-bold text-lg"
							style={{ backgroundColor: "#2d3a6b", color: "#ffffff" }}
						>
							Get a Gutter Cleaning Quote
						</Link>
						<a
							href="tel:+12066197551"
							className="px-6 py-3 rounded-lg font-bold text-lg border"
							style={{ borderColor: "#2d3a6b", color: "#2d3a6b" }}
						>
							Call (206) 619-7551
						</a>
					</div>
				</div>

				<div className="w-full flex justify-center">
					<div className="w-full max-w-md h-72 rounded-2xl overflow-hidden relative" style={{ backgroundColor: "#f0f0f0" }}>
						<Image
							src="/cloggedgutters.jpg"
							alt="Cleaning debris from a home gutter"
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
						Why It Matters
					</h2>
					<p className="text-gray-700">
						Overflowing gutters can rot fascia, stain siding, and push water toward your foundation. Routine cleaning protects your home and saves costly repairs down the line.
					</p>
				</div>
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<h2 className="text-2xl font-bold mb-3" style={{ color: "#2d3a6b" }}>
						Our Process
					</h2>
					<p className="text-gray-700">
						We remove debris by hand, bag it, flush every downspout, and confirm flow. You get photos before and after so you know the job is done right.
					</p>
				</div>
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<h2 className="text-2xl font-bold mb-3" style={{ color: "#2d3a6b" }}>
						Timing
					</h2>
					<p className="text-gray-700">
						Best in spring and fall, or after storms and heavy leaf drop. Reach out anytime you notice overflow or sagging gutters.
					</p>
				</div>
			</div>

			<div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-8">
				<div className="space-y-4">
					<h2 className="text-3xl font-bold" style={{ color: "#2d3a6b" }}>
						Ready to Schedule?
					</h2>
					<p className="text-gray-700">
						Share your address and a couple of photos of the gutters if you can. We’ll get you a fast, fair quote and a time that works.
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
							src="/cloggedgutters.jpg"
							alt="Leaves being cleared from a gutter"
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
