
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code2 } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col items-center text-center min-h-[calc(100vh-80px)] justify-center">
      <div className="relative mb-8 animate-fade-in">
        <Image
          src="https://i.imgur.com/TsFpBse.png"
          alt="User avatar"
          width={160}
          height={160}
          className="rounded-full border-4 border-primary shadow-xl object-cover"
          data-ai-hint="avatar illustration"
          priority
          crossOrigin="anonymous"
        />
        <Code2 aria-hidden="true" className="absolute bottom-0 right-0 h-10 w-10 p-2 bg-primary text-primary-foreground rounded-full shadow-lg transform translate-x-1/4 translate-y-1/4 border-2 border-background" />
      </div>
      
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-6 animate-slide-up">
        Welcome to <span className="text-primary">DeepTerrorGG</span>'s Portfolio
      </h1>
      
      <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up">
        Exploring the depths of digital art and creative endeavors. Discover a collection of my unique artworks and learn more about my journey.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
        <Button asChild size="lg" className="group transition-all duration-300 ease-in-out hover:shadow-primary/50 hover:shadow-lg hover:scale-105">
          <Link href="/artworks">
            View Artworks
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="group transition-all duration-300 ease-in-out hover:border-primary hover:text-primary hover:shadow-lg hover:scale-105">
          <Link href="/about">
            About Me
          </Link>
        </Button>
      </div>
    </div>
  );
}
