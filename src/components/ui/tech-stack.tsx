// src/components/ui/tech-stack.tsx

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Plus, ArrowUpRight } from 'lucide-react';

interface Technology {
  name: string;
  icon: React.ReactNode;
  href?: string;
}

interface TechStackProps {
  technologies: Technology[];
  maxVisible?: number;
  className?: string;
}

const TechBadge = ({ tech }: { tech: Technology }) => {
  const content = (
    <>
      <div className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors">{tech.icon}</div>
      <span className="text-xs font-medium text-gray-300 group-hover:text-primary transition-colors">{tech.name}</span>
    </>
  );

  const badgeClasses = "flex items-center gap-2 rounded-md border border-[#333] bg-[#222] px-2 py-1 transition-all duration-300 group";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (tech.href) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={tech.href} target="_blank" rel="noopener noreferrer" className={cn(badgeClasses, "cursor-pointer hover:border-primary/50")} onClick={handleClick}>
            {content}
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>Visit {tech.name}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(badgeClasses, "cursor-default")}>
          {content}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tech.name}</p>
      </TooltipContent>
    </Tooltip>
  );
};


export function TechStack({ technologies, maxVisible = 3, className }: TechStackProps) {
  const visibleTech = technologies.slice(0, maxVisible);
  const hiddenTech = technologies.slice(maxVisible);

  const PopoverListItem = ({ tech }: { tech: Technology }) => {
    const itemContent = (
      <>
        <div className="h-3.5 w-3.5">{tech.icon}</div>
        <span className="text-xs">{tech.name}</span>
        {tech.href && <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-primary" />}
      </>
    );

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };


    if (tech.href) {
      return (
        <li className="p-0 m-0">
          <Link
            href={tech.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md p-1.5 -mx-1.5 hover:bg-muted group"
            onClick={handleClick}
          >
            {itemContent}
          </Link>
        </li>
      );
    }

    return (
      <li className="flex items-center gap-2 p-1.5 -mx-1.5">
        {itemContent}
      </li>
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {visibleTech.map((tech) => (
          <TechBadge key={tech.name} tech={tech} />
        ))}
        {hiddenTech.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
                <button 
                  onClick={(e) => e.stopPropagation()} 
                  className="flex items-center justify-center gap-1 rounded-md border border-dashed border-border bg-card px-2 py-1 cursor-pointer h-[26px] w-[34px] hover:bg-muted/50 hover:border-solid transition-all"
                >
                    <Plus className="h-3 w-3 text-muted-foreground"/>
                    <span className="text-xs font-bold text-muted-foreground">{hiddenTech.length}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="p-2 w-auto" onClick={(e) => e.stopPropagation()}>
              <ul className="list-none p-0 m-0 space-y-1">
                {hiddenTech.map((tech) => (
                  <PopoverListItem key={tech.name} tech={tech} />
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </TooltipProvider>
  );
}
