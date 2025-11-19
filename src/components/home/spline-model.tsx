
'use client';

import Spline from '@splinetool/react-spline';
import { Application } from '@splinetool/runtime';

export default function SplineModel() {
    
  function onLoad(spline: Application) {
    // You can interact with the Spline scene here
    // For example: spline.setZoom(0.8);
  }

  return (
    <Spline
      scene="https://prod.spline.design/N-k5Fdzo0rHCcK-3/scene.splinecode"
      onLoad={onLoad}
    />
  );
}
