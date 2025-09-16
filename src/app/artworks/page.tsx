
// src/app/artworks/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import PageTitle from '@/components/ui/page-title';
import SectionContainer from '@/components/ui/section-container';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardHeader, CardTitle
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'; // Removed DialogHeader, DialogClose
import { Button } from '@/components/ui/button';
import { Maximize, ArrowLeft, ArrowRight, Laptop, Dot } from 'lucide-react'; // Removed LucideX
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
    id: '7',
    title: 'SteamArtworkV7',
    src: 'https://i.imgur.com/8i9b6vX.png',
    alt: 'Steam Artwork V7',
    description: 'A digital artwork, version 7, exploring dark themes with a mysterious figure.',
    hint: 'dark mystery',
    width: 600,
    height: 950,
  },
  {
    id: '8',
    title: 'SteamArtworkV8',
    src: 'https://i.imgur.com/0uA4RzV.png',
    alt: 'Steam Artwork V8',
    description: 'A digital artwork, version 8, with a dramatic, high-contrast composition.',
    hint: 'contrast dramatic',
    width: 600,
    height: 950,
  },
  {
    id: '9',
    title: 'SteamArtworkV9',
    src: 'https://i.imgur.com/8t3h6D9.png',
    alt: 'Steam Artwork V9',
    description: 'A digital artwork, version 9, featuring a stylized character with glowing elements.',
    hint: 'glowing character',
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
  const [scrollSnapsDesktop, setScrollSnapsDesktop] = useState<number[]>([]);


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
    setScrollSnapsDesktop(apiDesktop.scrollSnapList());
    setActiveIndexDesktop(apiDesktop.selectedScrollSnap());

    const onSelect = () => {
      setActiveIndexDesktop(apiDesktop.selectedScrollSnap());
    };
    const onReInit = () => {
        setScrollSnapsDesktop(apiDesktop.scrollSnapList());
        setActiveIndexDesktop(apiDesktop.selectedScrollSnap());
    }

    apiDesktop.on('select', onSelect);
    apiDesktop.on('reInit', onReInit);
    return () => {
      apiDesktop.off('select', onSelect);
      apiDesktop.off('reInit', onReInit);
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
    <SectionContainer className="py-8 md:py-16">
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
          <div className="lg:hidden">
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
                              className="object-contain transition-transform duration-700 ease-in-out opacity-0 animate-image-fade-in"
                              style={{ animationFillMode: 'forwards' }}
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

          {/* Desktop View: Main image with faded side previews */}
          <div className="hidden lg:block w-full bg-black py-4">
            <SectionContainer className="!py-0 !max-w-none !px-0">
              <div className="container mx-auto px-4 md:px-8 relative">
                <Carousel
                  setApi={setApiDesktop}
                  opts={{
                    align: 'center',
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4 flex items-center py-4">
                    {artworksData.map((artwork, index) => {
                      const isActive = index === activeIndexDesktop;
                      const prevActualIndex = (activeIndexDesktop - 1 + artworksData.length) % artworksData.length;
                      const nextActualIndex = (activeIndexDesktop + 1) % artworksData.length;

                      let itemClasses = "transition-all duration-500 ease-out origin-center";
                      if (isActive) {
                        itemClasses += " opacity-100 scale-100 z-10";
                      } else if (index === prevActualIndex || index === nextActualIndex) {
                        itemClasses += " opacity-50 scale-75"; 
                      } else {
                        itemClasses += " opacity-25 scale-50"; 
                      }
                      
                      return (
                        <CarouselItem key={artwork.id + '-desktop'} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
                          <div className={cn("p-1", itemClasses)}>
                            <Card
                              className="overflow-hidden bg-card border-border group cursor-pointer aspect-[600/950]"
                              onClick={() => openModal(artwork)}
                              role="button"
                              tabIndex={isActive ? 0 : -1}
                              onKeyDown={(e) => isActive && e.key === 'Enter' && openModal(artwork)}
                              aria-label={`View details for ${artwork.title}`}
                            >
                              <CardContent className="p-0 relative flex flex-col items-center justify-center h-full w-full bg-black">
                                <div className="relative w-full h-full">
                                  <Image
                                    src={artwork.src}
                                    alt={artwork.alt}
                                    fill
                                    sizes="(min-width: 1536px) calc(20vw - 16px), (min-width: 1280px) calc(25vw - 16px), (min-width: 1024px) calc(33.33vw - 16px), 100vw"
                                    className="object-contain transition-transform duration-700 ease-in-out opacity-0 animate-image-fade-in"
                                    style={{ animationFillMode: 'forwards' }}
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
                      );
                    })}
                  </CarouselContent>
                  <CarouselPrevious className="absolute left-4 sm:left-8 md:left-12 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/50 hover:bg-background/80 text-foreground p-0" />
                  <CarouselNext className="absolute right-4 sm:right-8 md:right-12 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background/50 hover:bg-background/80 text-foreground p-0" />
                </Carousel>
                
                <div className="flex justify-center gap-2 mt-4">
                  {scrollSnapsDesktop.map((_, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full p-0 transition-all duration-300",
                        index === activeIndexDesktop ? "bg-primary scale-125" : "bg-muted hover:bg-muted/70"
                      )}
                      aria-label={`Go to slide ${index + 1}`}
                      onClick={() => apiDesktop?.scrollTo(index)}
                    />
                  ))}
                </div>
              </div>
            </SectionContainer>
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
        @keyframes image-fade-in {
          from { opacity: 0; background-color: hsl(var(--card)); }
          to { opacity: 1; background-color: transparent; }
        }
        .animate-image-fade-in {
          animation-name: image-fade-in;
          animation-duration: 1.2s;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-fill-mode: forwards;
        }
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
    </SectionContainer>
  );
}
