import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';
const baseUrl = process.env.FRONT_URL || 'https://wallspie.com'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about WallsPie, your ultimate destination for stunning, high-quality wallpapers. Discover our mission to provide curated collections of breathtaking 4K and HD wallpapers for free. Browse 10K+ wallpapers across 50+ categories.',
  keywords: ['about wallspie', 'wallpaper website', 'high quality wallpapers', 'free wallpapers', '4k wallpapers', 'about us'],
  openGraph: {
    title: 'About WallsPie - Free 4K Wallpapers & HD Backgrounds',
    description: 'Learn about WallsPie and our mission to provide stunning high-quality wallpapers for your devices.',
    type: 'website',
    url: `${baseUrl}/about`,
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'About WallsPie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About WallsPie',
    description: 'Learn about WallsPie and our mission to provide stunning high-quality wallpapers.',
  },
  alternates: {
    canonical: `${baseUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About WallsPie</h1>
            <p className="text-xl text-white/90 max-w-3xl">
              Your ultimate destination for stunning, high-quality wallpapers
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-4">
                At WallsPie, we believe your device's background should inspire you every day.
                Our mission is to provide a curated collection of breathtaking wallpapers that
                transform your digital experience.
              </p>
              <p className="text-lg text-gray-700">
                Whether you're looking for serene landscapes, abstract art, or vibrant cityscapes,
                we've got something for everyone. All our wallpapers are carefully selected and
                optimized for various screen resolutions.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 flex items-center justify-center">
              <svg
                className="w-64 h-64 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">High Quality</h3>
                <p className="text-gray-600">
                  All wallpapers are available in multiple resolutions, ensuring perfect quality for any device
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="bg-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-pink-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Diverse Collection</h3>
                <p className="text-gray-600">
                  Browse through various categories from nature to abstract, architecture to minimalist
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Download</h3>
                <p className="text-gray-600">
                  Download your favorite wallpapers instantly with just one click, no registration required
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">10K+</div>
                <div className="text-gray-600">Wallpapers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-pink-600 mb-2">50+</div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">100K+</div>
                <div className="text-gray-600">Downloads</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">5K+</div>
                <div className="text-gray-600">Happy Users</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Screen?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start exploring our collection and find the perfect wallpaper that matches your style
            </p>
            <a
              href="/"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors  border-2 border-white/30 shadow-lg hover:shadow-xl"
            >
              Browse Wallpapers
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
