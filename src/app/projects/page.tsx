import { Metadata } from 'next';
import ProjectsView from '@/components/projects/projects-view';

export const metadata: Metadata = {
  title: 'Projects | DeepTerrorGG - 50+ Interactive Demos',
  description: 'Explore a vast collection of interactive projects ranging from AI agents and distributed systems to retro game emulators and creative tools.',
  keywords: 'Next.js projects, React examples, AI demos, web development portfolio, interactive coding projects, open source, distributed systems',
  openGraph: {
    title: 'Projects | DeepTerrorGG',
    description: 'Explore 50+ interactive coding projects and experiments.',
    url: 'https://deepterrorgg-portfolio.web.app/projects',
    siteName: 'DeepTerrorGG Portfolio',
    images: [
      {
        url: 'https://i.imgur.com/TsFpBse.png', // Fallback, technically should be a projects collage
        width: 1200,
        height: 630,
        alt: 'DeepTerrorGG Projects',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
