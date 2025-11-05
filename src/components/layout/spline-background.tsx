'use client';

import Spline from '@splinetool/react-spline';

export default function SplineBackground() {
  return (
    <div className="fixed inset-0 z-0">
      <Spline
        scene="https://prod.spline.design/wl4X9XbiCMDi6bUv/scene.splinecode"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
    </div>
  );
}
