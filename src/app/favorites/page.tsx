'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WallpaperGrid from '@/components/WallpaperGrid';
import { LoadingGrid } from '@/components/Loading';

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated
    if (!authLoading && !isAuthenticated) {
      // Store the current path to redirect back after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.push('/login');
      return;
    }

    // Only load favorites if authenticated and not loading
    if (!authLoading && isAuthenticated) {
      const loadFavorites = async () => {
        try {
          const response = await api.getFavorites();
          setFavorites(response.data || []);
        } catch (error) {
          console.error('Error loading favorites:', error);
        } finally {
          setLoading(false);
        }
      };

      loadFavorites();
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">My Favorites</h1>
            <p className="text-xl text-white/90">
              {user?.name ? `${user.name}'s ` : 'Your '}favorite wallpapers
            </p>
          </div>
        </section>

        {/* Favorites Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <LoadingGrid count={12} />
          ) : favorites.length > 0 ? (
            <>
              <div className="mb-8">
                <p className="text-gray-600">
                  {favorites.length} {favorites.length === 1 ? 'wallpaper' : 'wallpapers'} saved
                </p>
              </div>
              <WallpaperGrid wallpapers={favorites} />
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Favorites Yet</h3>
              <p className="text-gray-600 mb-6">
                Start adding wallpapers to your favorites by clicking the heart icon.
              </p>
              <a
                href="/"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Browse Wallpapers
              </a>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
