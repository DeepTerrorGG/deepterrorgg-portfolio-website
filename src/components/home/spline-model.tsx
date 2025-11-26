
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import type { SplineProps, Application } from '@splinetool/react-spline';

interface SplineModelProps extends Omit<SplineProps, 'onLoad'> {
    sceneUrl: string;
    className?: string;
    onLoad?: (spline: Application) => void;
}


export default function SplineModel({ sceneUrl, onLoad, className, ...props }: SplineModelProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = (spline: Application) => {
    setIsLoading(false);
    if (onLoad) {
      onLoad(spline);
    }
  };
  
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }

  return (
    <div 
      className={cn("relative w-full h-full", className)}
      onWheel={handleWheel}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      <Spline 
          scene={sceneUrl} 
          onLoad={handleLoad}
          {...props}
      />
    </div>
  );
}
