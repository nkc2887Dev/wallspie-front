'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WallpaperGrid from '@/components/WallpaperGrid';
import { LoadingGrid } from '@/components/Loading';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<any>(null);
  const [wallpapers, setWallpapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        const categoryResponse = await api.getCategoryBySlug(slug);

        const wallpapersResponse = await api.getWallpapersByCategory(
          categoryResponse.data.id,
          { page: 1, limit: 12 }
        );

        // Update category with actual wallpaper count from pagination
        const updatedCategory = {
          ...categoryResponse.data,
          wallpaper_count: wallpapersResponse.pagination?.total || wallpapersResponse.data?.length || 0
        };

        setCategory(updatedCategory);
        setWallpapers(wallpapersResponse.data || []);
        setHasMore(
          (wallpapersResponse.pagination?.page || 0) < (wallpapersResponse.pagination?.totalPages || 0)
        );
      } catch (error) {
        console.error('Error loading category:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [slug]);

  const loadMore = async () => {
    if (!hasMore || loadingMore || !category) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await api.getWallpapersByCategory(category.id, {
        page: nextPage,
        limit: 12,
      });

      setWallpapers([...wallpapers, ...(response.data || [])]);
      setPage(nextPage);
      setHasMore((response.pagination?.page || 0) < (response.pagination?.totalPages || 0));
    } catch (error) {
      console.error('Error loading more wallpapers:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 h-48 animate-pulse"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <LoadingGrid count={12} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!category) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600">The category you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-xl text-white/90 max-w-2xl">{category.description}</p>
            )}
            {category.wallpaper_count !== undefined && (
              <p className="mt-4 text-white/80">
                {category.wallpaper_count} {category.wallpaper_count === 1 ? 'wallpaper' : 'wallpapers'}
              </p>
            )}
          </div>
        </section>

        {/* Wallpapers Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {wallpapers.length > 0 ? (
            <>
              <WallpaperGrid wallpapers={wallpapers} />

              {hasMore && (
                <div className="mt-12 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Wallpapers Yet</h3>
              <p className="text-gray-600">This category doesn't have any wallpapers yet. Check back later!</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
