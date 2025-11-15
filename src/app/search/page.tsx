'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WallpaperGrid from '@/components/WallpaperGrid';
import { LoadingGrid } from '@/components/Loading';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const featured = searchParams.get('featured') === '1';
  const sortBy = searchParams.get('sort');

  const [query, setQuery] = useState(initialQuery);
  const [wallpapers, setWallpapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [viewMode, setViewMode] = useState<'search' | 'featured' | 'trending'>('search');

  useEffect(() => {
    if (featured) {
      setViewMode('featured');
      loadFeaturedWallpapers(1);
    } else if (sortBy === 'trending') {
      setViewMode('trending');
      loadTrendingWallpapers(1);
    } else if (initialQuery) {
      setViewMode('search');
      performSearch(initialQuery, 1);
    }
  }, [initialQuery, featured, sortBy]);

  const loadFeaturedWallpapers = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const response = await api.getWallpapers({ featured: true, page: pageNum, limit: 12 });

      if (pageNum === 1) {
        setWallpapers(response.data || []);
      } else {
        setWallpapers([...wallpapers, ...(response.data || [])]);
      }

      setTotalResults(response.pagination?.total || 0);
      setHasMore((response.pagination?.page || 0) < (response.pagination?.totalPages || 0));
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading featured wallpapers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingWallpapers = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      // For trending, we'll use the trending endpoint but handle pagination manually
      const limit = 12;
      const response = await api.getTrendingWallpapers(limit * pageNum);

      const allWallpapers = response.data || [];
      const startIndex = (pageNum - 1) * limit;
      const pageWallpapers = allWallpapers.slice(startIndex, startIndex + limit);

      if (pageNum === 1) {
        setWallpapers(pageWallpapers);
      } else {
        setWallpapers([...wallpapers, ...pageWallpapers]);
      }

      setTotalResults(allWallpapers.length);
      setHasMore(allWallpapers.length > (pageNum * limit));
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading trending wallpapers:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (searchQuery: string, pageNum: number = 1) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await api.searchWallpapers(searchQuery, pageNum, 12);

      if (pageNum === 1) {
        setWallpapers(response.data || []);
      } else {
        setWallpapers([...wallpapers, ...(response.data || [])]);
      }

      setTotalResults(response.pagination?.total || 0);
      setHasMore((response.pagination?.page || 0) < (response.pagination?.totalPages || 0));
      setPage(pageNum);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query, 1);
      // Update URL without page reload
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(query)}`);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      if (viewMode === 'featured') {
        loadFeaturedWallpapers(page + 1);
      } else if (viewMode === 'trending') {
        loadTrendingWallpapers(page + 1);
      } else {
        performSearch(query, page + 1);
      }
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Search Section */}
        <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-8 sm:py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-center">
              {viewMode === 'featured' ? 'Featured Wallpapers' :
               viewMode === 'trending' ? 'Trending Wallpapers' :
               'Search Wallpapers'}
            </h1>
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for wallpapers..."
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-gray-900 text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <button
                  type="submit"
                  className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-100 transition-color border-2 border-white/30 shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Results Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {(initialQuery || viewMode === 'featured' || viewMode === 'trending') && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {loading && page === 1 ? 'Loading...' :
                 viewMode === 'featured' ? 'All Featured Wallpapers' :
                 viewMode === 'trending' ? 'All Trending Wallpapers' :
                 `Search Results for "${initialQuery}"`}
              </h2>
              {!loading && totalResults > 0 && (
                <p className="text-sm sm:text-base text-gray-600">
                  {viewMode === 'featured' || viewMode === 'trending' ?
                    `Showing ${wallpapers.length} of ${totalResults} wallpapers` :
                    `Found ${totalResults} ${totalResults === 1 ? 'wallpaper' : 'wallpapers'}`
                  }
                </p>
              )}
            </div>
          )}

          {loading && page === 1 ? (
            <LoadingGrid count={12} />
          ) : wallpapers.length > 0 ? (
            <>
              <WallpaperGrid wallpapers={wallpapers} />

              {hasMore && (
                <div className="mt-8 sm:mt-12 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm sm:text-base"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          ) : (initialQuery || viewMode !== 'search') ? (
            <div className="text-center py-12 sm:py-16">
              <svg
                className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {viewMode === 'search' ? 'No Results Found' : 'No Wallpapers Available'}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">
                {viewMode === 'search' ? 'Try different keywords or browse our categories.' : 'Check back later for new wallpapers.'}
              </p>
            </div>
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Searching</h3>
              <p className="text-gray-600">Enter keywords above to find your perfect wallpaper.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 h-48"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <LoadingGrid count={12} />
          </div>
        </main>
        <Footer />
      </>
    }>
      <SearchContent />
    </Suspense>
  );
}
