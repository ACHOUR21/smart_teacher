import type { NextConfig } from 'next';

const isStaticBuild = process.env.BUILD_TARGET === 'static';

const nextConfig: NextConfig = {
  transpilePackages: ['@edu/ui', '@edu/shared-types'],

  // Static export for Capacitor/mobile APK builds (BUILD_TARGET=static).
  // Keep server rendering for web deploys (default).
  ...(isStaticBuild && {
    output: 'export',
    trailingSlash: true,
  }),

  // Strict mode catches hydration issues early
  reactStrictMode: true,

  // Image optimisation: use remote patterns for web, unoptimized for static APK builds
  images: isStaticBuild
    ? { unoptimized: true }
    : {
        remotePatterns: [
          { protocol: 'https', hostname: '**.unsplash.com' },
          { protocol: 'https', hostname: '**.cloudinary.com' },
          { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
        ],
        formats: ['image/avif', 'image/webp'],
      },

  // Turbopack for faster dev builds (Next.js 15 default)
  experimental: {
    turbo: {},
    // Optimise React imports
    optimizePackageImports: [
      'framer-motion',
      'recharts',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
    ],
  },

  // Security headers and redirects — not supported in static export mode
  ...(!isStaticBuild && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()',
            },
          ],
        },
      ];
    },
    async redirects() {
      return [
        {
          source: '/dashboard',
          destination: '/student',
          permanent: false,
        },
      ];
    },
  }),
};

export default nextConfig;
