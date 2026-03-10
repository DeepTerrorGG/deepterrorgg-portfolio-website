
'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false });
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import type { SplineProps } from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';

interface SplineModelProps extends Omit<SplineProps, 'onLoad' | 'scene'> {
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

  return (
    <div
      className={cn("relative w-full h-full", className)}
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
