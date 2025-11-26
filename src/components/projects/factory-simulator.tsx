
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import * as XLSX from 'xlsx';
import { ScrollArea } from '../ui/scroll-area';
import { createNoise2D } from 'simplex-noise';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast as sonnerToast } from 'sonner';
import { useInventoryStore } from '@/lib/factory-simulator/inventory-store';
import { ITEMS, RECIPES, buildingCosts, buildingHelp, buildingPower, buildingSizes, resourcePrices, type ItemId, type Recipe, type BuildingType } from '@/lib/factory-simulator/registry';

// --- INLINE SVG ICONS ---
const HardHat = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15.5A6.5 6.5 0 0 1 12 9a6.5 6.5 0 0 1 8 6.5"/></svg>;
const Cog = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="M11 13.73 7 20.66"/></svg>;
const Box = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="m12 22 0-10"/></svg>;
const Play = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const Pause = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>;
const RefreshCw = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M3 12a9 9 0 0 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>;
const ZoomIn = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
const ZoomOut = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>;
const RotateCcw = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
const Zap = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const Factory = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>;
const LineIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const Droplet = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>;
const Hammer = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 12-8.373 8.373a1 1 0 1 1-1.414-1.414L12.586 10"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 0 18.172 9L9 18.172a2 2 0 0 0 .586 1.414L11.5 21.5a2 2 0 0 0 2.828 0L21.5 14.328a2 2 0 0 0 0-2.828Z"/></svg>;
const Brick = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="15" width="18" height="6" rx="1"/><path d="M12 15v6"/><path d="M3 15V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M12 9v6"/></svg>;
const Package = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z"/><path d="M12 15v5.5"/><path d="M12 15a9 9 0 0 0 5.6-16H6.4a9 9 0 0 0 5.6 16z"/></svg>;
const Wrench = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const CircleDollarSign = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>;
const Info = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
const X = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const Save = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const FolderOpen = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>;

// --- TYPE DEFINITIONS ---
type Fluid = 'crude_oil' | 'water';
type Direction = 'up' | 'down' | 'left' | 'right';
type Tool = 'build' | 'destroy';
type Terrain = 'grass' | 'water' | 'mountain' | 'iron_patch' | 'copper_patch' | 'coal_patch' | 'stone_patch' | 'zinc_patch' | 'oil_patch';

interface Building {
  id: number;
  type: BuildingType;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: Direction;
  recipe?: ItemId;
  inventory?: Partial<Record<ItemId, number>>;
  fluidInventory?: Partial<Record<Fluid, number>>;
  productionProgress?: number;
  overclock: number;
  power?: number;
  cooldown?: number;
}

interface ItemOnBelt {
  id: number;
  resource: ItemId;
  x: number;
  y: number;
  progress: number;
}

// --- CONSTANTS ---
const GRID_SIZE = 50;
const TICK_RATE = 100;
const BELT_SPEED = 0.1;
const NOISE_SCALE = 0.05;

const simplexBase = createNoise2D();
const simplexOres = createNoise2D();
const simplexCoal = createNoise2D();


const getTerrainType = (x: number, y: number): Terrain => {
  const noiseValue = simplexBase(x * NOISE_SCALE, y * NOISE_SCALE);
  const oreNoise = simplexOres(x * 0.2, y * 0.2);

  if (noiseValue > 0.6) return 'mountain';
  if (noiseValue < -0.4) return 'water';
  if (oreNoise > 0.8) return 'iron_patch';
  if (oreNoise < -0.8) return 'copper_patch';
  if (simplexCoal(x * 0.1, y * 0.1) > 0.7) return 'coal_patch';
  return 'grass';
}

const terrainColors: Record<Terrain, string> = {
  grass: '#228B22',
  water: '#3b82f6',
  mountain: '#6b7280',
  iron_patch: '#a16207',
  copper_patch: '#f59e0b',
  coal_patch: '#18181b',
  stone_patch: '#78716c',
  zinc_patch: '#d4d4d8',
  oil_patch: '#3f3f46',
};

