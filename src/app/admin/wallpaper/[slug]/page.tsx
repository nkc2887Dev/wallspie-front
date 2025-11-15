'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminWallpaperViewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const shouldEdit = searchParams.get('edit') === 'true';

  const [wallpaper, setWallpaper] = useState<any>(null);
  const [resolutions, setResolutions] = useState<any[]>([]);
  const [selectedResolution, setSelectedResolution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditing, setIsEditing] = useState(false);
  const [allCategories, setAllCategories] = useState<any[]>([]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    categoryIds: [] as number[],
  });

  useEffect(() => {
    const loadWallpaperData = async () => {
      try {
        setLoading(true);
        const wallpaperResponse = await api.getWallpaperBySlug(slug);
        const wallpaperData = wallpaperResponse.data;
        setWallpaper(wallpaperData);

        // Auto-enter edit mode if URL parameter is set
        if (shouldEdit) {
          setIsEditing(true);
          setEditForm({
            title: wallpaperData.title,
            description: wallpaperData.description || '',
            categoryIds: wallpaperData.categories?.map((c: any) => c.id) || [],
          });
        }

        // Load all categories for edit mode
        const categoriesResponse = await api.getCategories();
        setAllCategories(categoriesResponse.data || []);

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

        // Set default resolution based on device type
        const defaultRes = desktopResolutions.find((r: any) =>
          (r.name === '4K' || r.resolution_name === '4K')
        ) || desktopResolutions[0] || allResolutions[0];
        setSelectedResolution(defaultRes);
      } catch (error) {
        console.error('Error loading wallpaper:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWallpaperData();
  }, [slug, shouldEdit]);

  const handleDownload = async () => {
    if (!selectedResolution || !wallpaper) return;

    setDownloading(true);
    try {
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/downloads/file?wallpaperId=${wallpaper.id}&resolutionId=${selectedResolution.id}`;

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

  const startEditing = () => {
    setEditForm({
      title: wallpaper.title,
      description: wallpaper.description || '',
      categoryIds: wallpaper.categories?.map((c: any) => c.id) || [],
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleCategoryToggle = (categoryId: number) => {
    setEditForm(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  const handleSaveChanges = async () => {
    if (!wallpaper) return;

    try {
      await api.updateWallpaper(wallpaper.id, {
        title: editForm.title,
        description: editForm.description,
        category_ids: editForm.categoryIds,
      });

      // Update local state
      const updatedCategories = allCategories.filter(c => editForm.categoryIds.includes(c.id));
      setWallpaper({
        ...wallpaper,
        title: editForm.title,
        description: editForm.description,
        categories: updatedCategories,
      });

      setIsEditing(false);
      // alert('Wallpaper updated successfully!');
    } catch (error) {
      console.error('Error updating wallpaper:', error);
      // alert('Failed to update wallpaper');
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
      <div className="p-8">
        <div className="animate-pulse">
          <div className="bg-gray-300 rounded-lg aspect-video mb-8"></div>
          <div className="h-8 bg-gray-300 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!wallpaper) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Wallpaper Not Found</h1>
          <p className="text-gray-600 mb-6">The wallpaper you're looking for doesn't exist.</p>
          <Link
            href="/admin/wallpapers"
            className="text-purple-600 hover:text-purple-700 font-semibold whitespace-nowrap"
          >
            ← Back to Wallpapers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/admin/wallpapers"
          className="text-purple-600 hover:text-purple-700 font-semibold flex items-center whitespace-nowrap"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Wallpapers
        </Link>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveChanges}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center text-sm sm:text-base whitespace-nowrap"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
              <button
                onClick={cancelEditing}
                className="border-2 border-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all text-sm sm:text-base whitespace-nowrap"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={startEditing}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center text-sm sm:text-base whitespace-nowrap"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Wallpaper
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Main Image */}
        <div className="lg:col-span-2 order-1 lg:order-1">
          {/* Edit Mode Warning */}
          {isEditing && (
            <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-yellow-800">
                    Image cannot be edited
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    To change the image, delete this wallpaper and upload a new one.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Image Display - Smaller on mobile */}
          <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-video mb-4 sm:mb-6 max-h-48 sm:max-h-none">
            <Image
              src={wallpaper.medium_url || wallpaper.thumbnail_url || wallpaper.full_url}
              alt={wallpaper.title}
              fill
              quality={100}
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
              priority
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
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
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Categories {isEditing && <span className="text-purple-600">(Click to toggle)</span>}
            </h3>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {allCategories.map((category: any) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      editForm.categoryIds.includes(category.id)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {wallpaper.categories && wallpaper.categories.length > 0 ? (
                  wallpaper.categories.map((category: any) => (
                    <span
                      key={category.id}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {category.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No categories assigned</span>
                )}
              </div>
            )}
          </div>

          {/* Wallpaper Details */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Wallpaper Details</h3>
            <dl className="grid grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{wallpaper.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="mt-1 text-sm text-gray-900">{wallpaper.slug}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(wallpaper.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(wallpaper.updated_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 order-2 lg:order-2">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:sticky lg:top-4">
            {/* Title - Editable */}
            {isEditing ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-bold text-xl"
                  required
                />
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{wallpaper.title}</h1>
            )}

            {/* Description - Editable */}
            {isEditing ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  placeholder="Optional description..."
                />
              </div>
            ) : (
              wallpaper.description && (
                <p className="text-gray-600 mb-6">{wallpaper.description}</p>
              )
            )}

            {/* Show Device Type, Resolutions and Download only in View mode */}
            {!isEditing && (
              <>
                {/* Device Type Selector */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Device Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setDeviceType('desktop');
                        if (desktopResolutions.length > 0) {
                          setSelectedResolution(desktopResolutions[0]);
                        }
                      }}
                      className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 font-semibold transition whitespace-nowrap ${
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
                        if (mobileResolutions.length > 0) {
                          setSelectedResolution(mobileResolutions[0]);
                        }
                      }}
                      className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 font-semibold transition whitespace-nowrap ${
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
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {downloading ? 'Downloading...' : 'Download Wallpaper'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
