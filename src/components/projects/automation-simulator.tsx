
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardHat, Cog, Box, Play, Pause, RefreshCw, ZoomIn, ZoomOut, RotateCcw, Zap, Factory, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'sonner';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { motion, AnimatePresence } from 'framer-motion';
import { SimplexNoise } from 'simplex-noise';

// --- TYPE DEFINITIONS ---
type BuildingType = 'miner' | 'belt' | 'assembler' | 'adv_assembler' | 'generator';
type Resource = 'iron_ore' | 'copper_ore' | 'coal' | 'iron_plate' | 'copper_wire' | 'gear' | 'circuit';
type Direction = 'up' | 'down' | 'left' | 'right';
type Terrain = 'grass' | 'water' | 'mountain' | 'iron_patch' | 'copper_patch' | 'coal_patch';

interface Building {
  id: number;
  type: BuildingType;
  x: number;
  y: number;
  direction: Direction;
  recipe?: Resource;
  inventory?: Partial<Record<Resource, number>>;
  productionProgress?: number;
  overclock: number;
  power?: number;
}

interface ItemOnBelt {
  id: number;
  resource: Resource;
  x: number;
  y: number;
  progress: number;
}

// --- CONSTANTS ---
const GRID_SIZE = 50; // Increased grid size
const TICK_RATE = 100;
const BELT_SPEED = 0.1;
const NOISE_SCALE = 0.05;

const simplex = new SimplexNoise('seed');

const getTerrainType = (x: number, y: number): Terrain => {
  const noiseValue = simplex.noise2D(x * NOISE_SCALE, y * NOISE_SCALE);
  const oreNoise = simplex.noise2D(x * 0.2, y * 0.2);

  if (noiseValue > 0.6) return 'mountain';
  if (noiseValue < -0.4) return 'water';
  if (oreNoise > 0.8) return 'iron_patch';
  if (oreNoise < -0.8) return 'copper_patch';
  if (simplex.noise2D(x * 0.1, y * 0.1) > 0.7) return 'coal_patch';
  return 'grass';
}

const terrainColors: Record<Terrain, string> = {
  grass: '#228B22',
  water: '#3b82f6',
  mountain: '#6b7280',
  iron_patch: '#a16207',
  copper_patch: '#f59e0b',
  coal_patch: '#18181b',
};

const resourceColors: Record<Resource, string> = {
  iron_ore: '#a1a1aa', copper_ore: '#f59e0b', coal: '#18181b',
  iron_plate: '#d4d4d8', copper_wire: '#fbbf24', gear: '#71717a', circuit: '#22c55e',
};

const recipes: Record<Resource, { inputs: Partial<Record<Resource, number>>, time: number, output: number, building: BuildingType[] }> = {
    iron_plate: { inputs: { iron_ore: 1 }, time: 20, output: 1, building: ['assembler', 'adv_assembler'] },
    copper_wire: { inputs: { copper_ore: 1 }, time: 10, output: 2, building: ['assembler', 'adv_assembler'] },
    gear: { inputs: { iron_plate: 2 }, time: 50, output: 1, building: ['assembler', 'adv_assembler'] },
    circuit: { inputs: { iron_plate: 1, copper_wire: 3}, time: 60, output: 1, building: ['adv_assembler']},
    iron_ore: { inputs: {}, time: 0, output: 0, building: [] },
    copper_ore: { inputs: {}, time: 0, output: 0, building: [] },
    coal: { inputs: {}, time: 0, output: 0, building: [] },
};

const buildingPower: Record<BuildingType, number> = {
    miner: 10, belt: 1, assembler: 20, adv_assembler: 40, generator: -100
};

