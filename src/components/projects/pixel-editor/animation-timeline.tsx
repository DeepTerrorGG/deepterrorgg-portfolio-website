
'use client';

import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Copy, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type Layer = string[][];
type Frame = Layer[];

interface AnimationTimelineProps {
  frames: Frame[];
  activeFrameIndex: number;
  onSelectFrame: (index: number) => void;
  onAddFrame: () => void;
  onDuplicateFrame: (index: number) => void;
  onDeleteFrame: (index: number) => void;
  gridSize: number;
}

const FramePreview: React.FC<{ frame: Frame; size: number }> = React.memo(({ frame, size }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frame.forEach(layer => {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (layer[y] && layer[y][x] && layer[y][x] !== 'transparent') {
            ctx.fillStyle = layer[y][x];
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    });
  }, [frame, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />;
});
FramePreview.displayName = 'FramePreview';

export const AnimationTimeline: React.FC<AnimationTimelineProps> = ({
  frames,
  activeFrameIndex,
  onSelectFrame,
  onAddFrame,
  onDuplicateFrame,
  onDeleteFrame,
  gridSize,
}) => {
  return (
    <div className="w-full border-t bg-card p-2">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-2 pb-4">
          {frames.map((frame, index) => (
            <Card
              key={index}
              onClick={() => onSelectFrame(index)}
              className={cn(
                'w-28 h-36 flex-shrink-0 cursor-pointer transition-all flex flex-col',
                activeFrameIndex === index ? 'border-primary ring-2 ring-primary' : 'border-border'
              )}
            >
              <CardContent className="p-1 flex-grow aspect-square">
                <FramePreview frame={frame} size={gridSize} />
              </CardContent>
              <div className="text-center text-xs text-muted-foreground py-1">Frame {index + 1}</div>
              <div className="flex justify-around items-center border-t">
                  <Button size="icon" variant="ghost" onClick={(e) => {e.stopPropagation(); onDuplicateFrame(index)}} className="h-6 w-6"><Copy className="h-3 w-3"/></Button>
                  <Button size="icon" variant="ghost" onClick={(e) => {e.stopPropagation(); onDeleteFrame(index)}} className="h-6 w-6"><Trash className="h-3 w-3 text-destructive"/></Button>
              </div>
            </Card>
          ))}
          <Button
            variant="outline"
            className="w-28 h-36 flex-shrink-0 flex flex-col items-center justify-center gap-1 border-dashed"
            onClick={onAddFrame}
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs">Add Frame</span>
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};


    