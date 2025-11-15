'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

export default function AdminWallpapersPage() {
  const [wallpapers, setWallpapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadWallpapers(1);
  }, []);

  const loadWallpapers = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await api.getWallpapers({ page: pageNum, limit: 20 });

      if (pageNum === 1) {
        setWallpapers(response.data || []);
      } else {
        setWallpapers([...wallpapers, ...(response.data || [])]);
      }

      setHasMore((response.pagination?.page || 0) < (response.pagination?.totalPages || 0));
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading wallpapers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (wallpaperId: number, currentStatus: number) => {
    try {
      await api.updateWallpaper(wallpaperId, { is_featured: currentStatus === 1 ? 0 : 1 });

      setWallpapers(
        wallpapers.map((w) =>
          w.id === wallpaperId ? { ...w, is_featured: currentStatus === 1 ? 0 : 1 } : w
        )
      );
    } catch (error) {
      console.error('Error updating wallpaper:', error);
    }
  };

  const deleteWallpaper = async (wallpaperId: number) => {
    if (!confirm('Are you sure you want to delete this wallpaper?')) return;

    try {
      await api.deleteWallpaper(wallpaperId);
      setWallpapers(wallpapers.filter((w) => w.id !== wallpaperId));
    } catch (error) {
      console.error('Error deleting wallpaper:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallpapers</h1>
          <p className="text-gray-600 mt-2">Manage your wallpaper collection</p>
        </div>
        <Link
          href="/admin/wallpapers/upload"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Upload Wallpaper
        </Link>
      </div>

      {loading && page === 1 ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-300 animate-pulse rounded-lg h-32"></div>
          ))}
        </div>
      ) : wallpapers.length > 0 ? (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallpaper
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wallpapers.map((wallpaper) => (
                  <tr key={wallpaper.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-24 relative">
                          <Image
                            src={wallpaper.thumbnail_url}
                            alt={wallpaper.title}
                            fill
                            quality={95}
                            className="rounded object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{wallpaper.title}</div>
                          <div className="text-sm text-gray-500">{wallpaper.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{wallpaper.download_count} downloads</div>
                      <div className="text-sm text-gray-500">{wallpaper.view_count} views</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {wallpaper.is_featured === 1 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFeatured(wallpaper.id, wallpaper.is_featured)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          {wallpaper.is_featured === 1 ? 'Unfeature' : 'Feature'}
                        </button>
                        <Link
                          href={`/wallpaper/${wallpaper.slug}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => deleteWallpaper(wallpaper.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => loadWallpapers(page + 1)}
                disabled={loading}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wallpapers Yet</h3>
          <p className="text-gray-600 mb-6">Get started by uploading your first wallpaper.</p>
          <Link
            href="/admin/wallpapers/upload"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Upload Wallpaper
          </Link>
        </div>
      )}
    </div>
  );
}
