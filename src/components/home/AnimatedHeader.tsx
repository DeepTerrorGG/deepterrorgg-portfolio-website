'use client';

import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import { cn } from '@/lib/utils';

interface AnimatedHeaderProps {
  text: string;
  className?: string;
}

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({ text, className }) => {
  const textWrapperRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const textWrapper = textWrapperRef.current;
    if (textWrapper) {
      // Wrap every letter in a span
      textWrapper.innerHTML = text.replace(
        /\S/g,
        "<span class='letter inline-block'>$&</span>"
      );

      anime.timeline({ loop: false })
        .add({
          targets: textWrapper.querySelectorAll('.letter'),
          translateY: [-20, 0],
          opacity: [0, 1],
          easing: 'easeOutExpo',
          duration: 800,
          delay: (el, i) => 50 * i + 500, // Stagger the animation
        });
    }
  }, [text]);

  return (
    <h1
      ref={textWrapperRef}
      className={cn(
        "text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-6 tracking-tighter",
        className
      )}
    >
      {text}
    </h1>
  );
};

export default AnimatedHeader;
