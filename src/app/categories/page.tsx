'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.getCategories();
        if(response?.data && response.data.length > 0){
          const filteredCategories = response.data.filter((dt)=> dt.wallpaper_count > 0);

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
        console.error('Error loading categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Categories</h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Explore our curated collection of wallpaper categories. From nature to abstract,
              find the perfect wallpaper for your device.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 rounded-lg aspect-video"></div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <>
              <div className="mb-8">
                <p className="text-gray-600">
                  Showing {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
              <p className="text-gray-600">Check back later for new categories.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
