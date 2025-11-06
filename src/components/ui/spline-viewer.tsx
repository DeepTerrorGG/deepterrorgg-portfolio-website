// src/components/ui/spline-viewer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';
import { cn } from '@/lib/utils';
import type { Application } from '@splinetool/runtime';
import { Skeleton } from './skeleton';

interface SplineViewerProps {
  sceneUrl: string;
  className?: string;
}

export default function SplineViewer({ sceneUrl, className }: SplineViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure the component only renders on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  function onLoad(spline: Application) {
    setIsLoading(false);
  }

  if (!isMounted) {
    // While not mounted, render a placeholder to avoid server-side execution issues
    return <Skeleton className={cn("w-full h-full min-h-[300px] md:min-h-[500px]", className)} />;
  }

  return (
    <div className={cn("relative w-full h-full min-h-[300px] md:min-h-[500px]", className)}>
      {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}
      <Spline
        scene={sceneUrl}
        onLoad={onLoad}
        className={cn(isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500')}
      />
    </div>
  );
}
