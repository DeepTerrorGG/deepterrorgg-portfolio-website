'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardHat, Cog, Box, Play, Pause, RefreshCw, ZoomIn, ZoomOut, RotateCcw, Zap, Factory, HelpCircle, Warehouse, Hammer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

// --- TYPE DEFINITIONS ---
type BuildingType = 'miner' | 'belt' | 'assembler' | 'adv_assembler' | 'generator' | 'chest';
type Resource = 'iron_ore' | 'copper_ore' | 'coal' | 'iron_plate' | 'copper_wire' | 'gear' | 'circuit' | 'belt' | 'miner' | 'assembler';
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
  overclock: number; // 1 = 100% speed
  power?: number; // current power consumption/production
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

const BELT_SPEEDS = { 1: 0.1, 2: 0.2, 3: 0.4 };

const resourceColors: Record<Resource, string> = {
  iron_ore: '#a1a1aa',
  copper_ore: '#f59e0b',
  coal: '#18181b',
  iron_plate: '#d4d4d8',
  copper_wire: '#fbbf24',
  gear: '#71717a',
  circuit: '#22c55e',
  // Craftable items (buildings) don't need colors as they aren't on belts
  belt: '', miner: '', assembler: '',
};

const resourcePatches: Record<string, Resource> = {
    '5,5': 'iron_ore', '6,5': 'iron_ore', '5,6': 'iron_ore',
    '20,20': 'copper_ore', '21,20': 'copper_ore', '20,21': 'copper_ore',
    '10,25': 'coal', '11,25': 'coal', '10,26': 'coal',
};

type RecipeDefinition = { inputs: Partial<Record<Resource, number>>, time: number, output: number, building: BuildingType[] };

const recipes: Partial<Record<Resource, RecipeDefinition>> = {
    iron_plate: { inputs: { iron_ore: 1 }, time: 20, output: 1, building: ['assembler', 'adv_assembler'] },
    copper_wire: { inputs: { copper_ore: 1 }, time: 10, output: 2, building: ['assembler', 'adv_assembler'] },
    gear: { inputs: { iron_plate: 2 }, time: 50, output: 1, building: ['assembler', 'adv_assembler'] },
    circuit: { inputs: { iron_plate: 1, copper_wire: 3}, time: 60, output: 1, building: ['adv_assembler']},
};

const buildingCosts: Partial<Record<BuildingType, Partial<Record<Resource, number>>>> = {
    belt: { iron_plate: 1 },
    miner: { iron_plate: 3, gear: 2 },
    assembler: { gear: 4, circuit: 2 },
    chest: { iron_plate: 4 },
    generator: { iron_plate: 5, gear: 3 },
};

const buildingPower: Record<BuildingType, number> = {
    miner: 10,
    belt: 1,
    assembler: 20,
    adv_assembler: 40,
    generator: -100, // negative means production
    chest: 0,
}

