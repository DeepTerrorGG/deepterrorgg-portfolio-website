
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/header';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase';

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
        <FirebaseClientProvider>
          <Header />
          <main className="pt-20 md:pt-24 flex-grow z-10">
            {children}
          </main>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
