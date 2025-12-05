'use client';

import React, { useRef, useEffect } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedElementProps {
  children: React.ReactNode;
  className?: string;
  animationType?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'zoomIn';
  delay?: number;
  duration?: number;
}

const animationPresets = {
  fadeInUp: { translateY: [20, 0], opacity: [0, 1] },
  fadeInDown: { translateY: [-20, 0], opacity: [0, 1] },
  fadeInLeft: { translateX: [-20, 0], opacity: [0, 1] },
  fadeInRight: { translateX: [20, 0], opacity: [0, 1] },
  zoomIn: { scale: [0.9, 1], opacity: [0, 1] },
};

export default function AnimatedElement({
  children,
  className,
  animationType = 'fadeInUp',
  delay = 0,
  duration = 500,
}: AnimatedElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (isInView && ref.current) {
      // Use dynamic import for animejs
      import('animejs').then((animeModule) => {
        const anime = animeModule.default;
        const animationProps = {
          targets: ref.current,
          ...animationPresets[animationType],
          easing: 'easeOutExpo',
          duration,
          delay,
        };
        anime(animationProps);
      }).catch(err => console.error("Failed to load animejs", err));
    }
  }, [isInView, animationType, delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
