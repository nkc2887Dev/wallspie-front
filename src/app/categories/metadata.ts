import { Metadata } from 'next';
const baseUrl = process.env.FRONT_URL || 'https://wallspie.com'

export const metadata: Metadata = {
  title: 'Browse Categories - WallsPie',
  description: 'Browse through various wallpaper categories including nature, abstract, architecture, minimalist, and more. Find the perfect 4K or HD wallpaper for your device.',
  keywords: ['wallpaper categories', 'nature wallpapers', 'abstract wallpapers', 'architecture wallpapers', 'minimalist wallpapers', '4k wallpapers by category'],
  openGraph: {
    title: 'Browse Wallpaper Categories - WallsPie',
    description: 'Explore our curated collection of wallpaper categories from nature to abstract.',
    type: 'website',
    url: `${baseUrl}/categories`,
  },
  alternates: {
    canonical: `${baseUrl}/categories`,
  },
};
