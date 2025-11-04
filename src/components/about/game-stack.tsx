
'use client';

import Spline from '@splinetool/react-spline';
import { Application } from '@splinetool/runtime';
import { useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function GameStack() {
    const spline = useRef<Application>();

    function onLoad(splineApp: Application) {
      spline.current = splineApp;
    }

  return (
    <>
    <Skeleton className="absolute inset-0 w-full h-full" />
    <Spline
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
        }}
        scene="https://prod.spline.design/wl4X9XbiCMDi6bUv/scene.splinecode"
        onLoad={onLoad}
    />
    </>
  );
}
