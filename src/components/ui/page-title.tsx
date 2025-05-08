import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTitleProps {
  children: ReactNode;
  className?: string;
  subtitle?: string;
}

export default function PageTitle({ children, className, subtitle }: PageTitleProps) {
  return (
    <div className={cn("mb-8 md:mb-12 text-center animate-fade-in", className)}>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
        {children}
      </h1>
      {subtitle && (
        <p className="mt-2 text-lg text-muted-foreground max-w-xl mx-auto animate-slide-up">
          {subtitle}
        </p>
      )}
    </div>
  );
}
