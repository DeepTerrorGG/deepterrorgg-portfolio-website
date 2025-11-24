
'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TierListDroppable } from './tier-list-droppable';
import { TierListItem, type Item } from './tier-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allLists, type ListKey } from './data';

const tierConfig = {
  S: { label: 'S', color: 'bg-red-500' },
  A: { label: 'A', color: 'bg-orange-500' },
  B: { label: 'B', color: 'bg-yellow-500' },
  C: { label: 'C', color: 'bg-green-500' },
  D: { label: 'D', color: 'bg-blue-500' },
  unranked: { label: 'Unranked', color: 'bg-gray-700' },
};

type TierId = keyof typeof tierConfig;

const createInitialItemsState = (items: Item[]): Record<TierId, Item[]> => ({
  S: [],
  A: [],
  B: [],
  C: [],
  D: [],
  unranked: items,
});

const TierListMaker: React.FC = () => {
  const [selectedListKey, setSelectedListKey] = useState<ListKey>('MCU Movies');
  const [items, setItems] = useState<Record<TierId, Item[]>>(() =>
    createInitialItemsState(allLists[selectedListKey].items)
  );

  const [activeItem, setActiveItem] = useState<Item | null>(null);

  useEffect(() => {
    // Reset state when the selected list changes
    setItems(createInitialItemsState(allLists[selectedListKey].items));
  }, [selectedListKey]);

  const sensors = useSensors(useSensor(PointerSensor));

  const findContainer = (id: string): TierId | undefined => {
    if (id in tierConfig) {
      return id as TierId;
    }
    return Object.keys(items).find(key => items[key as TierId].some(item => item.id === id)) as TierId | undefined;
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    const container = findContainer(active.id);
    if (container) {
      setActiveItem(items[container].find(item => item.id === active.id) || null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
  
    const activeId = active.id as string;
    const overId = over.id as string;
  
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
  
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }
  
    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
  
      const activeIndex = activeItems.findIndex(item => item.id === activeId);
      const [movedItem] = activeItems.splice(activeIndex, 1);
  
      return {
        ...prev,
        [activeContainer]: activeItems,
        [overContainer]: [...overItems, movedItem],
      };
    });
  };
  

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
  
    if (over && active.id !== over.id) {
        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(over.id as string);

        if (activeContainer && overContainer && activeContainer === overContainer) {
            setItems(prev => {
                const containerItems = prev[activeContainer];
                const oldIndex = containerItems.findIndex(item => item.id === active.id);
                const newIndex = containerItems.findIndex(item => item.id === over.id);

                return {
                    ...prev,
                    [activeContainer]: arrayMove(containerItems, oldIndex, newIndex)
                };
            });
        }
    }
    setActiveItem(null);
  };
  
  return (
    <div className="w-full h-full bg-card flex flex-col p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-6xl mx-auto shadow-2xl flex-grow flex flex-col">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                  <CardTitle>Community Tier List</CardTitle>
                  <CardDescription>Drag and drop the items to rank them.</CardDescription>
              </div>
              <Select value={selectedListKey} onValueChange={(value) => setSelectedListKey(value as ListKey)}>
                <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent>
                    {Object.keys(allLists).map((key) => (
                        <SelectItem key={key} value={key}>{allLists[key as ListKey].name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-1 flex-grow flex flex-col">
              {Object.keys(tierConfig).map((tierId) => {
                if (tierId === 'unranked') return null;
                const tier = tierConfig[tierId as TierId];
                const tierItems = items[tierId as TierId];
                return (
                  <SortableContext key={tierId} items={tierItems.map(i => i.id)}>
                    <TierListDroppable id={tierId} label={tier.label} color={tier.color}>
                      {tierItems.map((item) => (
                        <TierListItem key={item.id} item={item} />
                      ))}
                    </TierListDroppable>
                  </SortableContext>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <SortableContext items={items.unranked.map(i => i.id)}>
                <TierListDroppable id="unranked" label="Unranked" color="bg-gray-700">
                  <ScrollArea className="h-48 w-full">
                    <div className="flex flex-wrap gap-2 p-1">
                      {items.unranked.map((item) => (
                        <TierListItem key={item.id} item={item} />
                      ))}
                    </div>
                  </ScrollArea>
                </TierListDroppable>
              </SortableContext>
            </div>
            
            <DragOverlay>
              {activeItem ? <TierListItem item={activeItem} /> : null}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
};

export default TierListMaker;
