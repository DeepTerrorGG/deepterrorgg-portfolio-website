
'use client';

import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface SplineModelProps {
    sceneUrl: string;
    onLoad?: () => void;
    className?: string;
}

export default function SplineModel({ sceneUrl, onLoad, className }: SplineModelProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = (spline: any) => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  return (
    <div className={cn("relative w-full h-full", className)}>
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
