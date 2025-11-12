'use client';

import Spline from '@splinetool/react-spline';

export default function SplineViewer({ sceneUrl }: { sceneUrl: string }) {
  return (
    <div className="w-full h-[450px] md:h-full">
      <Spline scene={sceneUrl} />
    </div>
  );
}
