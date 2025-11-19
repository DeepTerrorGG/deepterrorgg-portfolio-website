'use client';

import React from 'react';
import Spline from '@splinetool/react-spline';

interface SplineModelProps {
    onLoad?: () => void;
}

export default function SplineModel({ onLoad }: SplineModelProps) {
  return (
      <Spline 
        scene="https://prod.spline.design/wl4X9XbiCMDi6bUv/scene.splinecode" 
        onLoad={onLoad}
      />
  );
}
