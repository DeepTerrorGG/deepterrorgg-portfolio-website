// src/components/ui/spline-viewer.tsx
'use client';

import React from 'react';
import Spline from '@splinetool/react-spline';
import { cn } from '@/lib/utils';

interface SplineViewerProps {
  sceneUrl: string;
  className?: string;
}

export default function SplineViewer({ sceneUrl, className }: SplineViewerProps) {
  return (
    <div className={cn("relative w-full h-full min-h-[300px] md:min-h-[500px]", className)}>
      <Spline
        scene={sceneUrl}
      />
    </div>
  );
}
