import type { Metadata, Viewport } from 'next' // ✅ Added Viewport
import { Inter, Roboto_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const robotoMono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  metadataBase: new URL('https://bonapay.vercel.app'), 
  
  // Basic metadata
  title: {
    default: 'BonaPay - Modern Digital Banking in Nigeria',
    template: '%s | BonaPay'
  },
  description: 'Experience the future of banking with BonaPay. Send money, pay bills, buy airtime, create virtual cards, and manage your finances effortlessly. Trusted by 100,000+ Nigerians.',
  
  // Keywords for SEO
  keywords: [
    'BonaPay',
    'digital banking',
    'online banking Nigeria',
    'send money Nigeria',
    'pay bills online',
    'virtual cards',
    'savings account',
    'fintech Nigeria',
    'mobile banking',
    'banking app'
  ],
  
  // Author and publisher
  authors: [{ name: 'BonaPay Digital Services Limited', url: 'https://bonapay.vercel.app' }],
  creator: 'BonaPay Digital Services Limited',
  publisher: 'BonaPay Digital Services Limited',
  
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    title: 'BonaPay - Modern Digital Banking in Nigeria',
    description: 'Send money, pay bills, and manage your finances with zero stress. Join 100,000+ Nigerians using BonaPay.',
    url: 'https://bonapay.vercel.app',
    siteName: 'BonaPay',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BonaPay - Digital Banking App',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'BonaPay - Modern Digital Banking in Nigeria',
    description: 'Send money, pay bills, and manage your finances with zero stress.',
    images: ['/twitter-image.png'],
    creator: '@bonapay',
    site: '@bonapay',
  },
  
  // Icons (Favicon)
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  
  // PWA Manifest
  manifest: '/manifest.json',
  
  // Robots
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
  
  // Canonical URL
  alternates: {
    canonical: 'https://bonapay.vercel.app',
  },
  
  // App info
  applicationName: 'BonaPay',
  appleWebApp: {
    capable: true,
    title: 'BonaPay',
    statusBarStyle: 'black-translucent',
  },
  
  
  // Category
  category: 'finance',
  
  // Other
  formatDetection: {
    email: false,
    address: false,
    telephone: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#2563EB',
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-NG" suppressHydrationWarning className={`${inter.variable} ${robotoMono.variable}`}>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        
        {/* Structured Data / JSON-LD for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FinancialService',
              name: 'BonaPay',
              url: 'https://bonapay.vercel.app',
              logo: 'https://bonapay.vercel.app/icon-512.png',
              description: 'Digital banking platform for Nigerians - send money, pay bills, create virtual cards, and save money.',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Abuja',
                addressRegion: 'FCT',
                addressCountry: 'NG',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+234-800-BONAPAY',
                contactType: 'customer service',
                availableLanguage: ['English'],
              },
              sameAs: [
                'https://facebook.com/bonapay',
                'https://twitter.com/bonapay',
                'https://instagram.com/bonapay',
                'https://linkedin.com/company/bonapay',
              ],
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '15234',
                bestRating: '5',
                worstRating: '1',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}