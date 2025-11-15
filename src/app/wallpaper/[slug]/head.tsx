'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function Head() {
  const params = useParams();
  const slug = params.slug as string;
  const [wallpaper, setWallpaper] = useState<any>(null);
  const baseUrl = process.env.NEXT_PUBLIC_FRONT_URL || 'https://wallspie.com';

  useEffect(() => {
    const loadWallpaper = async () => {
      try {
        const response = await api.getWallpaperBySlug(slug);
        setWallpaper(response.data);
      } catch (error) {
        console.error('Error loading wallpaper metadata:', error);
      }
    };

    loadWallpaper();
  }, [slug]);

  useEffect(() => {
    if (wallpaper) {
      // Update document title
      document.title = `${wallpaper.title} - Free 4K Wallpaper | WallsPie`;

      // Update meta tags
      const updateMetaTag = (name: string, content: string, isProperty = false) => {
        const attribute = isProperty ? 'property' : 'name';
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attribute, name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      const description = wallpaper.description
        ? `${wallpaper.description} - Download in 4K, HD, and mobile resolutions.`
        : `Download ${wallpaper.title} in 4K, HD, and mobile resolutions. Free high-quality wallpaper for desktop and mobile devices.`;

      const categories = wallpaper.categories?.map((c: any) => c.name).join(', ') || 'wallpapers';

      updateMetaTag('description', description);
      updateMetaTag('keywords', `${wallpaper.title}, 4k wallpaper, hd wallpaper, ${categories}, free wallpaper, desktop background`);

      // OpenGraph tags
      updateMetaTag('og:title', `${wallpaper.title} - Free 4K Wallpaper`, true);
      updateMetaTag('og:description', description, true);
      updateMetaTag('og:image', wallpaper.thumbnail_url || wallpaper.full_url, true);
      updateMetaTag('og:url', `${baseUrl}/wallpaper/${slug}`, true);
      updateMetaTag('og:type', 'website', true);

      // Twitter tags
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', `${wallpaper.title} - Free 4K Wallpaper`);
      updateMetaTag('twitter:description', description);
      updateMetaTag('twitter:image', wallpaper.thumbnail_url || wallpaper.full_url);

      // Add canonical link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `${baseUrl}/wallpaper/${slug}`);

      // Add JSON-LD structured data
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        name: wallpaper.title,
        description: description,
        contentUrl: wallpaper.full_url || wallpaper.thumbnail_url,
        thumbnailUrl: wallpaper.thumbnail_url,
        uploadDate: wallpaper.created_at,
        author: {
          '@type': 'Organization',
          name: 'WallsPie'
        },
        publisher: {
          '@type': 'Organization',
          name: 'WallsPie',
          url: baseUrl
        },
        interactionStatistic: [
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/ViewAction',
            userInteractionCount: wallpaper.view_count || 0
          },
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/DownloadAction',
            userInteractionCount: wallpaper.download_count || 0
          }
        ]
      };

      let script = document.querySelector('script[type="application/ld+json"][data-wallpaper]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-wallpaper', 'true');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }
  }, [wallpaper, slug, baseUrl]);

  return null;
}
