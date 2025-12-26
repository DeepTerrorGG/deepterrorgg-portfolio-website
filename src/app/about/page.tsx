import { Metadata } from 'next';
import AboutView from '@/components/about/about-view';

export const metadata: Metadata = {
  title: 'About Me | DeepTerrorGG - Systems Architect',
  description: '[ INSERT META DESCRIPTION HERE ]',
  keywords: 'DeepTerrorGG, systems architect, full stack engineer, next.js, react, firebase',
  openGraph: {
    title: 'About DeepTerrorGG',
    description: '[ INSERT OPEN GRAPH DESCRIPTION HERE ]',
    url: 'https://deepterrorgg-portfolio.web.app/about',
    siteName: 'DeepTerrorGG Portfolio',
    images: [
      {
        url: 'https://i.imgur.com/TsFpBse.png',
        width: 128,
        height: 128,
      },
    ],
    locale: 'en_US',
    type: 'profile',
  },
};

export default function AboutPage() {
  return <AboutView />;
}
