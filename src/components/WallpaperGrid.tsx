import WallpaperCard from './WallpaperCard';

interface WallpaperGridProps {
  wallpapers: any[];
}

export default function WallpaperGrid({ wallpapers }: WallpaperGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {wallpapers.map((wallpaper) => (
        <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} />
      ))}
    </div>
  );
}
