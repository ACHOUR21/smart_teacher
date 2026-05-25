import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@edu/ui', '@edu/shared-types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
}

export default nextConfig
