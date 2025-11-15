'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

interface WallpaperCardProps {
  wallpaper: {
    id: number;
    title: string;
    slug: string;
    thumbnail_url: string;
    medium_url?: string;
    download_count: number;
    view_count: number;
    is_featured: number;
  };
}

export default function WallpaperCard({ wallpaper }: WallpaperCardProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/wallpaper/${wallpaper.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-gray-200 aspect-[3/4]">
        <Image
          src={wallpaper.medium_url || wallpaper.thumbnail_url}
          alt={wallpaper.title}
          fill
          quality={95}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-lg line-clamp-2">
              {wallpaper.title}
            </h3>
            <div className="flex items-center justify-between mt-2 text-white/80 text-sm">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                {wallpaper.view_count}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {wallpaper.download_count}
              </span>
            </div>
          </div>
        </div>

        {wallpaper.is_featured === 1 && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
            FEATURED
          </div>
        )}

        {isAuthenticated && (
          <button
            onClick={handleFavorite}
            disabled={isLoading}
            className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
          >
            <svg
              className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              fill={isFavorited ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>
    </Link>
  );
}
