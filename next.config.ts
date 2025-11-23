
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
      serverActions: {
        bodySizeLimit: '20mb',
      }
    },
  },
  env: {
    NEXT_PUBLIC_OPENWEATHERMAP_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY,
  }
};

export default nextConfig;
