
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardHat, Cog, Box, Play, Pause, RefreshCw, ZoomIn, ZoomOut, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// --- TYPE DEFINITIONS ---
type BuildingType = 'miner' | 'belt' | 'assembler';
type Resource = 'iron_ore' | 'copper_ore' | 'iron_plate' | 'copper_wire' | 'gear';

interface Building {
  id: number;
  type: BuildingType;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  recipe?: Resource; // For assemblers
}

interface ItemOnBelt {
  id: number;
  resource: Resource;
  x: number;
  y: number;
  progress: number; // 0 to 1 along the belt
}

// --- CONSTANTS ---
const GRID_SIZE = 30;
const TICK_RATE = 100; // ms per game tick
const BELT_SPEED = 0.1; // progress per tick

const resourceColors: Record<Resource, string> = {
  iron_ore: '#a1a1aa',
  copper_ore: '#f59e0b',
  iron_plate: '#d4d4d8',
  copper_wire: '#fbbf24',
  gear: '#71717a',
};

const FactorySimulator: React.FC = () => {
    const { toast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [items, setItems] = useState<ItemOnBelt[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingType>('miner');
    const [buildingDirection, setBuildingDirection] = useState<'up' | 'down' | 'left' | 'right'>('right');
    const [isPlaying, setIsPlaying] = useState(true);
    const [zoom, setZoom] = useState(1);
    const cellSize = useMemo(() => 32 * zoom, [zoom]);
    const nextId = useRef(0);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });

    const placeBuilding = (x: number, y: number) => {
        if(buildings.some(b => b.x === x && b.y === y)) return; // Prevent stacking
        setBuildings(prev => [...prev, { id: nextId.current++, type: selectedBuilding, x, y, direction: buildingDirection }]);
    };
    
    const handleCanvasClick = (e: React.MouseEvent) => {
        const canvas = canvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left - viewOffset.x) / cellSize);
        const y = Math.floor((e.clientY - rect.top - viewOffset.y) / cellSize);
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            placeBuilding(x, y);
        }
    };
    
    // Main Game Loop
    useEffect(() => {
        if (!isPlaying) return;
        const gameTick = setInterval(() => {
            // --- Item Movement on Belts ---
            setItems(currentItems => {
                const movedItems: ItemOnBelt[] = [];
                currentItems.forEach(item => {
                    const belt = buildings.find(b => b.x === item.x && b.y === item.y && b.type === 'belt');
                    if (!belt) return; // Item is on a non-belt tile, should be removed
                    
                    let newProgress = item.progress + BELT_SPEED;
                    if(newProgress >= 1) { // Move to next tile
                        let nextX = item.x, nextY = item.y;
                        if(belt.direction === 'right') nextX++; if(belt.direction === 'left') nextX--;
                        if(belt.direction === 'down') nextY++; if(belt.direction === 'up') nextY--;

                        // Check if next tile is valid and not occupied at the start
                        const nextTile = buildings.find(b => b.x === nextX && b.y === nextY);
                        const isNextTileOccupied = currentItems.some(i => i.x === nextX && i.y === nextY && i.progress < BELT_SPEED) 
                                                 || movedItems.some(i => i.x === nextX && i.y === nextY && i.progress < BELT_SPEED);
                        if (nextTile && (nextTile.type === 'belt') && !isNextTileOccupied) {
                            movedItems.push({ ...item, x: nextX, y: nextY, progress: newProgress - 1 });
                        } else {
                            // If it can't move, stay put but don't progress past the end
                             movedItems.push({ ...item, progress: 1 });
                        }
                    } else {
                        movedItems.push({ ...item, progress: newProgress });
                    }
                });
                return movedItems;
            });

            // --- Miner Production ---
            buildings.forEach(building => {
                if(building.type === 'miner' && Math.random() < 0.1) { // Production chance
                    const outputX = building.x, outputY = building.y;
                    const isOutputOccupied = items.some(i => i.x === outputX && i.y === outputY && i.progress < BELT_SPEED);
                    if(!isOutputOccupied) {
                        setItems(prev => [...prev, { id: nextId.current++, resource: 'iron_ore', x: outputX, y: outputY, progress: 0 }]);
                    }
                }
            });

        }, TICK_RATE);
        return () => clearInterval(gameTick);
    }, [isPlaying, buildings, items]);

    // Drawing logic
    const draw = useCallback(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(viewOffset.x, viewOffset.y);

        // Draw Grid
        for(let i=0; i<GRID_SIZE; i++) for(let j=0; j<GRID_SIZE; j++) {
            ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 0.5;
            ctx.strokeRect(i*cellSize, j*cellSize, cellSize, cellSize);
        }

        // Draw Buildings
        buildings.forEach(b => {
            ctx.fillStyle = b.type === 'miner' ? '#4f46e5' : b.type === 'belt' ? '#64748b' : '#0d9488';
            ctx.fillRect(b.x*cellSize, b.y*cellSize, cellSize, cellSize);
            // Draw belt direction arrow
            if(b.type === 'belt') {
                ctx.fillStyle = 'white'; ctx.beginPath();
                const centerX = b.x*cellSize + cellSize/2, centerY = b.y*cellSize + cellSize/2;
                if(b.direction === 'right'){ ctx.moveTo(centerX-5, centerY-5); ctx.lineTo(centerX+5, centerY); ctx.lineTo(centerX-5, centerY+5); }
                if(b.direction === 'left'){ ctx.moveTo(centerX+5, centerY-5); ctx.lineTo(centerX-5, centerY); ctx.lineTo(centerX+5, centerY+5); }
                if(b.direction === 'down'){ ctx.moveTo(centerX-5, centerY-5); ctx.lineTo(centerX, centerY+5); ctx.lineTo(centerX+5, centerY-5); }
                if(b.direction === 'up'){ ctx.moveTo(centerX-5, centerY+5); ctx.lineTo(centerX, centerY-5); ctx.lineTo(centerX+5, centerY+5); }
                ctx.closePath(); ctx.fill();
            }
        });

        // Draw Items
        items.forEach(item => {
            const belt = buildings.find(b => b.x === item.x && b.y === item.y);
            let itemX = item.x * cellSize + cellSize / 2;
            let itemY = item.y * cellSize + cellSize / 2;
            if(belt && belt.type === 'belt') {
                const startX = item.x * cellSize + cellSize / 2;
                const startY = item.y * cellSize + cellSize / 2;
                let endX = startX, endY = startY;
                if(belt.direction === 'right') endX += cellSize; if(belt.direction === 'left') endX -= cellSize;
                if(belt.direction === 'down') endY += cellSize; if(belt.direction === 'up') endY -= cellSize;
                itemX = startX + (endX - startX) * item.progress;
                itemY = startY + (endY - startY) * item.progress;
            }
            
            ctx.fillStyle = resourceColors[item.resource] || '#ffffff';
            ctx.beginPath();
            ctx.arc(itemX, itemY, cellSize * 0.2, 0, 2*Math.PI);
            ctx.fill();
        });

        ctx.restore();
    }, [buildings, items, cellSize, viewOffset]);

    useEffect(() => {
        const animationFrame = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationFrame);
    }, [draw]);
    
    // Panning logic
    const handlePanStart = (e: React.MouseEvent) => {
        setIsPanning(true);
        setPanStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y });
    };
    const handlePanMove = (e: React.MouseEvent) => {
        if (!isPanning) return;
        setViewOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    };
    const handlePanEnd = () => setIsPanning(false);

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 text-white">
      <div className="flex items-center justify-between p-2 border-b border-slate-700">
        <h3 className="text-lg font-bold text-primary">Automation Simulator</h3>
        <div className="flex items-center gap-2">
            <Button variant={isPlaying ? 'destructive' : 'default'} onClick={() => setIsPlaying(!isPlaying)} size="sm">{isPlaying ? <Pause/>:<Play/>}</Button>
            <Button variant="outline" onClick={() => { setBuildings([]); setItems([]); }} size="sm"><RefreshCw/></Button>
             <Button variant="outline" onClick={() => setZoom(z => Math.min(z*1.2, 2))} size="sm"><ZoomIn/></Button>
            <Button variant="outline" onClick={() => setZoom(z => Math.max(z/1.2, 0.5))} size="sm"><ZoomOut/></Button>
        </div>
      </div>
      <div className="flex-grow flex">
        <div className="w-48 p-2 border-r border-slate-700 space-y-2">
            <h4 className="font-bold">Buildings</h4>
            <Button variant={selectedBuilding === 'miner' ? 'secondary' : 'outline'} onClick={() => setSelectedBuilding('miner')} className="w-full justify-start gap-2"><HardHat/> Miner</Button>
            <Button variant={selectedBuilding === 'belt' ? 'secondary' : 'outline'} onClick={() => setSelectedBuilding('belt')} className="w-full justify-start gap-2"><Box/> Belt</Button>
            <Button variant={selectedBuilding === 'assembler' ? 'secondary' : 'outline'} onClick={() => setSelectedBuilding('assembler')} className="w-full justify-start gap-2"><Cog/> Assembler</Button>
            <h4 className="font-bold pt-4">Direction (R)</h4>
             <div className="grid grid-cols-2 gap-1">
              {['up', 'down', 'left', 'right'].map(dir => (
                <Button key={dir} variant={buildingDirection === dir ? 'secondary' : 'outline'} size="sm" onClick={() => setBuildingDirection(dir as any)}>{dir}</Button>
              ))}
            </div>
        </div>
        <div className="flex-grow relative bg-background" onMouseDown={handlePanStart} onMouseMove={handlePanMove} onMouseUp={handlePanEnd} onMouseLeave={handlePanEnd}>
            <canvas ref={canvasRef} width={GRID_SIZE * 32} height={GRID_SIZE * 32} className="absolute top-0 left-0" onClick={handleCanvasClick}/>
        </div>
      </div>
    </div>
  );
};
export default FactorySimulator;