const FactorySimulator: React.FC = () => {
    const { toast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [items, setItems] = useState<ItemOnBelt[]>([]);
    const [inventory, setInventory] = useState<Partial<Record<Resource, number>>>({ iron_plate: 20, gear: 5 });
    
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingType>('belt');
    const [buildingDirection, setBuildingDirection] = useState<Direction>('right');
    const [beltTier, setBeltTier] = useState<1|2|3>(1);
    const [selectedRecipe, setSelectedRecipe] = useState<Resource>('iron_plate');
    const [isPlaying, setIsPlaying] = useState(true);
    const [zoom, setZoom] = useState(1);
    const cellSize = useMemo(() => 32 * zoom, [zoom]);
    const nextId = useRef(0);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });

    const totalPowerConsumption = useMemo(() => buildings.reduce((acc, b) => acc + (b.power || 0), 0), [buildings]);
    const totalPowerProduction = useMemo(() => buildings.filter(b => b.type === 'generator').length * -buildingPower.generator, [buildings]);
    const powerGridStatus = useMemo(() => totalPowerProduction >= totalPowerConsumption, [totalPowerConsumption, totalPowerProduction]);

    const placeBuilding = (x: number, y: number) => {
        if(buildings.some(b => b.x === x && b.y === y)) return;

        const cost = buildingCosts[selectedBuilding];
        if (cost) {
            for (const [resource, amount] of Object.entries(cost)) {
                if ((inventory[resource as Resource] || 0) < amount) {
                    toast({ title: 'Not enough resources', description: `You need ${amount} ${resource} to build a ${selectedBuilding}.`, variant: 'destructive'});
                    return;
                }
            }
            // Deduct resources
            const newInventory = {...inventory};
            for (const [resource, amount] of Object.entries(cost)) {
                newInventory[resource as Resource]! -= amount;
            }
            setInventory(newInventory);
        } else {
             // For buildings without cost, we check if they are in inventory
            if((inventory[selectedBuilding as Resource] || 0) < 1) {
                toast({ title: 'No building in inventory', description: `You need to craft a ${selectedBuilding} first.`, variant: 'destructive'});
                return;
            }
            setInventory(inv => ({...inv, [selectedBuilding as Resource]: (inv[selectedBuilding as Resource] || 0) - 1}));
        }


        const newBuilding: Building = {
            id: nextId.current++,
            type: selectedBuilding, x, y,
            direction: buildingDirection,
            overclock: 1,
            power: buildingPower[selectedBuilding],
            inventory: {}, 
            ...( (selectedBuilding === 'assembler' || selectedBuilding === 'adv_assembler') && { recipe: selectedRecipe, productionProgress: 0 }),
        };
        setBuildings(prev => [...prev, newBuilding]);
    };
    
    const handCraft = (building: BuildingType) => {
        const cost = buildingCosts[building];
        if (!cost) {
            toast({title: 'Cannot be crafted', description: `This item cannot be hand-crafted.`});
            return;
        }

        for (const [resource, amount] of Object.entries(cost)) {
            if ((inventory[resource as Resource] || 0) < amount) {
                toast({ title: 'Not enough resources', description: `You need ${amount} ${resource}.`, variant: 'destructive'});
                return;
            }
        }
        
        const newInventory = {...inventory};
        for (const [resource, amount] of Object.entries(cost)) {
            newInventory[resource as Resource]! -= amount;
        }
        newInventory[building as Resource] = (newInventory[building as Resource] || 0) + 1;
        setInventory(newInventory);
        toast({title: 'Crafted!', description: `You crafted 1x ${building}.`});
    }

    const rotateBuilding = useCallback(() => {
        setBuildingDirection(d => d === 'right' ? 'down' : d === 'down' ? 'left' : d === 'left' ? 'up' : 'right');
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key.toLowerCase() === 'r') {
            rotateBuilding();
        }};
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [rotateBuilding]);

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
            const hasPower = powerGridStatus;
            setBuildings(currentBuildings => {
                const updatedBuildings = [...currentBuildings];
                const currentItems = [...items];
                const newItems: ItemOnBelt[] = [];
                
                updatedBuildings.forEach(b => {
                    b.power = buildingPower[b.type] * b.overclock;
                    if (!hasPower && b.type !== 'generator') return; // No power, no work

                    // Miner Production
                    if (b.type === 'miner') {
                        const resource = resourcePatches[`${b.x},${b.y}`];
                        if (resource && Math.random() < 0.1 * b.overclock) {
                            const [ox, oy] = getOutputCoords(b);
                            if (!currentItems.some(i => i.x === ox && i.y === oy && i.progress < BELT_SPEEDS[beltTier])) {
                                newItems.push({ id: nextId.current++, resource, x: ox, y: oy, progress: 0 });
                            }
                        }
                    }
                    // Assembler Logic
                    if ((b.type === 'assembler' || b.type === 'adv_assembler') && b.recipe) {
                        const recipe = recipes[b.recipe];
                        if(!recipe) return;
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
                            b.productionProgress = (b.productionProgress || 0) + b.overclock;
                            if (b.productionProgress >= recipe.time) {
                                // 3. Eject
                                const [ox, oy] = getOutputCoords(b);
                                if (!currentItems.some(i => i.x === ox && i.y === oy && i.progress < BELT_SPEEDS[beltTier])) {
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
                    const belt = buildings.find(b => b.x === item.x && b.y === item.y);
                    if (!belt || (belt.type !== 'belt' && belt.type !== 'miner' && belt.type !== 'assembler' && belt.type !== 'adv_assembler' && belt.type !== 'chest')) {
                      movedItems.push(item); return; 
                    }

                    // Handle chest input
                    if (belt.type === 'chest') {
                        if (Object.values(belt.inventory || {}).reduce((s, a) => s+a, 0) < 50) { // Chest capacity
                             belt.inventory = belt.inventory || {};
                             belt.inventory[item.resource] = (belt.inventory[item.resource] || 0) + 1;
                             // Item consumed, don't add to movedItems
                        } else {
                             movedItems.push({ ...item, progress: 1 }); // Belt is backed up
                        }
                        return;
                    }
                    
                    const [nextX, nextY] = getOutputCoords(belt);
                    
                    let newProgress = item.progress + BELT_SPEEDS[beltTier];
                    if(newProgress >= 1) {
                        const nextTile = buildings.find(b => b.x === nextX && b.y === nextY);
                        const isNextTileOccupied = currentItems.some(i => i.id !== item.id && i.x === nextX && i.y === nextY && i.progress < BELT_SPEEDS[beltTier]) || movedItems.some(i => i.x === nextX && i.y === nextY);
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
    }, [isPlaying, buildings, items, powerGridStatus, beltTier]);

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
            ctx.fillStyle = b.type === 'miner' ? '#4f46e5' : b.type === 'belt' ? '#64748b' : b.type === 'generator' ? '#facc15' : b.type === 'adv_assembler' ? '#0f766e' : b.type === 'chest' ? '#ca8a04' : '#0d9488';
            ctx.fillRect(b.x*cellSize, b.y*cellSize, cellSize, cellSize);
            
            const centerX = b.x*cellSize + cellSize/2, centerY = b.y*cellSize + cellSize/2;
            const drawArrow = (angle: number) => {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(angle);
                ctx.fillStyle = 'white'; ctx.beginPath();
                ctx.moveTo(-5*zoom, -5*zoom); ctx.lineTo(5*zoom, 0); ctx.lineTo(-5*zoom, 5*zoom);
                ctx.closePath(); ctx.fill();
                ctx.restore();
            }
            if(b.type === 'belt' || b.type === 'miner' || b.type === 'assembler' || b.type === 'adv_assembler') {
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
    }, [buildings, items, cellSize, viewOffset, zoom]);

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
        <div className="flex flex-col w-full h-full bg-card text-foreground">
            <div className="flex items-center justify-between p-2 border-b border-border bg-background">
                <h3 className="text-lg font-bold text-primary">Automation Simulator</h3>
                <div className={cn("text-sm font-bold flex items-center gap-2", powerGridStatus ? "text-green-400" : "text-red-500")}>
                    <Zap/> {totalPowerConsumption} / {totalPowerProduction} MW
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={isPlaying ? 'destructive' : 'default'} onClick={() => setIsPlaying(!isPlaying)} size="sm">{isPlaying ? <Pause/>:<Play/>}</Button>
                    <Button variant="outline" onClick={() => { setBuildings([]); setItems([]); setInventory({ iron_plate: 20, gear: 5 }); }} size="sm"><RefreshCw/></Button>
                    <Button variant="outline" onClick={() => setZoom(z => Math.min(z*1.2, 2))} size="sm"><ZoomIn/></Button>
                    <Button variant="outline" onClick={() => setZoom(z => Math.max(z/1.2, 0.5))} size="sm"><ZoomOut/></Button>
                </div>
            </div>
            <div className="flex-grow flex">
                <div className="w-64 p-2 border-r border-border bg-background space-y-2">
                    <Card><CardHeader className='p-2'><CardTitle className='text-base'>Inventory</CardTitle></CardHeader>
                        <CardContent className='p-2 text-xs space-y-1'>
                            {Object.entries(inventory).map(([res, count]) => count > 0 && <p key={res}>{res}: {count}</p>)}
                        </CardContent>
                    </Card>
                    <Card><CardHeader className='p-2'><CardTitle className='text-base'>Hand Crafting</CardTitle></CardHeader>
                        <CardContent className="p-2 space-y-1">
                            {Object.entries(buildingCosts).map(([building, cost]) => (
                                <Button key={building} variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => handCraft(building as BuildingType)}><Hammer size={14}/> {building}</Button>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className='p-2'><CardTitle className='text-base'>Buildings</CardTitle></CardHeader>
                        <CardContent className="p-2 space-y-2">
                            <Button variant={selectedBuilding === 'generator' ? 'secondary' : 'outline'} onClick={() => setSelectedBuilding('generator')} className="w-full justify-start gap-2"><Zap/> Generator</Button>
                            <Button variant={selectedBuilding === 'miner' ? 'secondary' : 'outline'} onClick={() => setSelectedBuilding('miner')} className="w-full justify-start gap-2"><HardHat/> Miner</Button>
                            <Button variant={selectedBuilding === 'belt' ? 'secondary' : 'outline'} onClick={() => setSelectedBuilding('belt')} className="w-full justify-start gap-2"><Box/> Belt</Button>
                            <Button variant={selectedBuilding === 'chest' ? 'secondary' : 'outline'} onClick={() => setSelectedBuilding('chest')} className="w-full justify-start gap-2"><Warehouse/> Chest</Button>
                            <div className="pl-4">
                                <Label>Belt Tier: {beltTier}</Label>
                                <Slider min={1} max={3} step={1} value={[beltTier]} onValueChange={v => setBeltTier(v[0] as 1|2|3)}/>
                            </div>
                            <Button variant={selectedBuilding === 'assembler' ? 'secondary' : 'outline'} onClick={() => setSelectedBuilding('assembler')} className="w-full justify-start gap-2"><Cog/> Assembler</Button>
                            <Button variant={selectedBuilding === 'adv_assembler' ? 'secondary' : 'outline'} onClick={() => setSelectedBuilding('adv_assembler')} className="w-full justify-start gap-2"><Factory/> Adv. Assembler</Button>
                            {(selectedBuilding === 'assembler' || selectedBuilding === 'adv_assembler') && (
                                <div className="pl-4 space-y-1">
                                <Label>Recipe</Label>
                                {Object.keys(recipes).filter(r => recipes[r as Resource]?.building.includes(selectedBuilding)).map(recipe => (
                                    <Button key={recipe} size="sm" variant={selectedRecipe === recipe ? 'secondary' : 'ghost'} onClick={() => setSelectedRecipe(recipe as Resource)} className="w-full justify-start text-xs">{recipe}</Button>
                                ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className='p-2'><CardTitle className='text-base'>Controls</CardTitle></CardHeader>
                        <CardContent className="p-2 space-y-2">
                            <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" onClick={rotateBuilding}>
                                    <RotateCcw className={cn(
                                        'transition-transform',
                                        buildingDirection === 'down' && 'rotate-90',
                                        buildingDirection === 'left' && 'rotate-180',
                                        buildingDirection === 'up' && 'rotate-[-90deg]'
                                    )}/>
                                </Button>
                                <span className="text-sm">Rotate (R key)</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex-grow relative bg-background overflow-hidden" onMouseDown={handlePanStart} onMouseMove={handlePanMove} onMouseUp={handlePanEnd} onMouseLeave={handlePanEnd}>
                    <canvas ref={canvasRef} width={GRID_SIZE * 32} height={GRID_SIZE * 32} onClick={handleCanvasClick} className={cn("absolute top-0 left-0", isPanning ? 'cursor-grabbing' : 'cursor-crosshair')} />
                </div>
            </div>
        </div>
    );
};
export default FactorySimulator;
