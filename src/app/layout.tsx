import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import GoogleAdsense from "@/components/GoogleAdsense";
import CookieConsent from "@/components/CookieConsent";
const baseUrl = process.env.FRONT_URL || 'https://wallspie.com'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "WallsPie - Free 4K Wallpapers & HD Backgrounds | Download High Quality Images",
    template: "%s | WallsPie"
  },
  description: "Download free 4K, HD, and mobile wallpapers. Browse thousands of high-quality images across 20+ categories including nature, abstract, space, anime, and more. No login required. Daily updates.",
  keywords: [
    "wallpapers",
    "4k wallpapers",
    "hd wallpapers",
    "free wallpapers",
    "backgrounds",
    "desktop wallpapers",
    "mobile wallpapers",
    "high resolution wallpapers",
    "nature wallpapers",
    "abstract wallpapers",
    "space wallpapers",
    "anime wallpapers",
    "minimalist wallpapers",
    "ultra hd wallpapers",
    "1920x1080 wallpapers",
    "3840x2160 wallpapers"
  ],
  authors: [{ name: "WallsPie Team" }],
  creator: "WallsPie",
  publisher: "WallsPie",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/logo-icon.svg', color: '#9333ea' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "WallsPie - Free 4K Wallpapers & HD Backgrounds",
    description: "Download free 4K, HD, and mobile wallpapers. Browse thousands of high-quality images across 20+ categories.",
    siteName: "WallsPie",
    images: [
      {
        url: `${baseUrl}/logo.svg`,
        width: 1200,
        height: 630,
        alt: "WallsPie - Free 4K Wallpapers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WallsPie - Free 4K Wallpapers & HD Backgrounds",
    description: "Download free 4K, HD, and mobile wallpapers. Browse thousands of high-quality images.",
    images: [`${baseUrl}/logo.svg`],
    creator: "@wallspie",
    site: "@wallspie",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    google: 'your-google-verification-code',
    // Add other verification codes as needed
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WallsPie',
    description: 'Download free 4K, HD, and mobile wallpapers. Browse thousands of high-quality images across 20+ categories.',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'WallsPie',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.svg`
      }
    }
  };

  const jsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WallsPie',
    url: baseUrl,
    logo: `${baseUrl}/logo.svg`,
    description: 'Free 4K wallpapers and HD backgrounds for desktop and mobile devices',
    sameAs: [
      'https://twitter.com/wallspie',
      'https://facebook.com/wallspie',
      'https://instagram.com/wallspie'
    ]
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <GoogleAdsense />
        <AuthProvider>
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
