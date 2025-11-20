
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface SplineModelProps {
    sceneUrl: string;
    onLoad?: (spline: any) => void;
    className?: string;
    scrollable?: boolean;
}

export default function SplineModel({ sceneUrl, onLoad, className, scrollable = true }: SplineModelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleLoad = (spline: any) => {
    setIsLoading(false);
    if (onLoad) {
      onLoad(spline);
    }
  };
  
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || scrollable) return;

    const handleWheel = (e: WheelEvent) => {
      // If the Alt/Option key is NOT held down, prevent the default scroll-to-zoom
      // and allow the page to scroll instead.
      if (!e.altKey) {
        e.preventDefault();
        // Manually scroll the window.
        // The deltaY value is passed directly to the window's scrollBy method.
        window.scrollBy({
          top: e.deltaY,
          left: e.deltaX,
          behavior: 'auto' // Use 'auto' for direct mapping of wheel speed
        });
      }
      // If Alt key IS held down, do nothing and let Spline handle the zoom.
    };

    // We add the wheel event listener to the wrapper div.
    // The `passive: false` option is CRITICAL to allow us to call `e.preventDefault()`.
    wrapper.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      // Cleanup the event listener when the component unmounts.
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, [scrollable]); // This effect runs only when the `scrollable` prop changes.


  return (
    <div 
      ref={wrapperRef}
      className={cn("relative w-full h-full", className)}
      title={!scrollable ? "Hold Alt/Option to zoom" : ""}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <Spline 
          scene={sceneUrl} 
          onLoad={handleLoad}
      />
    </div>
  );
}
