import { MetadataRoute } from 'next'

// This is a basic sitemap. For a production app with dynamic content,
// you should fetch categories and wallpapers from your API and include them here.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.FRONT_URL || 'https://wallspie.com'

  // TODO: In production, fetch dynamic content from your API:
  // 1. Fetch all categories and add them with priority 0.8
  // 2. Fetch all wallpapers (or at least recent/popular ones) with priority 0.7
  //
  // Example:
  // try {
  //   const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
  //   const categories = await categoriesRes.json();
  //
  //   const categoryPages = categories.data?.map((cat: any) => ({
  //     url: `${baseUrl}/categories/${cat.slug}`,
  //     lastModified: new Date(cat.updated_at),
  //     changeFrequency: 'daily' as const,
  //     priority: 0.8,
  //   })) || [];
  //
  //   const wallpapersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallpapers?limit=1000`);
  //   const wallpapers = await wallpapersRes.json();
  //
  //   const wallpaperPages = wallpapers.data?.map((wp: any) => ({
  //     url: `${baseUrl}/wallpaper/${wp.slug}`,
  //     lastModified: new Date(wp.updated_at),
  //     changeFrequency: 'weekly' as const,
  //     priority: 0.7,
  //   })) || [];
  //
  //   return [...staticPages, ...categoryPages, ...wallpaperPages];
  // } catch (error) {
  //   console.error('Error fetching dynamic sitemap data:', error);
  // }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]
}
