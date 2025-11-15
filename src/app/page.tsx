'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WallpaperGrid from '@/components/WallpaperGrid';
import CategoryCard from '@/components/CategoryCard';
import Loading, { LoadingGrid } from '@/components/Loading';

export default function Home() {
  const [featuredWallpapers, setFeaturedWallpapers] = useState<any[]>([]);
  const [trendingWallpapers, setTrendingWallpapers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featured, trending, cats] = await Promise.all([
          api.getWallpapers({ featured: true, limit: 8 }),
          api.getTrendingWallpapers(8),
          api.getCategories(),
        ]);

        setFeaturedWallpapers(featured.data || []);
        setTrendingWallpapers(trending.data || []);

        if(cats?.data && cats.data.length > 0){
          const filteredCategories = cats.data.filter((dt)=> dt.wallpaper_count > 0);

          // Fetch first wallpaper for each category to use as thumbnail
          const categoriesWithThumbnails = await Promise.all(
            filteredCategories.map(async (category) => {
              if (!category.thumbnail_url) {
                try {
                  const wallpapersRes = await api.getWallpapersByCategory(category.id, { limit: 1 });
                  if (wallpapersRes?.data && wallpapersRes.data.length > 0) {
                    return {
                      ...category,
                      thumbnail_url: wallpapersRes.data[0].thumbnail_url || wallpapersRes.data[0].medium_url
                    };
                  }
                } catch (err) {
                  console.error(`Error loading thumbnail for category ${category.name}:`, err);
                }
              }
              return category;
            })
          );

          setCategories(categoriesWithThumbnails);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <Header />
      <main itemScope itemType="https://schema.org/WebPage">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white" itemScope itemType="https://schema.org/WPHeader">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6" itemProp="headline">
                Free 4K Wallpapers & HD Backgrounds
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                Download stunning high-resolution wallpapers for your desktop and mobile devices.
                New wallpapers added daily.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/categories"
                  className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors  border-2 border-white/30 shadow-lg hover:shadow-xl"
                >
                  Browse Categories
                </Link>
                <Link
                  href="/search"
                  className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-color border-2 border-white/30 shadow-lg hover:shadow-xl"
                >
                  Search Wallpapers
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Wallpapers */}
        {(loading || featuredWallpapers.length > 0) && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Featured Wallpapers</h2>
              <Link
                href="/search?featured=1"
                className="group relative inline-flex items-center px-6 py-2.5 text-purple-600 hover:text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 ease-out hover:shadow-lg"
              >
                <span className="absolute inset-0 w-0 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300 ease-out"></span>
                <span className="relative flex items-center gap-2">
                  View All
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
            {loading ? (
              <LoadingGrid count={8} />
            ) : (
              <WallpaperGrid wallpapers={featuredWallpapers} />
            )}
          </section>
        )}

        {/* Trending Wallpapers */}
        {(loading || trendingWallpapers.length > 0) && (
          <section className="bg-gray-50 py-16">
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
              <Link
                href="/search?sort=trending"
                className="group relative inline-flex items-center px-6 py-2.5 text-purple-600 hover:text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 ease-out hover:shadow-lg"
              >
                <span className="absolute inset-0 w-0 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300 ease-out"></span>
                <span className="relative flex items-center gap-2">
                  View All
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
            {loading ? (
              <LoadingGrid count={8} />
            ) : (
              <WallpaperGrid wallpapers={trendingWallpapers} />
            )}
            </div>
          </section>
        )}

        {/* Popular Categories */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Popular Categories</h2>
              <Link
                href="/categories"
                className="group relative inline-flex items-center px-6 py-2.5 text-purple-600 hover:text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 ease-out hover:shadow-lg"
              >
                <span className="absolute inset-0 w-0 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300 ease-out"></span>
                <span className="relative flex items-center gap-2">
                  View All
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-300 rounded-lg aspect-video"></div>
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">No categories available yet.</p>
            )}
          </div>
        </section>

        {/* Call to Action */}
        {/* <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Community
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Create an account to save your favorite wallpapers and get personalized recommendations.
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </section> */}
      </main>
      <Footer />
    </>
  );
}
