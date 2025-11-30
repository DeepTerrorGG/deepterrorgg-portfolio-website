
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DeepTerrorGG Portfolio',
  description: "I'm just a simple programmer who sometimes makes art, designs, or websites just following the path feels right to my heart.",
  keywords: "DeepTerrorGG, portfolio, digital art, web development, C#, game server, bot development",
  authors: [{ name: "DeepTerrorGG" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", geistSans.variable, geistMono.variable)}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className="antialiased text-foreground font-sans flex flex-col min-h-screen"
        suppressHydrationWarning={true}
      >
        <Providers>
          <Header />
          <main className="flex-grow flex flex-col z-0 pt-24 md:pt-28">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
