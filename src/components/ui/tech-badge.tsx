
import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

export interface TechBadgeProps {
  name: string;
  className?: string;
  href?: string;
  iconSrc: string;
}

export function TechBadge({ name, className, href, iconSrc }: TechBadgeProps) {
  const isLink = !!href;

  const content = (
    <>
      <Image 
        src={iconSrc} 
        alt={`${name} logo`} 
        width={32} 
        height={32} 
        className="flex-shrink-0 h-8 w-8" 
        unoptimized // Necessary for SVGs with next/image without a custom loader
      />
      <span className="font-semibold text-base text-foreground flex-grow transition-colors duration-300 group-hover:text-primary">{name}</span>
      {isLink && (
          <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
      )}
    </>
  );
  
  const baseClasses = "group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-300";
  const hoverClasses = isLink ? "hover:border-primary/50 hover:bg-card hover:shadow-lg hover:-translate-y-1" : "cursor-default";

  if (isLink) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseClasses, hoverClasses, className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn(baseClasses, hoverClasses, className)}>
      {content}
    </div>
  );
}
