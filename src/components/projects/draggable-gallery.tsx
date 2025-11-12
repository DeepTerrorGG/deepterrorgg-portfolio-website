'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';

interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  hint: string;
}

const initialItems: GalleryItem[] = [
  { id: '1', src: 'https://i.imgur.com/38CbL2H.png', alt: 'Artwork 1', hint: 'abstract gaming' },
  { id: '2', src: 'https://i.imgur.com/EySXuly.png', alt: 'Artwork 2', hint: 'sci-fi digital' },
  { id: '3', src: 'https://i.imgur.com/K6mwc3I.png', alt: 'Artwork 3', hint: 'fantasy character' },
  { id: '4', src: 'https://i.imgur.com/oe0cJwJ.png', alt: 'Artwork 4', hint: 'abstract texture' },
  { id: '5', src: 'https://i.imgur.com/NnzKUYF.png', alt: 'Artwork 5', hint: 'surreal cyberpunk' },
  { id: '6', src: 'https://i.imgur.com/AMSByjs.png', alt: 'Artwork 6', hint: 'landscape mystery' },
  { id: '7', src: 'https://i.imgur.com/2aUSXCn.png', alt: 'Artwork 10', hint: 'ethereal atmospheric' },
  { id: '8', src: 'https://i.imgur.com/sdJjVAd.png', alt: 'AI Chatbot', hint: 'ai chatbot interface' },
];

const DraggableGallery: React.FC = () => {
  const [items, setItems] = useState(initialItems);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    // Create a new sorted array
    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragItem.current, 1);
    newItems.splice(dragOverItem.current, 0, draggedItem);
    
    // Reset refs and update state
    dragItem.current = null;
    dragOverItem.current = null;
    setItems(newItems);
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl">
        <CardContent className="p-6">
            <h3 className="text-center text-lg font-semibold text-primary mb-4">
                Drag and Drop to Reorder Gallery
            </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => (dragItem.current = index)}
                onDragEnter={() => (dragOverItem.current = index)}
                onDragEnd={handleDragSort}
                onDragOver={(e) => e.preventDefault()}
                className="relative group cursor-grab active:cursor-grabbing"
              >
                <Card className="overflow-hidden aspect-square">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 767px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={item.hint}
                  />
                </Card>
                <div 
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSelectedImage(item)}
                >
                    <Maximize className="h-4 w-4"/>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 left-1 p-1 text-white cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
        <DialogContent className="max-w-3xl w-auto h-auto p-2">
            {selectedImage && (
              <>
                <DialogTitle className="sr-only">{selectedImage.alt}</DialogTitle>
                <Image
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    width={800}
                    height={800}
                    className="object-contain rounded-md"
                />
              </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DraggableGallery;
