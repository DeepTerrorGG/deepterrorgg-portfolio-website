import { Metadata } from 'next';
import HomeView from '@/components/home/home-view';

export const metadata: Metadata = {
  title: 'DeepTerrorGG | AI & Fullstack Engineer',
  description: 'AI/Fullstack Engineer exploring the intersection of code, emotion, and imagination. Builder of distributed systems and interactive web experiences.',
  keywords: 'DeepTerrorGG, portfolio, digital art, web development, C#, game server, bot development, AI, Genkit, Next.js, React',
  openGraph: {
    title: 'DeepTerrorGG | AI & Fullstack Engineer',
    description: 'Exploring the intersection of code, emotion, and imagination.',
    url: 'https://deepterrorgg-portfolio.web.app',
    siteName: 'DeepTerrorGG Portfolio',
    images: [
      {
        url: 'https://i.imgur.com/TsFpBse.png', // Avatar URL as fallback OG image
        width: 128,
        height: 128,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function HomePage() {
  return <HomeView />;
}
