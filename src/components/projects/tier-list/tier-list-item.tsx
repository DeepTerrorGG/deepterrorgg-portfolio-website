'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import Image from 'next/image';

export interface Item {
  id: string;
  name: string;
  imageUrl: string;
}

interface TierListItemProps {
  item: Item;
}

export function TierListItem({ item }: TierListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-24 h-24 bg-card rounded-md overflow-hidden shadow-md cursor-grab active:cursor-grabbing relative group"
    >
      <Image
        src={item.imageUrl}
        alt={item.name}
        width={96}
        height={96}
        className="w-full h-full object-cover"
        data-ai-hint="movie poster"
      />
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
        <p className="text-white text-xs text-center font-bold">{item.name}</p>
      </div>
       <div className="absolute top-1 right-1 text-white/50 group-hover:text-white transition-colors">
          <GripVertical size={16} />
      </div>
    </div>
  );
}
