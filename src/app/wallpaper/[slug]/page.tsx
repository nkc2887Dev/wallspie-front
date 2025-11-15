'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WallpaperGrid from '@/components/WallpaperGrid';
import Head from './head';

export default function WallpaperDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuth();

  const [wallpaper, setWallpaper] = useState<any>(null);
  const [resolutions, setResolutions] = useState<any[]>([]);
  const [relatedWallpapers, setRelatedWallpapers] = useState<any[]>([]);
  const [selectedResolution, setSelectedResolution] = useState<any>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    const loadWallpaperData = async () => {
      try {
        setLoading(true);
        const wallpaperResponse = await api.getWallpaperBySlug(slug);
        const wallpaperData = wallpaperResponse.data;
        setWallpaper(wallpaperData);

        // Use resolutions from wallpaper data if available, otherwise fetch separately
        let allResolutions = wallpaperData?.resolutions || [];

        // If no resolutions in main response, fetch them separately
        if (allResolutions.length === 0) {
          try {
            const resolutionsResponse = await api.getWallpaperResolutions(wallpaperData.id);
            allResolutions = resolutionsResponse.data || [];
          } catch (error) {
            console.error('Error fetching resolutions:', error);
          }
        }

        setResolutions(allResolutions);

        // Categorize resolutions
        const desktopResolutions = allResolutions.filter((r: any) =>
          r.width >= r.height || r.width >= 1920
        );
        const mobileResolutions = allResolutions.filter((r: any) =>
          r.height > r.width && r.width < 1920
        );

        // Set default resolution based on device type
        const defaultRes = desktopResolutions.find((r: any) =>
          (r.name === '4K' || r.resolution_name === '4K')
        ) || desktopResolutions[0] || allResolutions[0];
        setSelectedResolution(defaultRes);

        // Load related wallpapers from same categories
        if (wallpaperResponse.data.categories?.length > 0) {
          const relatedResponse = await api.getWallpapersByCategory(
            wallpaperResponse.data.categories[0].id,
            { limit: 8 }
          );
          const filtered = relatedResponse.data?.filter(
            (w: any) => w.id !== wallpaperResponse.data.id
          );
          setRelatedWallpapers(filtered || []);
        }

        // Check if favorited
        if (isAuthenticated) {
          try {
            const favResponse = await api.checkFavorite(wallpaperResponse.data.id);
            setIsFavorited(favResponse.data?.isFavorited || false);
          } catch (error) {
            // User might not be authenticated
          }
        }
      } catch (error) {
        console.error('Error loading wallpaper:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWallpaperData();
  }, [slug, isAuthenticated]);

  const handleDownload = async () => {
    if (!selectedResolution || !wallpaper) return;

    setDownloading(true);
    try {
      // Use the server's download endpoint that handles CORS and forces download
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/downloads/file?wallpaperId=${wallpaper.id}&resolutionId=${selectedResolution.id}`;

      // Trigger browser download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated || !wallpaper) return;

    try {
      if (isFavorited) {
        await api.removeFavorite(wallpaper.id);
        setIsFavorited(false);
      } else {
        await api.addFavorite(wallpaper.id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Favorite error:', error);
    }
  };

  // Categorize resolutions by device type
  const desktopResolutions = resolutions.filter((r: any) =>
    r.width >= r.height || r.width >= 1920
  );
  const mobileResolutions = resolutions.filter((r: any) =>
    r.height > r.width && r.width < 1920
  );

  // Get filtered resolutions based on selected device type
  const filteredResolutions = deviceType === 'desktop' ? desktopResolutions : mobileResolutions;

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="bg-gray-300 rounded-lg aspect-video mb-8"></div>
              <div className="h-8 bg-gray-300 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!wallpaper) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Wallpaper Not Found</h1>
            <p className="text-gray-600">The wallpaper you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head />
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Image */}
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-video mb-6">
                <Image
                  src={wallpaper.full_url || wallpaper.medium_url || wallpaper.thumbnail_url}
                  alt={wallpaper.title}
                  fill
                  quality={100}
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {wallpaper.view_count} views
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {wallpaper.download_count} downloads
                </div>
              </div>

              {/* Categories */}
              {wallpaper.categories && wallpaper.categories.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {wallpaper.categories.map((category: any) => (
                      <a
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition"
                      >
                        {category.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{wallpaper.title}</h1>

                {wallpaper.description && (
                  <p className="text-gray-600 mb-6">{wallpaper.description}</p>
                )}

                {/* Device Type Selector */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Device Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setDeviceType('desktop');
                        // Auto-select first desktop resolution
                        if (desktopResolutions.length > 0) {
                          setSelectedResolution(desktopResolutions[0]);
                        }
                      }}
                      className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 font-semibold transition ${
                        deviceType === 'desktop'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Desktop
                    </button>
                    <button
                      onClick={() => {
                        setDeviceType('mobile');
                        // Auto-select first mobile resolution
                        if (mobileResolutions.length > 0) {
                          setSelectedResolution(mobileResolutions[0]);
                        }
                      }}
                      className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 font-semibold transition ${
                        deviceType === 'mobile'
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Mobile
                    </button>
                  </div>
                </div>

                {/* Resolution Selector */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Select Resolution
                    <span className="text-xs font-normal text-gray-500 ml-2">
                      ({filteredResolutions.length} available)
                    </span>
                  </h3>
                  {filteredResolutions.length > 0 ? (
                    <div className="space-y-2 max-h-[40vh] sm:max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredResolutions.map((resolution) => (
                        <button
                          key={resolution.id}
                          onClick={() => setSelectedResolution(resolution)}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                            selectedResolution?.id === resolution.id
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-semibold">{resolution.name || resolution.resolution_name}</span>
                            <span className="text-sm text-gray-500">
                              {resolution.width}x{resolution.height}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              {(resolution.file_size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <span className="text-xs text-purple-600 font-medium">
                              {resolution.width >= 3840 ? '4K' :
                               resolution.width >= 2560 ? 'QHD' :
                               resolution.width >= 1920 ? 'Full HD' : 'HD'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium mb-1">No {deviceType} resolutions available</p>
                      <p className="text-xs text-gray-500">
                        Try switching to {deviceType === 'desktop' ? 'mobile' : 'desktop'} view
                      </p>
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={downloading || !selectedResolution}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {downloading ? 'Downloading...' : 'Download Wallpaper'}
                </button>

                {/* Favorite Button */}
                {isAuthenticated && (
                  <button
                    onClick={handleFavorite}
                    className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                      isFavorited
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" fill={isFavorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Related Wallpapers */}
          {relatedWallpapers.length > 0 && (
            <section className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Wallpapers</h2>
              <WallpaperGrid wallpapers={relatedWallpapers} />
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
