
import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Plus } from 'lucide-react';

interface Technology {
  name: string;
  iconSrc: string;
}

interface TechStackProps {
  technologies: Technology[];
  maxVisible?: number;
  className?: string;
}

export function TechStack({ technologies, maxVisible = 3, className }: TechStackProps) {
  const visibleTech = technologies.slice(0, maxVisible);
  const hiddenTech = technologies.slice(maxVisible);

  return (
    <TooltipProvider>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {visibleTech.map((tech) => (
            <Tooltip key={tech.name}>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 cursor-pointer hover:bg-muted/50 transition-colors">
                        <Image
                        src={tech.iconSrc}
                        alt={`${tech.name} logo`}
                        width={16}
                        height={16}
                        className="h-4 w-4"
                        unoptimized
                        />
                        <span className="text-xs font-medium text-muted-foreground">{tech.name}</span>
                    </div>
                </TooltipTrigger>
                 <TooltipContent>
                    <p>{tech.name}</p>
                </TooltipContent>
            </Tooltip>
        ))}
        {hiddenTech.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center justify-center gap-1 rounded-md border border-dashed border-border bg-card px-2 py-1 cursor-pointer h-[26px] w-[34px] hover:bg-muted/50 hover:border-solid transition-all">
                    <Plus className="h-3 w-3 text-muted-foreground"/>
                    <span className="text-xs font-bold text-muted-foreground">{hiddenTech.length}</span>
                </div>
            </TooltipTrigger>
            <TooltipContent>
              <ul className="list-none p-0 m-0 space-y-1">
                {hiddenTech.map((tech) => (
                  <li key={tech.name} className="flex items-center gap-2">
                     <Image
                        src={tech.iconSrc}
                        alt={`${tech.name} logo`}
                        width={14}
                        height={14}
                        className="h-3.5 w-3.5"
                        unoptimized
                        />
                    <span className="text-xs">{tech.name}</span>
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
