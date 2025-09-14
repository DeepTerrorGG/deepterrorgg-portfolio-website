
import type { ReactElement } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

export interface TechBadgeProps {
  name: string;
  icon: ReactElement;
  className?: string;
  href?: string;
}

export function TechBadge({ name, icon, className, href }: TechBadgeProps) {
  const isLink = !!href;

  const content = (
    <>
      <div className="flex-shrink-0 text-primary transition-colors duration-300 group-hover:text-primary h-5 w-5">
        {React.cloneElement(icon, { className: "h-full w-full" })}
      </div>
      <span className="font-medium text-sm text-foreground flex-grow transition-colors duration-300 group-hover:text-foreground">{name}</span>
      {isLink && (
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/0 transition-all duration-300 group-hover:text-muted-foreground/100 group-hover:translate-x-1 group-hover:-translate-y-1" />
      )}
    </>
  );
  
  const baseClasses = "group flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition-all duration-300";
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
