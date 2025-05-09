// src/app/artworks/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PageTitle from '@/components/ui/page-title';
import SectionContainer from '@/components/ui/section-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Maximize, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Artwork {
  id: string;
  title: string;
  src: string;
  alt: string;
  description: string;
  hint: string;
  width?: number;
  height?: number;
}

const artworksData: Artwork[] = [
  {
    id: '1',
    title: 'SteamArtworkV1',
    src: 'https://imgur.com/59eMcEy.png',
    alt: 'Steam Artwork V1',
    description: 'A digital artwork, version 1, showcasing dynamic compositions and vibrant colors.',
    hint: 'abstract gaming',
    width: 504,
    height: 944,
  },
  {
    id: '2',
    title: 'SteamArtworkV2',
    src: 'https://picsum.photos/seed/steamartwork2/504/944',
    alt: 'Steam Artwork V2',
    description: 'A digital artwork, version 2, exploring futuristic themes with intricate details.',
    hint: 'sci-fi digital',
    width: 504,
    height: 944,
  },
  {
    id: '3',
    title: 'SteamArtworkV3',
    src: 'https://picsum.photos/seed/steamartwork3/504/944',
    alt: 'Steam Artwork V3',
    description: 'A digital artwork, version 3, with a focus on atmospheric lighting and character design.',
    hint: 'fantasy character',
    width: 504,
    height: 944,
  },
  {
    id: '4',
    title: 'SteamArtworkV4',
    src: 'https://picsum.photos/seed/steamartwork4/504/944',
    alt: 'Steam Artwork V4',
    description: 'A digital artwork, version 4, featuring bold abstract patterns and textures.',
    hint: 'abstract texture',
    width: 504,
    height: 944,
  },
  {
    id: '5',
    title: 'SteamArtworkV5',
    src: 'https://picsum.photos/seed/steamartwork5/504/944',
    alt: 'Steam Artwork V5',
    description: 'A digital artwork, version 5, blending surreal elements with a cyberpunk aesthetic.',
    hint: 'surreal cyberpunk',
    width: 504,
    height: 944,
  },
  {
    id: '6',
    title: 'SteamArtworkV6',
    src: 'https://picsum.photos/seed/steamartwork6/504/944',
    alt: 'Steam Artwork V6',
    description: 'A digital artwork, version 6, capturing a serene landscape with a touch of mystery.',
    hint: 'landscape mystery',
    width: 504,
    height: 944,
  },
];


export default function ArtworksPage() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SectionContainer>
      <PageTitle subtitle="A curated collection of my digital creations. Click on an artwork to view it in detail.">
        My Artworks
      </PageTitle>

      {isLoading ? (
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
          <Card className="overflow-hidden bg-card border-border">
            <Skeleton className="w-full aspect-[9/16]" /> {/* Portrait skeleton */}
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2 mx-auto" />
              <Skeleton className="h-4 w-full mb-1 mx-auto" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto"
        >
          <CarouselContent>
            {artworksData.map((artwork) => (
              <CarouselItem key={artwork.id} className="md:basis-1/1 lg:basis-1/1">
                <div className="p-1">
                  <Card
                    className="overflow-hidden bg-card border-border hover:shadow-xl hover:border-primary transition-all duration-300 ease-in-out group cursor-pointer"
                    onClick={() => setSelectedArtwork(artwork)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedArtwork(artwork)}
                    aria-label={`View details for ${artwork.title}`}
                  >
                    <CardContent className="p-0 relative flex flex-col items-center justify-center">
                      <div className="aspect-[9/16] w-full relative">
                        <Image
                          src={artwork.src}
                          alt={artwork.alt}
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-500 ease-in-out rounded-t-lg"
                          data-ai-hint={artwork.hint}
                          unoptimized={artwork.src.includes('imgur.com')}
                          priority={['1', '2'].includes(artwork.id)} // Prioritize first few images
                          onError={(e) => console.error(`Failed to load image: ${artwork.src}`, e)}
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 translate-y-2 group-hover:translate-y-0"
                                aria-hidden="true"
                            >
                                <Maximize className="mr-2 h-4 w-4" /> View
                            </Button>
                        </div>
                      </div>
                    </CardContent>
                     <CardHeader className="p-4 w-full">
                      <CardTitle className="text-xl font-semibold text-foreground text-center mb-1">{artwork.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2 text-center">{artwork.description}</p>
                    </CardHeader>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 fill-primary hidden sm:flex" />
          <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 fill-primary hidden sm:flex" />
        </Carousel>
      )}

      {selectedArtwork && (
        <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
          <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl p-0 bg-card border-border shadow-2xl rounded-lg max-h-[90vh] flex flex-col">
            <DialogHeader className="p-4 pr-14 relative border-b border-border">
              <DialogTitle className="text-2xl text-foreground">{selectedArtwork.title}</DialogTitle>
               <DialogClose asChild>
                <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </DialogHeader>
            <div className="p-1 md:p-2 bg-background/50 flex-grow overflow-y-auto flex items-center justify-center">
              <Image
                src={selectedArtwork.src}
                alt={selectedArtwork.alt}
                width={selectedArtwork.width || 800} // Use a larger base for modal
                height={selectedArtwork.height || 1200}
                className="w-auto h-auto max-w-full max-h-[calc(90vh-150px)] object-contain rounded"
                data-ai-hint={selectedArtwork.hint}
                unoptimized={selectedArtwork.src.includes('imgur.com')}
                onError={(e) => console.error(`Modal failed to load image: ${selectedArtwork.src}`, e)}
              />
            </div>
            <p className="p-4 text-sm text-muted-foreground border-t border-border">{selectedArtwork.description}</p>
          </DialogContent>
        </Dialog>
      )}
    </SectionContainer>
  );
}
