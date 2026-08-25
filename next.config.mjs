/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', '@prisma/adapter-better-sqlite3'],
  },
  swcMinify: true,
  compress: true, // Gzip / Brotli compression for sub-100KB page transfers
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1-year edge caching
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Static assets, fonts, and images: 1-year immutable caching
        source: '/:path*(.png|.jpg|.jpeg|.webp|.svg|.woff2|.woff|.ttf|.ico|.css|.js)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Public pages edge caching (15ms instant delivery)
        source: '/((?!api|portal|admin|teacher).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*(.db|.sqlite|.sqlite3|.env|.env.local|.env.production|.sql|.bak|.log)',
        destination: '/404',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
