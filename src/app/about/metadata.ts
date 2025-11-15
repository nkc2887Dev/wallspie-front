import { Metadata } from 'next';
const baseUrl = process.env.FRONT_URL || 'https://wallspie.com'

export const metadata: Metadata = {
  title: 'About Us - WallsPie',
  description: 'Learn about WallsPie, your ultimate destination for stunning, high-quality wallpapers. Discover our mission to provide curated collections of breathtaking 4K and HD wallpapers.',
  keywords: ['about wallspie', 'wallpaper website', 'high quality wallpapers', 'free wallpapers', '4k wallpapers'],
  openGraph: {
    title: 'About WallsPie - Free 4K Wallpapers & HD Backgrounds',
    description: 'Learn about WallsPie and our mission to provide stunning high-quality wallpapers for your devices.',
    type: 'website',
    url: `${baseUrl}/about`,
  },
  alternates: {
    canonical: `${baseUrl}/about`,
  },
};
