import Link from 'next/link';
import Image from 'next/image';

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    slug: string;
    thumbnail_url?: string;
    wallpaper_count?: number;
  };
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 aspect-video">
        {category.thumbnail_url ? (
          <Image
            src={category.thumbnail_url}
            alt={category.name}
            fill
            quality={95}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-xl">{category.name}</h3>
            {category.wallpaper_count !== undefined && (
              <p className="text-white/80 text-sm mt-1">
                {category.wallpaper_count} wallpapers
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
