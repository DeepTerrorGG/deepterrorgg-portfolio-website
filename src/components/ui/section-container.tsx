import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function SectionContainer({ children, className, id }: SectionContainerProps) {
  return (
    <section id={id} className={cn('container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16', className)}>
      {children}
    </section>
  );
}
