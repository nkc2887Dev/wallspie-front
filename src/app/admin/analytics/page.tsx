'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminAnalyticsPage() {
  const [deviceStats, setDeviceStats] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [deviceRes, categoryRes, trendsRes] = await Promise.all([
        api.getDeviceStats(),
        api.getCategoryStats(),
        api.getDownloadTrend('daily', days),
      ]);

      setDeviceStats(deviceRes.data || []);
      setCategoryStats(categoryRes.data || []);
      setTrends(trendsRes.data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalDownloads = () => {
    return deviceStats.reduce((sum, stat) => sum + stat.count, 0);
  };

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Detailed insights about your platform</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Time Range:</label>
        <div className="flex space-x-2">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                days === d
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-300 animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Download Trends Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Download & View Trends (Last {days} Days)
            </h2>
            {trends.length > 0 ? (
              <div className="space-y-4">
                {trends.map((trend, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600">
                      {new Date(trend.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Downloads</span>
                            <span className="text-sm text-gray-600">{trend.downloads}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-500 h-3 rounded-full transition-all"
                              style={{
                                width: `${getPercentage(trend.downloads, Math.max(...trends.map((t) => t.downloads)))}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">Views</span>
                            <span className="text-sm text-gray-600">{trend.views}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-500 h-3 rounded-full transition-all"
                              style={{
                                width: `${getPercentage(trend.views, Math.max(...trends.map((t) => t.views)))}%`,
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
            {/* Device Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Downloads by Device</h2>
              {deviceStats.length > 0 ? (
                <div className="space-y-4">
                  {deviceStats.map((stat) => (
                    <div key={stat.device_type}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            {stat.device_type === 'desktop' && (
                              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {stat.device_type === 'mobile' && (
                              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {stat.device_type === 'tablet' && (
                              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm4 14a1 1 0 100-2 1 1 0 000 2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {stat.device_type}
                            </p>
                            <p className="text-sm text-gray-500">{stat.count || 0} downloads</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {stat.percentage || getPercentage(stat.count, getTotalDownloads())}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${stat.percentage || getPercentage(stat.count, getTotalDownloads())}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No device data available</p>
              )}
            </div>

            {/* Category Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Top Categories</h2>
              {categoryStats.length > 0 ? (
                <div className="space-y-4">
                  {categoryStats.slice(0, 8).map((stat, index) => (
                    <div key={stat.category_id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-pink-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{stat.category_name}</p>
                            <p className="text-sm text-gray-500">{stat.total_downloads || 0} downloads</p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-pink-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${getPercentage(stat.total_downloads, categoryStats[0]?.total_downloads || 1)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No category data available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
