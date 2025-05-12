
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

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
  description: "Portfolio of DeepTerrorGG's artworks and projects.",
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
        {/* Preconnect to i.imgur.com for faster image loading */}
        <link rel="preconnect" href="https://i.imgur.com" crossOrigin="anonymous" />
        {/* Removed preconnect for general imgur.com */}
      </head>
      <body 
        className="antialiased bg-background text-foreground font-sans"
        suppressHydrationWarning={true} 
      >
        <Header />
        <main className="pt-20 md:pt-24 min-h-screen">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
