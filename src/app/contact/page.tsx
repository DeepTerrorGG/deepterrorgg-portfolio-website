import { Metadata } from 'next';
import ContactView from '@/components/contact/contact-view';

export const metadata: Metadata = {
  title: 'Contact | DeepTerrorGG',
  description: 'Get in touch with DeepTerrorGG. Connect for collaborations, project discussions, or just to say hello.',
  keywords: 'contact, email, hire, developer, portfolio, social media',
  openGraph: {
    title: 'Contact DeepTerrorGG',
    description: 'Get in touch. I am always open to discussing new projects and creative ideas.',
    url: 'https://deepterrorgg-portfolio.web.app/contact',
    siteName: 'DeepTerrorGG Portfolio',
    images: [
      {
        url: 'https://i.imgur.com/TsFpBse.png',
        width: 128,
        height: 128,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactView />;
}
