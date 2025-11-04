// src/components/layout/spline-background.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import type { SplineProps } from '@splinetool/react-spline';

const Spline = React.lazy(() => import('@splinetool/react-spline'));

export default function SplineBackground() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0">
      <Suspense fallback={null}>
        <Spline
          scene="https://prod.spline.design/wl4X9XbiCMDi6bUv/scene.splinecode"
        />
      </Suspense>
       <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
    </div>
  );
}
