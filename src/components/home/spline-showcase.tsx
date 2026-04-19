
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

// Only load the Spline runtime when this component is actually needed
const SplineModel = dynamic(
  () => import('@/components/home/spline-model'),
  {
    ssr: false,
    loading: () => <Skeleton className="absolute inset-0 w-full h-full" />
  }
);

interface SplineShowcaseProps {
  models: {
    url: string;
    title: string;
  }[];
}

export default function SplineShowcase({ models }: SplineShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track which model indices have been loaded — only load on demand
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set([0]));
  // Gate: only start mounting Spline after the section scrolls into view
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer — start loading the first model only when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // start loading a little before reaching the section
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const next = prevIndex === 0 ? models.length - 1 : prevIndex - 1;
      setLoadedIndices((prev) => new Set(prev).add(next));
      return next;
    });
  }, [models.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const next = prevIndex === models.length - 1 ? 0 : prevIndex + 1;
      setLoadedIndices((prev) => new Set(prev).add(next));
      return next;
    });
  }, [models.length]);

  const goToSlide = useCallback((index: number) => {
    setLoadedIndices((prev) => new Set(prev).add(index));
    setCurrentIndex(index);
  }, []);

  return (
    <div ref={containerRef} className="w-full relative group">
      <Card className="border-none relative">
        <CardContent className="relative p-0 h-[500px] md:h-[700px] w-full mx-auto rounded-lg overflow-hidden bg-muted/20 min-h-[500px]">
          {models.map((model, index) => {
            const shouldRender = isInView && loadedIndices.has(index);
            const isActive = index === currentIndex;

            return (
              <div
                key={model.url}
                className={cn(
                  "absolute inset-0 w-full h-full transition-opacity duration-300",
                  isActive ? 'opacity-100' : 'opacity-0'
                )}
                style={{ pointerEvents: isActive ? 'auto' : 'none' }}
              >
                {/* Show skeleton while waiting for in-view or load */}
                {!shouldRender && (
                  <Skeleton className="absolute inset-0 w-full h-full" />
                )}
                {/* Only mount the Spline component when it should live in the DOM */}
                {shouldRender && (
                  <SplineModel sceneUrl={model.url} />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Button
        onClick={handlePrevious}
        size="icon"
        variant="outline"
        className="absolute top-1/2 -left-4 md:-left-16 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 border-border hover:border-primary transition-all duration-300 transform opacity-0 group-hover:opacity-100"
        aria-label="Previous Model"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        onClick={handleNext}
        size="icon"
        variant="outline"
        className="absolute top-1/2 -right-4 md:-right-16 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 border-border hover:border-primary transition-all duration-300 transform opacity-0 group-hover:opacity-100"
        aria-label="Next Model"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Progress Bar Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center gap-2 p-1 rounded-full bg-background/50 backdrop-blur-sm">
        {models.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="p-1 relative h-2 w-8 rounded-full bg-muted/50 transition-colors hover:bg-primary/50"
            aria-label={`Go to slide ${index + 1}`}
          >
            {currentIndex === index && (
              <motion.div
                layoutId="spline-showcase-indicator"
                className="absolute inset-0 h-full w-full bg-primary rounded-full"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