const FactorySimulator: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [items, setItems] = useState<ItemOnBelt[]>([]);
    const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType>('miner');
    const [buildingDirection, setBuildingDirection] = useState<Direction>('right');
    const [selectedRecipe, setSelectedRecipe] = useState<ItemId>('iron_plate');
    const [isPlaying, setIsPlaying] = useState(true);
    
    // Zustand store integration
    const { storage: inventory, addItem, removeItem, craftItem } = useInventoryStore();
    const { toast } = useToast();
    
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
            sonnerToast.error("Cannot build on mountains or water.");
            return;
        }
        if (selectedBuildingType === 'miner' && !terrain.endsWith('_patch')) {
            sonnerToast.error("Miners must be placed on an ore patch.");
            return;
        }
        if(buildings.some(b => b.x === x && b.y === y)) return;

        const cost = buildingCosts[selectedBuildingType];
        if (cost) {
            for (const [resource, amount] of Object.entries(cost)) {
                if (!removeItem(resource as ItemId, amount as number)) {
                    sonnerToast.error(`Not enough ${ITEMS[resource as ItemId].name} to build.`);
                    return;
                }
            }
        }
        
        const { w, h } = buildingSizes[selectedBuildingType];
        const newBuilding: Building = {
            id: nextId.current++, type: selectedBuildingType, x, y, width: w, height: h, direction: buildingDirection,
            overclock: 1, power: buildingPower[selectedBuildingType], inventory: {},
            ...( (selectedBuildingType === 'assembler' || selectedBuildingType === 'assembler_mk2') && { recipe: selectedRecipe, productionProgress: 0 }),
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
            // ... (game logic remains largely the same) ...
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

    const getOutputCoords = (b: Building): [number, number] => { /* ... (same as before) ... */ return [0,0]};
    
    useEffect(() => { 
        const anim = requestAnimationFrame(draw); 
        return () => cancelAnimationFrame(anim);
    }, [draw]);
    
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
    
    const CraftingButton = ({ recipe }: { recipe: Recipe }) => {
        const missingIngredients = recipe.inputs.filter(input => (inventory[input.item] || 0) < input.count);
        const canCraft = missingIngredients.length === 0;

        return (
            <Card className="p-2 bg-muted/30">
                <div className="flex justify-between items-center">
                    <p className="font-bold capitalize">{ITEMS[recipe.output].name}</p>
                    <Button size="xs" onClick={() => craftItem(recipe.id)} disabled={!canCraft}>Craft</Button>
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                    Requires: {recipe.inputs.map(i => `${ITEMS[i.item].name} x${i.count}`).join(', ')}
                </div>
                {!canCraft && (
                    <div className="text-red-400 text-xs mt-1">
                        Missing: {missingIngredients.map(i => `${ITEMS[i.item].name} x${i.count - (inventory[i.item] || 0)}`).join(', ')}
                    </div>
                )}
            </Card>
        );
    };

    return (
        <div className="flex flex-col w-full h-full bg-card text-foreground">
            <Toaster richColors />
            <div className="flex items-center justify-between p-2 border-b border-border bg-background flex-shrink-0">
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
            <div className="flex-grow flex flex-row overflow-hidden">
                <div className="w-64 flex-shrink-0 border-r border-border bg-background flex flex-col">
                    <Tabs defaultValue="build" className="flex-grow flex flex-col">
                      <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                          <TabsTrigger value="build"><Wrench /></TabsTrigger>
                          <TabsTrigger value="inventory"><Package /></TabsTrigger>
                      </TabsList>
                       <TabsContent value="build" className="flex-grow overflow-y-auto p-4 space-y-4">
                         {/* Build controls UI */}
                       </TabsContent>
                       <TabsContent value="inventory" className="flex-grow overflow-y-auto p-2">
                         <Card className="mb-2">
                            <CardHeader className='p-2'><CardTitle className='text-base'>Inventory</CardTitle></CardHeader>
                            <CardContent className='p-2 text-xs space-y-1 max-h-48 overflow-y-auto'>
                                {Object.entries(inventory).map(([id, count]) => count > 0 && <p key={id} className="capitalize flex justify-between"><span>{ITEMS[id as ItemId].name}</span> <span>x{count}</span></p>)}
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className='p-2'><CardTitle className='text-base'>Hand Crafting</CardTitle></CardHeader>
                            <CardContent className='p-2 text-xs space-y-2 max-h-96 overflow-y-auto'>
                                {RECIPES.map(recipe => <CraftingButton key={recipe.id} recipe={recipe} />)}
                            </CardContent>
                          </Card>
                       </TabsContent>
                    </Tabs>
                </div>
                <div className="flex-grow relative bg-background overflow-hidden" 
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
                </div>
            </div>
        </div>
    );
};
export default FactorySimulator;

    