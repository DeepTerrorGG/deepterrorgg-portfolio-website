
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import AnimateOnScroll from './animate-on-scroll';

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function SectionContainer({ children, className, id }: SectionContainerProps) {
  return (
    <section id={id} className={cn('container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24', className)}>
        {children}
    </section>
  );
}
