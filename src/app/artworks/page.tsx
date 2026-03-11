
// src/app/artworks/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useAnimation, useDragControls } from 'framer-motion';
import { Maximize2, Minus, X, MousePointer2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AnimateOnScroll from '@/components/ui/animate-on-scroll';

interface Artwork {
  id: string;
  title: string;
  src: string;
  alt: string;
  description: string;
  hint: string;
  defaultX: string;
  defaultY: string;
  defaultRotate: number;
  zIndex: number;
}

const artworksData: Artwork[] = [
  {
    id: '1',
    title: 'Fallen angel',
    src: '/artwork-1.jpg',
    alt: 'Artwork 1',
    description: 'corrupted memory fragment',
    hint: 'abstract',
    defaultX: '5%',
    defaultY: '10%',
    defaultRotate: -4,
    zIndex: 10,
  },
  {
    id: '2',
    title: 'Windows 95 world',
    src: '/artwork-2.jpg',
    alt: 'Artwork 2',
    description: 'unauthorized access detected',
    hint: 'abstract',
    defaultX: '60%',
    defaultY: '5%',
    defaultRotate: 6,
    zIndex: 15,
  },
  {
    id: '3',
    title: 'Angel losing it wings',
    src: '/artwork-3.jpg',
    alt: 'Artwork 3',
    description: 'executing background process',
    hint: 'abstract',
    defaultX: '25%',
    defaultY: '45%',
    defaultRotate: -8,
    zIndex: 20,
  },
  {
    id: '4',
    title: 'Do you like suing too?',
    src: '/artwork-4.jpg',
    alt: 'Artwork 4',
    description: 'recovered file',
    hint: 'abstract',
    defaultX: '70%',
    defaultY: '55%',
    defaultRotate: 3,
    zIndex: 25,
  },
  {
    id: '5',
    title: 'My misa amane',
    src: '/artwork-5.jpg',
    alt: 'Artwork 5',
    description: 'data parsing error',
    hint: 'abstract',
    defaultX: '45%',
    defaultY: '25%',
    defaultRotate: -2,
    zIndex: 30,
  },
];

export default function ArtworksPage() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Window states
  const [closedWindows, setClosedWindows] = useState<Record<string, boolean>>({});
  const [minimizedWindows, setMinimizedWindows] = useState<Record<string, boolean>>({});

  // Z-index management to bring dragged item to front
  const [zIndices, setZIndices] = useState<{ [key: string]: number }>(() => 
    artworksData.reduce((acc, art) => ({ ...acc, [art.id]: art.zIndex }), {})
  );
  const [maxZ, setMaxZ] = useState(30);

  useEffect(() => {
    // Preload images
    const imageLoadPromises = artworksData.map(artwork => {
      return new Promise<void>((resolve) => {
        if (typeof window !== 'undefined') {
          const img = new window.Image();
          img.src = artwork.src;
          img.onload = () => resolve();
          img.onerror = () => {
             console.error(`Failed to load: ${artwork.src}`);
             resolve();
          };
        } else {
          resolve();
        }
      });
    });

    Promise.all(imageLoadPromises).then(() => {
      setTimeout(() => setIsLoading(false), 500);
    });
  }, []);

  const openModal = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedArtwork(null);
    }, 300);
  };

  const bringToFront = (id: string) => {
    const nextZ = maxZ + 1;
    setMaxZ(nextZ);
    setZIndices(prev => ({ ...prev, [id]: nextZ }));
  };

  return (
    <AnimateOnScroll className="w-full flex-grow flex flex-col items-center">
      
      {/* Retro Title Area */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 mb-4 text-center z-50">
         <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
            DIGITAL_ARCHIVE.EXE
         </h1>
         <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-mono bg-black/50 p-4 border border-primary/30 inline-block shadow-[4px_4px_0px_rgba(var(--primary),0.3)]">
            {'>'} Most of these were made for fun, but the truth is she inspired a lot of them. Her presence gave me the push to create, even this whole site. It’s a small way of turning feelings into something visible.<br/>
            {'>'} [SYSTEM OFFERS: DRAG WINDOWS TO REARRANGE]
         </p>
      </div>

      {/* Chaotic Drag Area */}
      <div 
        ref={containerRef} 
        className="relative w-full flex-grow min-h-[800px] md:min-h-[1000px] max-w-[1600px] mx-auto overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background via-background to-black border-2 border-primary/20 rounded-xl m-4 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] custom-grid-bg"
      >
        {isLoading ? (
           <div className="absolute inset-0 flex items-center justify-center font-mono text-primary text-xl animate-pulse">
              LOADING_ASSETS...
           </div>
        ) : (
          artworksData.map((artwork) => {
            if (closedWindows[artwork.id]) return null;
            
            return (
            <motion.div
              key={artwork.id}
              drag
              dragConstraints={containerRef}
              dragElastic={0.1}
              dragMomentum={false}
              onDragStart={() => bringToFront(artwork.id)}
              onClick={() => bringToFront(artwork.id)}
              whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.4, delay: parseInt(artwork.id) * 0.1 }}
              style={{
                position: 'absolute',
                top: artwork.defaultY,
                left: artwork.defaultX,
                rotate: artwork.defaultRotate,
                zIndex: zIndices[artwork.id] || artwork.zIndex,
                cursor: 'grab'
              }}
              className="w-[280px] sm:w-[350px] md:w-[450px]"
            >
               {/* Windows 95 Style Retro Wrapper */}
               <div className="bg-[#c0c0c0] p-[2px] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black/80 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] flex flex-col group hover:shadow-[12px_12px_0px_rgba(var(--primary),0.6)] transition-shadow">
                  
                  {/* Title Bar */}
                  <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-2 py-1 flex items-center justify-between pointer-events-none mb-[2px]">
                     <div className="flex items-center gap-2 text-white font-bold text-xs font-mono tracking-tight">
                        <MousePointer2 className="w-3 h-3" />
                        {artwork.title}
                     </div>
                     <div className="flex gap-1">
                        <div 
                          className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black/80 flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-gray-300 active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
                          onClick={(e) => { e.stopPropagation(); setMinimizedWindows(prev => ({ ...prev, [artwork.id]: !prev[artwork.id] })); }}
                        >
                           <Minus className="w-3 h-3 text-black" />
                        </div>
                        <div 
                          className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black/80 flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-gray-300 active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
                          onClick={(e) => { e.stopPropagation(); openModal(artwork); }}
                        >
                           <Maximize2 className="w-2 h-2 text-black" />
                        </div>
                        <div 
                          className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black/80 flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-red-400 active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
                          onClick={(e) => { e.stopPropagation(); setClosedWindows(prev => ({ ...prev, [artwork.id]: true })); }}
                        >
                           <X className="w-3 h-3 text-black" />
                        </div>
                     </div>
                  </div>

                  {/* Content Area */}
                  {!minimizedWindows[artwork.id] && (
                     <>
                        <div className="bg-black border-t-2 border-l-2 border-black/80 border-b-2 border-r-2 border-white p-1 relative group pointer-events-none">
                           <div 
                               className={`relative w-full pointer-events-auto ${['2', '5'].includes(artwork.id) ? 'aspect-[9/16]' : 'aspect-square'}`}
                               onDoubleClick={(e) => { e.stopPropagation(); openModal(artwork); }}
                           >
                              <Image
                                 src={artwork.src}
                                 alt={artwork.alt}
                                 fill
                                 sizes="(max-width: 768px) 100vw, 50vw"
                                 className="object-cover"
                                 priority
                                 draggable={false}
                              />
                              {/* CRT Scanline Overlay applied only to the image */}
                              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-30 mix-blend-overlay"></div>
                           </div>
                        </div>
                        
                        {/* Status Bar */}
                        <div className="bg-[#c0c0c0] text-black text-[10px] uppercase font-mono px-2 py-1 flex justify-between border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black/80 mt-[2px] pointer-events-none">
                           <span>SIZE: UNKNOWN_DATA_BLOCK</span>
                           <span className="text-blue-800 animate-pulse">{artwork.hint}</span>
                        </div>
                     </>
                  )}
               </div>
            </motion.div>
          );
        })
        )}
      </div>

      {/* Modal / Lightbox (keeps standard modern UI for actual viewing) */}
      {selectedArtwork && (
        <Dialog open={isModalOpen} onOpenChange={(isOpen) => !isOpen && closeModal()}>
          <DialogContent
            hideDefaultClose={true}
            className="p-0 bg-transparent border-none shadow-none flex flex-col items-center justify-center w-auto max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-7xl h-auto max-h-[95vh] overflow-hidden backdrop-blur-sm z-[100]"
          >
            <DialogTitle className="sr-only">{selectedArtwork.title}</DialogTitle>
            <DialogDescription className="sr-only">{selectedArtwork.description}</DialogDescription>
            
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               transition={{ type: "spring", damping: 20, stiffness: 300 }}
               className="relative p-2 flex items-center justify-center w-full h-full bg-[#111] border border-primary/30 shadow-[0_0_50px_rgba(var(--primary),0.3)] rounded-xl"
            >
               <button 
                  onClick={closeModal}
                  className="absolute top-2 right-2 md:top-4 md:right-4 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center shadow-[4px_4px_0px_rgba(var(--primary),0.5)] hover:scale-105 hover:bg-red-500 transition-all z-50 border-2 border-white/50"
               >
                  <X className="w-5 h-5" />
               </button>
               <div className="relative w-full overflow-hidden flex items-center justify-center">
                  <Image
                     src={selectedArtwork.src}
                     alt={selectedArtwork.alt}
                     width={1080}
                     height={1080}
                     className="object-contain rounded-lg w-auto h-auto max-w-full max-h-[calc(90vh-40px)]"
                     unoptimized
                     crossOrigin="anonymous"
                     draggable={false}
                  />
               </div>
            </motion.div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 px-6 py-2 rounded-full border border-primary/50 text-white font-mono text-sm tracking-widest backdrop-blur-md">
               {selectedArtwork.title}
            </div>
            
          </DialogContent>
        </Dialog>
      )}

       <style jsx global>{`
         .custom-grid-bg {
            background-image: 
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 40px 40px;
            background-position: -1px -1px;
         }
      `}</style>
    </AnimateOnScroll>
  );
}

