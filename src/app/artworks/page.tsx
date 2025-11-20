
// src/app/artworks/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import PageTitle from '@/components/ui/page-title';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Maximize, ArrowLeft, ArrowRight, Laptop } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Fade from 'embla-carousel-fade';
import { cn } from '@/lib/utils';
import SectionContainer from '@/components/ui/section-container';

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
    src: 'https://i.imgur.com/38CbL2H.png',
    alt: 'Steam Artwork V1',
    description: 'A digital artwork, version 1, showcasing dynamic compositions and vibrant colors.',
    hint: 'abstract gaming',
    width: 600,
    height: 950,
  },
  {
    id: '2',
    title: 'SteamArtworkV2',
    src: 'https://i.imgur.com/EySXuly.png',
    alt: 'Steam Artwork V2',
    description: 'A digital artwork, version 2, exploring futuristic themes with intricate details.',
    hint: 'sci-fi digital',
    width: 600,
    height: 950,
  },
  {
    id: '3',
    title: 'SteamArtworkV3',
    src: 'https://i.imgur.com/K6mwc3I.png',
    alt: 'Steam Artwork V3',
    description: 'A digital artwork, version 3, with a focus on atmospheric lighting and character design.',
    hint: 'fantasy character',
    width: 600,
    height: 950,
  },
  {
    id: '4',
    title: 'SteamArtworkV4',
    src: 'https://i.imgur.com/oe0cJwJ.png',
    alt: 'Steam Artwork V4',
    description: 'A digital artwork, version 4, featuring bold abstract patterns and textures.',
    hint: 'abstract texture',
    width: 600,
    height: 950,
  },
  {
    id: '5',
    title: 'SteamArtworkV5',
    src: 'https://i.imgur.com/NnzKUYF.png',
    alt: 'Steam Artwork V5',
    description: 'A digital artwork, version 5, blending surreal elements with a cyberpunk aesthetic.',
    hint: 'surreal cyberpunk',
    width: 600,
    height: 950,
  },
  {
    id: '6',
    title: 'SteamArtworkV6',
    src: 'https://i.imgur.com/AMSByjs.png',
    alt: 'Steam Artwork V6',
    description: 'A digital artwork, version 6, capturing a serene landscape with a touch of mystery.',
    hint: 'landscape mystery',
    width: 600,
    height: 950,
  },
  {
    id: '10',
    title: 'SteamArtworkV10',
    src: 'https://i.imgur.com/2aUSXCn.png',
    alt: 'Steam Artwork V10',
    description: 'A digital artwork, version 10, characterized by its ethereal and atmospheric quality.',
    hint: 'ethereal atmospheric',
    width: 600,
    height: 950,
  },
];


