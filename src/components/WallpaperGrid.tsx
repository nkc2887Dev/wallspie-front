import WallpaperCard from './WallpaperCard';

interface WallpaperGridProps {
  wallpapers: any[];
}

export default function WallpaperGrid({ wallpapers }: WallpaperGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
      {wallpapers.map((wallpaper) => (
        <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} />
      ))}
    </div>
  );
}
