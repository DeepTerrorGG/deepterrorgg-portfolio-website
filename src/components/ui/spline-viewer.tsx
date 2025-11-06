// src/components/ui/spline-viewer.tsx
'use client';

import Spline from '@splinetool/react-spline';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';
import { Application, SPEObject } from '@splinetool/runtime';
import { useState } from 'react';

interface SplineViewerProps {
  sceneUrl: string;
  className?: string;
}

export default function SplineViewer({ sceneUrl, className }: SplineViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  function onLoad(spline: Application) {
    setIsLoading(false);
  }

  return (
    <div className={cn("relative w-full h-full min-h-[300px] md:min-h-[500px]", className)}>
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
      )}
      <Spline
        scene={sceneUrl}
        onLoad={onLoad}
        className={cn(isLoading && 'opacity-0')}
      />
    </div>
  );
}