export default function ArtworksPage() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiMobile, setApiMobile] = useState<CarouselApi>();
  const [apiDesktop, setApiDesktop] = useState<CarouselApi>();
  const [activeIndexDesktop, setActiveIndexDesktop] = useState(0);

  const autoplayPluginMobile = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
  );
  const fadePluginMobile = useRef(Fade());

  useEffect(() => {
    const imageLoadPromises = artworksData.map(artwork => {
      return new Promise<void>((resolve) => {
        if (typeof window !== 'undefined') {
          const img = new window.Image();
          img.src = artwork.src;
          img.onload = () => resolve();
          img.onerror = () => {
            console.error(`Failed to load image: ${artwork.src}`);
            resolve();
          };
        } else {
          resolve();
        }
      });
    });

    Promise.all(imageLoadPromises).then(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    });
  }, []);

  useEffect(() => {
    if (!apiDesktop) {
      return;
    }
    setActiveIndexDesktop(apiDesktop.selectedScrollSnap());
    const onSelect = () => {
      setActiveIndexDesktop(apiDesktop.selectedScrollSnap());
    };

    apiDesktop.on('select', onSelect);
    return () => {
      apiDesktop.off('select', onSelect);
    };
  }, [apiDesktop]);

  const openModal = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
    if (apiMobile && autoplayPluginMobile.current && typeof autoplayPluginMobile.current.stop === 'function') {
      try {
        autoplayPluginMobile.current.stop();
      } catch (error) {
        console.error("Error stopping mobile autoplay:", error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);

    if (apiMobile && autoplayPluginMobile.current && typeof autoplayPluginMobile.current.play === 'function') {
      try {
        autoplayPluginMobile.current.play(true);
      } catch (error) {
        console.error("Error restarting mobile autoplay:", error);
      }
    }

    setTimeout(() => {
      setSelectedArtwork(null);
    }, 500);
  };

  return (
    <div className="w-full flex-grow flex flex-col">
      <PageTitle subtitle="Most of these were made for fun, but the truth is she inspired a lot of them. Her presence gave me the push to create, even this whole site. It’s a small way of turning feelings into something visible.">
        My Artworks
      </PageTitle>

      {isLoading ? (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
          <Card className="overflow-hidden bg-card border-border">
            <Skeleton className="w-full aspect-[600/950] rounded-t-lg" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2 mx-auto" />
              <Skeleton className="h-4 w-full mb-1 mx-auto" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Mobile and Tablet View: Centered Single Item Carousel */}
          <div className="lg:hidden flex-grow flex flex-col justify-center">
            <Carousel
              setApi={setApiMobile}
              opts={{
                align: "center",
                loop: true,
              }}
              plugins={[
                autoplayPluginMobile.current,
                fadePluginMobile.current
              ]}
              className="w-full group/carousel"
            >
              <div className="flex items-center justify-center py-6 gap-4 sm:gap-6 md:gap-8">
                <CarouselPrevious
                  className="!relative !static !translate-x-0 !translate-y-0 rounded-full border border-primary text-primary hover:bg-primary/10 disabled:opacity-30 h-10 w-10 sm:h-12 sm:w-12 p-0 flex items-center justify-center"
                  aria-label="Previous artwork"
                >
                  <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </CarouselPrevious>

                <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
                  <Laptop className="h-8 w-8 sm:h-10 sm:w-10 text-primary group-hover:animate-pulse" aria-hidden="true" />
                  <span className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    DeepTerrorGG
                  </span>
                </Link>

                <CarouselNext
                  className="!relative !static !translate-x-0 !translate-y-0 rounded-full border border-primary text-primary hover:bg-primary/10 disabled:opacity-30 h-10 w-10 sm:h-12 sm:w-12 p-0 flex items-center justify-center"
                  aria-label="Next artwork"
                >
                  <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </CarouselNext>
              </div>

              <CarouselContent className="-ml-1 mt-4">
                {artworksData.map((artwork) => (
                  <CarouselItem key={artwork.id + '-mobile'} className="pl-1 basis-11/12 sm:basis-4/5 md:basis-3/4">
                    <div className="p-1">
                      <Card
                        className="overflow-hidden bg-card border-border hover:shadow-primary/30 hover:border-primary transition-all duration-300 ease-in-out group cursor-pointer"
                        onClick={() => openModal(artwork)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && openModal(artwork)}
                        aria-label={`View details for ${artwork.title}`}
                      >
                        <CardContent className="p-0 relative flex flex-col items-center justify-center aspect-[600/950] bg-black">
                          <div className="relative w-full h-full">
                            <Image
                              src={artwork.src}
                              alt={artwork.alt}
                              fill
                              sizes="(max-width: 639px) 90vw, (max-width: 767px) 80vw, (max-width: 1023px) 75vw, 320px"
                              className="object-contain transition-transform duration-700 ease-in-out"
                              data-ai-hint={artwork.hint}
                              unoptimized={artwork.src.includes('imgur.com')}
                              priority={['1', '2', '3'].includes(artwork.id)}
                              onError={(e) => console.error(`Failed to load image: ${artwork.src}`, e)}
                              crossOrigin="anonymous"
                            />
                          </div>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-start p-4">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 translate-y-2 group-hover:translate-y-0"
                              aria-hidden="true"
                            >
                              <Maximize className="mr-2 h-4 w-4" /> View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Desktop View: Cover Flow Carousel */}
          <div className="hidden lg:flex flex-col flex-grow w-full justify-center items-center overflow-hidden">
             <Carousel
                setApi={setApiDesktop}
                opts={{
                  align: "center",
                  loop: true,
                }}
                className="w-full max-w-7xl"
              >
                <CarouselContent className="-ml-4 py-4 flex items-center">
                  {artworksData.map((artwork, index) => (
                    <CarouselItem key={artwork.id + '-desktop'} className="pl-4 basis-1/3">
                       <div className="p-1">
                        <Card
                          className={cn(
                            "overflow-hidden bg-card border-border group cursor-pointer aspect-[600/950] transition-all duration-500 ease-out-cubic",
                            index === activeIndexDesktop ? 'scale-105 opacity-100' : 'scale-80 opacity-40'
                          )}
                          onClick={() => openModal(artwork)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && openModal(artwork)}
                          aria-label={`View details for ${artwork.title}`}
                        >
                          <CardContent className="p-0 relative flex flex-col items-center justify-center h-full w-full bg-black">
                             <div className="relative w-full h-full">
                                <Image
                                  src={artwork.src}
                                  alt={artwork.alt}
                                  fill
                                  sizes="30vw"
                                  className="object-contain"
                                  data-ai-hint={artwork.hint}
                                  unoptimized={artwork.src.includes('imgur.com')}
                                  priority={index <= 2} 
                                  onError={(e) => console.error(`Failed to load image: ${artwork.src}`, e)}
                                  crossOrigin="anonymous"
                                />
                              </div>
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-start p-4">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 translate-y-2 group-hover:translate-y-0"
                                  aria-hidden="true"
                                >
                                  <Maximize className="mr-2 h-4 w-4" /> View
                                </Button>
                              </div>
                          </CardContent>
                        </Card>
                       </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/50 hover:bg-background/80 text-foreground p-0" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/50 hover:bg-background/80 text-foreground p-0" />
              </Carousel>
          </div>
        </>
      )}

      {selectedArtwork && (
        <Dialog open={isModalOpen} onOpenChange={(isOpen) => !isOpen && closeModal()}>
          <DialogContent
            hideDefaultClose={true}
            className="p-0 bg-card border-border shadow-2xl rounded-lg flex flex-col items-center justify-center w-auto max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl h-auto max-h-[95vh] overflow-hidden data-[state=open]:animate-fade-in-slow data-[state=closed]:animate-fade-out-slow"
          >
            <DialogTitle className="sr-only">{selectedArtwork.title}</DialogTitle>
            <div className="p-2 md:p-4 flex-grow overflow-hidden flex items-center justify-center w-full h-full">
              <Image
                src={selectedArtwork.src}
                alt={selectedArtwork.alt}
                width={selectedArtwork.width || 600}
                height={selectedArtwork.height || 950}
                className="object-contain rounded w-auto h-auto max-w-full max-h-[calc(95vh-120px)]"
                data-ai-hint={selectedArtwork.hint}
                unoptimized={selectedArtwork.src.includes('imgur.com')}
                onError={(e) => console.error(`Modal failed to load image: ${selectedArtwork.src}`, e)}
                crossOrigin="anonymous"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
       <style jsx global>{`
        @keyframes fade-in-slow {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .data-\\[state=open\\]_animate-fade-in-slow {
          animation: fade-in-slow 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-out-slow {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.95) translateY(10px); }
        }
        .data-\\[state=closed\\]_animate-fade-out-slow {
          animation: fade-out-slow 0.8s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }
      `}</style>
    </div>
  );
}