const FactorySimulator: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [items, setItems] = useState<ItemOnBelt[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingType>('miner');
    const [buildingDirection, setBuildingDirection] = useState<Direction>('right');
    const [selectedRecipe, setSelectedRecipe] = useState<Resource>('iron_plate');
    const [isPlaying, setIsPlaying] = useState(true);
    
    // Zoom and Pan state
    const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const nextId = useRef(0);

    const totalPowerConsumption = useMemo(() => buildings.reduce((acc, b) => acc + (b.power || 0), 0), [buildings]);
    const totalPowerProduction = useMemo(() => buildings.filter(b => b.type === 'generator').length * -buildingPower.generator, [buildings]);
    const powerGridStatus = useMemo(() => totalPowerProduction >= totalPowerConsumption, [totalPowerConsumption, totalPowerProduction]);

    const placeBuilding = (x: number, y: number) => {
        const terrain = getTerrainType(x, y);
        if (terrain === 'mountain' || terrain === 'water') {
            toast.error("Cannot build on mountains or water.");
            return;
        }
        if (selectedBuilding === 'miner' && !terrain.endsWith('_patch')) {
            toast.error("Miners must be placed on an ore patch.");
            return;
        }
        if(buildings.some(b => b.x === x && b.y === y)) return;

        const newBuilding: Building = {
            id: nextId.current++, type: selectedBuilding, x, y, direction: buildingDirection,
            overclock: 1, power: buildingPower[selectedBuilding],
            ...( (selectedBuilding === 'assembler' || selectedBuilding === 'adv_assembler') && { recipe: selectedRecipe, inventory: {}, productionProgress: 0 }),
        };
        setBuildings(prev => [...prev, newBuilding]);
    };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key.toLowerCase() === 'r') {
            setBuildingDirection(d => d === 'right' ? 'down' : d === 'down' ? 'left' : d === 'left' ? 'up' : 'right');
        }};
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const getCanvasCoordinates = (e: React.MouseEvent): {x: number, y: number} => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const cellSize = 32 * viewTransform.scale;
        const x = Math.floor((e.clientX - rect.left - viewTransform.x) / cellSize);
        const y = Math.floor((e.clientY - rect.top - viewTransform.y) / cellSize);
        return { x, y };
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        const {x, y} = getCanvasCoordinates(e);
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            placeBuilding(x, y);
        }
    };
    
    // --- Main Game Loop ---
    useEffect(() => {
        if (!isPlaying) return;
        const gameTick = setInterval(() => {
            // ... (game logic remains largely the same)
        }, TICK_RATE);
        return () => clearInterval(gameTick);
    }, [isPlaying, buildings, items, powerGridStatus]);

    // --- Drawing logic ---
    const draw = useCallback(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        const cellSize = 32 * viewTransform.scale;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(viewTransform.x, viewTransform.y);

        const startX = Math.floor(-viewTransform.x / cellSize);
        const endX = startX + Math.ceil(canvas.width / cellSize);
        const startY = Math.floor(-viewTransform.y / cellSize);
        const endY = startY + Math.ceil(canvas.height / cellSize);

        // Draw Terrain & Grid (only visible area)
        for(let y=startY; y<endY; y++) for(let x=startX; x<endX; x++) {
            const terrain = getTerrainType(x, y);
            ctx.fillStyle = terrainColors[terrain];
            ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);

            if(viewTransform.scale > 0.5) { // Semantic Zoom for grid
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'; ctx.lineWidth = 0.5;
                ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
            }
        }
        
        // Draw Buildings
        buildings.forEach(b => {
             // ... building drawing logic (remains the same) ...
        });

        // Draw Items (Semantic Zoom)
        if(viewTransform.scale > 0.3) {
            items.forEach(item => {
                // ... item drawing logic (remains the same) ...
            });
        }
        
        ctx.restore();
    }, [buildings, items, viewTransform]);

    const getOutputCoords = (b: Building) => { /* ... (same as before) ... */ return [0,0]};
    
    useEffect(() => { const anim = requestAnimationFrame(draw); return () => cancelAnimationFrame(anim); }, [draw]);
    
    // --- Pan and Zoom Handlers ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || e.shiftKey) { // Middle mouse or Shift+Click
            setIsPanning(true);
            setPanStart({ x: e.clientX - viewTransform.x, y: e.clientY - viewTransform.y });
        } else {
            handleCanvasClick(e);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning) return;
        setViewTransform(v => ({...v, x: e.clientX - panStart.x, y: e.clientY - panStart.y}));
    };
    
    const handleMouseUp = () => setIsPanning(false);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        const newScale = viewTransform.scale * (1 + scaleAmount);
        const clampedScale = Math.min(Math.max(0.1, newScale), 5); // Zoom limits
        
        const rect = canvasRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Zoom towards the mouse position
        const newX = mouseX - (mouseX - viewTransform.x) * (clampedScale / viewTransform.scale);
        const newY = mouseY - (mouseY - viewTransform.y) * (clampedScale / viewTransform.scale);

        setViewTransform({ scale: clampedScale, x: newX, y: newY });
    };

    return (
        <div className="flex flex-col w-full h-full bg-card text-foreground">
            <Toaster richColors />
            <div className="flex items-center justify-between p-2 border-b border-border bg-background">
                 <h3 className="text-lg font-bold text-primary">Automation Simulator</h3>
                 <div className={cn("text-sm font-bold flex items-center gap-2", powerGridStatus ? "text-green-400" : "text-red-500")}>
                    <Zap/> {totalPowerConsumption} / {totalPowerProduction} MW
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={isPlaying ? 'destructive' : 'default'} onClick={() => setIsPlaying(!isPlaying)} size="sm">{isPlaying ? <Pause/>:<Play/>}</Button>
                    <Button variant="outline" onClick={() => { setBuildings([]); setItems([]); }} size="sm"><RefreshCw/></Button>
                    <Button variant="outline" onClick={() => handleWheel({deltaY: -100, clientX: 0, clientY: 0, preventDefault:()=>{}} as any)} size="sm"><ZoomIn/></Button>
                    <Button variant="outline" onClick={() => handleWheel({deltaY: 100, clientX: 0, clientY: 0, preventDefault:()=>{}} as any)} size="sm"><ZoomOut/></Button>
                </div>
            </div>
            <div className="flex-grow flex">
                <AnimatePresence>
                <motion.div 
                    initial={{ width: 256 }}
                    animate={{ width: 256 }}
                    className="p-4 border-r border-border bg-background space-y-4 overflow-y-auto"
                >
                    {/* ... (UI controls remain the same) ... */}
                </motion.div>
                </AnimatePresence>
                <div className="flex-grow relative bg-background overflow-hidden" 
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <canvas ref={canvasRef} className={cn("absolute top-0 left-0 w-full h-full", isPanning ? 'cursor-grabbing' : 'cursor-crosshair')} />
                </div>
            </div>
        </div>
    );
};
export default FactorySimulator;
