'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface StatsData {
  totalWallpapers: number;
  totalDownloads: number;
  totalUsers: number;
  adminUsers: number;
  registeredUsers: number;
  guestUsers: number;
  totalCategories: number;
}

interface TrendData {
  date: string;
  downloads: number;
  views: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [popularWallpapers, setPopularWallpapers] = useState<any[]>([]);
  const [recentDownloads, setRecentDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, trendsRes, popularRes, downloadsRes] = await Promise.all([
          api.getOverallStats(),
          api.getDownloadTrend('daily', 7),
          api.getPopularWallpapers(5),
          api.getRecentDownloads({ limit: 10 }),
        ]);

        setStats(statsRes.data || null);
        setTrends(trendsRes.data || []);
        setPopularWallpapers(popularRes.data || []);
        setRecentDownloads(downloadsRes.data || []);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-300 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your wallpaper platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Wallpapers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalWallpapers || 0}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Downloads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalDownloads || 0}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 group relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-gray-400 mt-1">(Excluding owner)</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
            <div className="bg-gray-900 text-white text-sm rounded-lg py-3 px-4 shadow-lg min-w-[200px]">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Admins:</span>
                  <span className="font-semibold text-blue-400">{stats?.adminUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Registered:</span>
                  <span className="font-semibold text-green-400">{stats?.registeredUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Guests:</span>
                  <span className="font-semibold text-yellow-400">{stats?.guestUsers || 0}</span>
                </div>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-8 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalCategories || 0}</p>
            </div>
            <div className="bg-pink-100 rounded-full p-3">
              <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Download Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Download Trends (Last 7 Days)</h2>
        {trends.length > 0 ? (
          <div className="space-y-4">
            {trends.map((trend, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 text-sm text-gray-600">
                  {new Date(trend.date).toLocaleDateString()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Downloads</span>
                        <span className="text-sm text-gray-600">{trend.downloads}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min((trend.downloads / Math.max(...trends.map((t) => t.downloads))) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Views</span>
                        <span className="text-sm text-gray-600">{trend.views}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min((trend.views / Math.max(...trends.map((t) => t.views))) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No trend data available</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Wallpapers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Most Popular Wallpapers</h2>
          {popularWallpapers.length > 0 ? (
            <div className="space-y-4">
              {popularWallpapers.map((wallpaper, index) => (
                <div key={wallpaper.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 text-2xl font-bold text-gray-400 w-8">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{wallpaper.title}</p>
                    <p className="text-sm text-gray-500">
                      {wallpaper.download_count} downloads • {wallpaper.view_count} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Recent Downloads */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Downloads</h2>
          {recentDownloads.length > 0 ? (
            <div className="space-y-4">
              {recentDownloads.map((download) => (
                <div key={download.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {download.wallpaper_title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {download.resolution_name} • {download.device_type}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(download.downloaded_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent downloads</p>
          )}
        </div>
      </div>
    </div>
  );
}
