'use client';

import { useEffect } from 'react';

interface AdUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function AdUnit({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style,
  className = ''
}: AdUnitProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || 'ca-pub-0000000000000000'}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}

// Pre-configured ad components for common placements

export function InFeedAd({ adSlot }: { adSlot: string }) {
  return (
    <AdUnit
      adSlot={adSlot}
      adFormat="auto"
      className="my-8"
    />
  );
}

export function SidebarAd({ adSlot }: { adSlot: string }) {
  return (
    <AdUnit
      adSlot={adSlot}
      adFormat="vertical"
      className="sticky top-20"
      style={{ minHeight: '600px' }}
    />
  );
}

export function BannerAd({ adSlot }: { adSlot: string }) {
  return (
    <AdUnit
      adSlot={adSlot}
      adFormat="horizontal"
      className="my-4"
      style={{ minHeight: '90px' }}
    />
  );
}

export function ArticleAd({ adSlot }: { adSlot: string }) {
  return (
    <AdUnit
      adSlot={adSlot}
      adFormat="rectangle"
      className="my-6 mx-auto max-w-md"
      fullWidthResponsive={false}
      style={{ minHeight: '250px', width: '300px' }}
    />
  );
}
