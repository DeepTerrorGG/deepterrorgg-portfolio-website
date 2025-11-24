
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firestuff.storage.googleapis.com',
        port: '',
        pathname: '/user/studio_content/images/images/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com', 
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.thum.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/images.boardgameatlas.com/**',
      },
    ],
  },
   experimental: {
    serverActions: {
      bodySizeLimit: '4.5mb',
    },
  },
  serverExternalPackages: ['shiki', '@vercel/og'],
  env: {
    NEXT_PUBLIC_OPENWEATHERMAP_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  webpack: (config, { isServer }) => {
    // This is the correct way to handle this.
    // It tells webpack to treat the problematic module as an external dependency
    // that shouldn't be bundled.
    if (!isServer) {
        config.externals['react-native-fetch-blob'] = 'react-native-fetch-blob';
    }

    return config;
  },
};

export default nextConfig;
