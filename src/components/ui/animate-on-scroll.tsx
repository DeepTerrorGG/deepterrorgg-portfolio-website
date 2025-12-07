
'use client';

import { motion, useInView } from 'framer-motion';
import React, { useRef, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  asChild?: boolean;
}

export default function AnimateOnScroll({ children, className, delay = 0, asChild = false }: AnimateOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const Comp = asChild ? motion(Slot) : motion.div;

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Comp
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </Comp>
  );
}
