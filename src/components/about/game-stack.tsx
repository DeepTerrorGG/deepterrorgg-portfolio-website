
'use client';

import type { Application } from '@splinetool/runtime';
import { useRef, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function GameStack() {
  const [Spline, setSpline] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const spline = useRef<Application>();

  useEffect(() => {
    import('@splinetool/react-spline').then((module) => {
      setSpline(() => module.default);
    });
  }, []);

  function onLoad(splineApp: Application) {
    spline.current = splineApp;
    setIsLoading(false);
  }

  return (
    <>
      {(isLoading || !Spline) && <Skeleton className="absolute inset-0 w-full h-full" />}
      {Spline && (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: isLoading ? 0 : 1, // Fade in
            transition: 'opacity 500ms ease-in-out',
          }}>
          <Spline
            scene="https://prod.spline.design/wl4X9XbiCMDi6bUv/scene.splinecode"
            onLoad={onLoad}
          />
        </div>
      )}
    </>
  );
}
