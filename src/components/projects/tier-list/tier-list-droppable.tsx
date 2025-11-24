'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface TierListDroppableProps {
  id: string;
  label: string;
  color: string;
  children: React.ReactNode;
}

export function TierListDroppable({ id, label, color, children }: TierListDroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="flex items-stretch min-h-[120px]">
      <div
        className={cn(
          "w-24 flex-shrink-0 flex items-center justify-center text-2xl font-bold text-white",
          color
        )}
      >
        {label}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-grow bg-muted/30 p-2 flex flex-wrap items-start content-start gap-2 transition-colors",
          isOver ? 'bg-primary/20' : 'border-border'
        )}
      >
        {children}
      </div>
    </div>
  );
}
