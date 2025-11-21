
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardHat, Cog, Box, Play, Pause, RefreshCw, ZoomIn, ZoomOut, Hand, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// --- TYPE DEFINITIONS ---
type BuildingType = 'miner' | 'belt' | 'assembler';
type Resource = 'iron_ore' | 'copper_ore' | 'iron_plate' | 'copper_wire' | 'gear';
type Direction = 'up' | 'down' | 'left' | 'right';

interface Building {
  id: number;
  type: BuildingType;
  x: number;
  y: number;
  direction: Direction;
  recipe?: Resource; // For assemblers
  inventory?: Partial<Record<Resource, number>>;
  productionProgress?: number;
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

const resourcePatches: Record<string, Resource> = {
    '5,5': 'iron_ore', '6,5': 'iron_ore', '5,6': 'iron_ore',
    '20,20': 'copper_ore', '21,20': 'copper_ore', '20,21': 'copper_ore',
};

const recipes: Record<Resource, { inputs: Partial<Record<Resource, number>>, time: number, output: number }> = {
    iron_plate: { inputs: { iron_ore: 1 }, time: 20, output: 1 },
    copper_wire: { inputs: { copper_ore: 1 }, time: 10, output: 2 },
    gear: { inputs: { iron_plate: 2 }, time: 50, output: 1 },
    // required to make the type checker happy
    iron_ore: { inputs: {}, time: 0, output: 0 },
    copper_ore: { inputs: {}, time: 0, output: 0 },
};

const FactorySimulator: React.FC = () => {
    const { toast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [items, setItems] = useState<ItemOnBelt[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingType>('miner');
    const [buildingDirection, setBuildingDirection] = useState<Direction>('right');
    const [selectedRecipe, setSelectedRecipe] = useState<Resource>('iron_plate');
    const [isPlaying, setIsPlaying] = useState(true);
    const [zoom, setZoom] = useState(1);
    const cellSize = useMemo(() => 32 * zoom, [zoom]);
    const nextId = useRef(0);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });

    const placeBuilding = (x: number, y: number) => {
        if(buildings.some(b => b.x === x && b.y === y)) return;
        const newBuilding: Building = {
            id: nextId.current++,
            type: selectedBuilding, x, y,
            direction: buildingDirection,
            ...(selectedBuilding === 'assembler' && { recipe: selectedRecipe, inventory: {}, productionProgress: 0 })
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

    const handleCanvasClick = (e: React.MouseEvent) => {
        if(isPanning) return;
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
            setBuildings(currentBuildings => {
                const updatedBuildings = [...currentBuildings];
                const currentItems = [...items];
                const newItems: ItemOnBelt[] = [];
                
                updatedBuildings.forEach(b => {
                    // Miner Production
                    if (b.type === 'miner') {
                        const resource = resourcePatches[`${b.x},${b.y}`];
                        if (resource && Math.random() < 0.1) {
                            const [ox, oy] = getOutputCoords(b);
                            if (!currentItems.some(i => i.x === ox && i.y === oy && i.progress < BELT_SPEED)) {
                                newItems.push({ id: nextId.current++, resource, x: ox, y: oy, progress: 0 });
                            }
                        }
                    }
                    // Assembler Logic
                    if (b.type === 'assembler' && b.recipe) {
                        const recipe = recipes[b.recipe];
                        // 1. Grab ingredients
                        getAdjacentInputCoords(b).forEach(([ix, iy]) => {
                            const ingredient = currentItems.find(item => item.x === ix && item.y === iy && item.progress >= 1);
                            if (ingredient && Object.keys(recipe.inputs).includes(ingredient.resource)) {
                                b.inventory = b.inventory || {};
                                const currentAmount = b.inventory[ingredient.resource] || 0;
                                if (currentAmount < 10) { // Limit inventory
                                    b.inventory[ingredient.resource] = currentAmount + 1;
                                    setItems(prev => prev.filter(i => i.id !== ingredient.id));
                                }
                            }
                        });
                        // 2. Craft
                        let canCraft = true;
                        for (const [res, amount] of Object.entries(recipe.inputs)) {
                            if ((b.inventory?.[res as Resource] || 0) < amount) {
                                canCraft = false; break;
                            }
                        }
                        if (canCraft) {
                            b.productionProgress = (b.productionProgress || 0) + 1;
                            if (b.productionProgress >= recipe.time) {
                                // 3. Eject
                                const [ox, oy] = getOutputCoords(b);
                                if (!currentItems.some(i => i.x === ox && i.y === oy && i.progress < BELT_SPEED)) {
                                    newItems.push({ id: nextId.current++, resource: b.recipe, x: ox, y: oy, progress: 0 });
                                    for (const [res, amount] of Object.entries(recipe.inputs)) {
                                        b.inventory![res as Resource]! -= amount;
                                    }
                                    b.productionProgress = 0;
                                }
                            }
                        } else {
                            b.productionProgress = 0;
                        }
                    }
                });
                setItems(prev => [...prev, ...newItems]);
                return updatedBuildings;
            });

            // Item Movement on Belts
            setItems(currentItems => {
                const movedItems: ItemOnBelt[] = [];
                currentItems.forEach(item => {
                    const belt = buildings.find(b => b.x === item.x && b.y === item.y && (b.type === 'belt' || b.type === 'miner' || b.type === 'assembler'));
                    if (!belt) { return; } // Item is on a non-belt tile, gets stuck or deleted
                    
                    const [nextX, nextY] = getOutputCoords(belt);
                    
                    let newProgress = item.progress + BELT_SPEED;
                    if(newProgress >= 1) {
                        const nextTile = buildings.find(b => b.x === nextX && b.y === nextY);
                        const isNextTileOccupied = currentItems.some(i => i.id !== item.id && i.x === nextX && i.y === nextY && i.progress < BELT_SPEED) || movedItems.some(i => i.x === nextX && i.y === nextY);
                        if (nextTile && !isNextTileOccupied) {
                            movedItems.push({ ...item, x: nextX, y: nextY, progress: newProgress - 1 });
                        } else {
                             movedItems.push({ ...item, progress: 1 });
                        }
                    } else {
                        movedItems.push({ ...item, progress: newProgress });
                    }
                });
                return movedItems;
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

        // Draw Patches & Grid
        for(let y=0; y<GRID_SIZE; y++) for(let x=0; x<GRID_SIZE; x++) {
            const resource = resourcePatches[`${x},${y}`];
            if (resource) {
                ctx.fillStyle = resourceColors[resource] + '33'; // transparent
                ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
            }
            ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 0.5;
            ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
        }

        // Draw Buildings
        buildings.forEach(b => {
            ctx.fillStyle = b.type === 'miner' ? '#4f46e5' : b.type === 'belt' ? '#64748b' : '#0d9488';
            ctx.fillRect(b.x*cellSize, b.y*cellSize, cellSize, cellSize);
            
            const centerX = b.x*cellSize + cellSize/2, centerY = b.y*cellSize + cellSize/2;
            const drawArrow = (angle: number) => {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(angle);
                ctx.fillStyle = 'white'; ctx.beginPath();
                ctx.moveTo(-5, -5); ctx.lineTo(5, 0); ctx.lineTo(-5, 5);
                ctx.closePath(); ctx.fill();
                ctx.restore();
            }
            if(b.type === 'belt' || b.type === 'miner' || b.type === 'assembler') {
                if(b.direction === 'right') drawArrow(0);
                if(b.direction === 'down') drawArrow(Math.PI/2);
                if(b.direction === 'left') drawArrow(Math.PI);
                if(b.direction === 'up') drawArrow(-Math.PI/2);
            }
        });

        // Draw Items
        items.forEach(item => {
            const currentTile = buildings.find(b => b.x === item.x && b.y === item.y);
            let itemX = item.x * cellSize + cellSize / 2, itemY = item.y * cellSize + cellSize / 2;

            if(currentTile){
                const [nextX, nextY] = getOutputCoords(currentTile);
                const startX = item.x * cellSize + cellSize / 2, startY = item.y * cellSize + cellSize / 2;
                const endX = nextX * cellSize + cellSize / 2, endY = nextY * cellSize + cellSize / 2;
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

    const getOutputCoords = (b: Building) => {
        let {x, y} = b;
        if(b.direction === 'right') x++; if(b.direction === 'left') x--;
        if(b.direction === 'down') y++; if(b.direction === 'up') y--;
        return [x,y];
    }

    const getAdjacentInputCoords = (b: Building) => {
        const {x, y, direction} = b;
        const coords = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
        const output = getOutputCoords(b);
        return coords.filter(([ix, iy]) => !(ix === output[0] && iy === output[1]));
    }
    
    useEffect(() => { const anim = requestAnimationFrame(draw); return () => cancelAnimationFrame(anim); }, [draw]);
    
    const handlePanStart = (e: React.MouseEvent) => { setIsPanning(true); setPanStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y }); };
    const handlePanMove = (e: React.MouseEvent) => { if (!isPanning) return; setViewOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y }); };
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
                    {selectedBuilding === 'assembler' && (
                        <div className="pl-4">
                           {Object.keys(recipes).filter(r => r !== 'iron_ore' && r !== 'copper_ore').map(recipe => (
                               <Button key={recipe} size="sm" variant={selectedRecipe === recipe ? 'secondary' : 'ghost'} onClick={() => setSelectedRecipe(recipe as Resource)}>{recipe}</Button>
                           ))}
                        </div>
                    )}
                    <h4 className="font-bold pt-4">Direction (R)</h4>
                    <div className="flex justify-center">
                        <Button size="icon" variant="outline" onClick={() => setBuildingDirection(d => d === 'right' ? 'down' : d === 'down' ? 'left' : d === 'left' ? 'up' : 'right')}>
                            <RotateCcw/>
                        </Button>
                    </div>
                </div>
                <div className="flex-grow relative bg-background overflow-hidden" onMouseDown={handlePanStart} onMouseMove={handlePanMove} onMouseUp={handlePanEnd} onMouseLeave={handlePanEnd}>
                    <canvas ref={canvasRef} width={GRID_SIZE * 32} height={GRID_SIZE * 32} onClick={handleCanvasClick} className="absolute top-0 left-0" />
                </div>
            </div>
        </div>
    );
};
export default FactorySimulator;
