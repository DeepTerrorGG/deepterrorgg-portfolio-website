// src/app/artworks/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import PageTitle from '@/components/ui/page-title';
import SectionContainer from '@/components/ui/section-container';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Maximize, X } from 'lucide-react';

interface Artwork {
  id: string;
  title: string;
  src: string;
  alt: string;
  description: string;
  hint: string;
}

const artworks: Artwork[] = [
  { id: '1', title: 'Cosmic Entity', src: 'https://picsum.photos/seed/artwork1/800/600', alt: 'Abstract cosmic entity', description: 'A swirling vortex of colors resembling a celestial being.', hint: 'abstract dark' },
  { id: '2', title: 'Forest Guardian', src: 'https://picsum.photos/seed/artwork2/800/600', alt: 'Mystical forest guardian', description: 'An ancient creature woven from roots and leaves, watching over a moonlit forest.', hint: 'fantasy creature' },
  { id: '3', title: 'Neon Metropolis', src: 'https://picsum.photos/seed/artwork3/800/600', alt: 'Futuristic sci-fi city', description: 'Towering skyscrapers illuminated by neon lights under a perpetual twilight.', hint: 'sci-fi landscape' },
  { id: '4', title: 'Dream Weaver', src: 'https://picsum.photos/seed/artwork4/800/600', alt: 'Surreal portrait of a dream weaver', description: 'A face dissolving into a tapestry of dreams and symbols.', hint: 'surreal portrait' },
  { id: '5', title: 'Digital Phoenix', src: 'https://picsum.photos/seed/artwork5/800/600', alt: 'Digital painting of a phoenix', description: 'A majestic phoenix rendered in vibrant digital strokes, rising from pixelated ashes.', hint: 'digital painting' },
  { id: '6', title: 'Cybernetic Bloom', src: 'https://picsum.photos/seed/artwork6/800/600', alt: 'Cybernetic flower blooming', description: 'A mechanical flower with glowing circuits unfurling its metallic petals.', hint: 'cyberpunk nature' },
];

export default function ArtworksPage() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  return (
    <SectionContainer>
      <PageTitle subtitle="A curated collection of my digital creations. Click on an artwork to view it in detail.">
        My Artworks
      </PageTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {artworks.map((artwork) => (
          <Card
            key={artwork.id}
            className="overflow-hidden bg-card border-border hover:shadow-xl hover:border-primary transition-all duration-300 ease-in-out group animate-slide-up"
            onClick={() => setSelectedArtwork(artwork)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedArtwork(artwork)}
          >
            <CardHeader className="p-0 relative">
              <Image
                src={artwork.src}
                alt={artwork.alt}
                width={800}
                height={600}
                className="aspect-[4/3] object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-in-out"
                data-ai-hint={artwork.hint}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 pointer-events-none"
              >
                <Maximize className="mr-2 h-4 w-4" /> View
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-xl font-semibold text-foreground mb-1">{artwork.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">{artwork.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedArtwork && (
        <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
          <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl p-0 bg-card border-border shadow-2xl rounded-lg">
            <DialogHeader className="p-4 pr-14 relative"> {/* Ensure DialogHeader is relative for DialogClose positioning if needed */}
              <DialogTitle className="text-2xl text-foreground">{selectedArtwork.title}</DialogTitle>
              {/* Radix Dialog.Content automatically provides a close button, ensure it's styled or positioned if custom one removed */}
            </DialogHeader>
            <div className="p-1 md:p-2 bg-transparent">
              <Image
                src={selectedArtwork.src.replace('/800/600', '/1200/900')}
                alt={selectedArtwork.alt}
                width={1200}
                height={900}
                className="w-full h-auto max-h-[80vh] object-contain rounded"
                data-ai-hint={selectedArtwork.hint}
              />
            </div>
            <p className="p-4 text-sm text-muted-foreground">{selectedArtwork.description}</p>
          </DialogContent>
        </Dialog>
      )}
    </SectionContainer>
  );
}
