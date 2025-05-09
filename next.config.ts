
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
        hostname: 'i.imgur.com', // Ensure this is present for direct image links
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com', // For gallery links, though direct links are preferred for next/image
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
