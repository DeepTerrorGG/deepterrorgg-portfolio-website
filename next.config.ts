
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
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
      bodySizeLimit: '250mb',
    },
  },
  serverExternalPackages: ['shiki', '@vercel/og'],
  env: {
    // --- SERVER-SIDE ONLY ---
    COINBASE_API_KEY: process.env.COINBASE_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    DESIGNATED_RECIPIENT_EMAIL: process.env.DESIGNATED_RECIPIENT_EMAIL,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    // --- PUBLIC (client-side available) ---
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_OPENWEATHERMAP_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
        config.externals.push('react-native-fetch-blob');
    }

    return config;
  },
  turbopack: {},
  // Adding a comment to invalidate the cache
};

export default nextConfig;
