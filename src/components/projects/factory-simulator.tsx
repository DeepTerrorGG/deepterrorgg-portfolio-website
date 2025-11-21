
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardHat, Cog, Box, Play, Pause, RefreshCw, ZoomIn, ZoomOut, RotateCcw, Zap, Factory, HelpCircle, Warehouse, Hammer, ShoppingCart, DollarSign, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// --- TYPE DEFINITIONS ---
type BuildingType = 'miner' | 'belt' | 'assembler' | 'adv_assembler' | 'generator' | 'chest';
type Resource = 'iron_ore' | 'copper_ore' | 'coal' | 'iron_plate' | 'copper_wire' | 'gear' | 'circuit' | 'belt' | 'miner' | 'assembler' | 'adv_assembler';
type Direction = 'up' | 'down' | 'left' | 'right';

interface Building {
  id: number;
  type: BuildingType;
  x: number;
  y: number;
  width: number;
  height: number;
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
const GRID_SIZE = 40;
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
  belt: '', miner: '', assembler: '', adv_assembler: '',
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
    adv_assembler: { gear: 8, circuit: 8 },
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

const buildingSizes: Record<BuildingType, {w: number, h: number}> = {
    miner: {w: 1, h: 1},
    belt: {w: 1, h: 1},
    assembler: {w: 1, h: 1},
    adv_assembler: {w: 2, h: 2},
    generator: {w: 1, h: 1},
    chest: {w: 1, h: 1},
}

const resourcePrices: Partial<Record<Resource, { buy: number; sell: number }>> = {
    iron_ore: { buy: 10, sell: 5 },
    copper_ore: { buy: 15, sell: 8 },
    coal: { buy: 20, sell: 12 },
    iron_plate: { buy: 25, sell: 15 },
    copper_wire: { buy: 30, sell: 18 },
    gear: { buy: 100, sell: 60 },
    circuit: { buy: 250, sell: 150 },
};

const FactorySimulator: React.FC = () => {
    const { toast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [items, setItems] = useState<ItemOnBelt[]>([]);
    const [inventory, setInventory] = useState<Partial<Record<Resource, number>>>({ iron_plate: 20, gear: 5, circuit: 10 });
    const [money, setMoney] = useState(1000);
    
    const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType>('belt');
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
    const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);

    const totalPowerConsumption = useMemo(() => buildings.reduce((acc, b) => acc + (b.power || 0), 0), [buildings]);
    const totalPowerProduction = useMemo(() => buildings.filter(b => b.type === 'generator').length * -buildingPower.generator, [buildings]);
    const powerGridStatus = useMemo(() => totalPowerProduction >= totalPowerConsumption, [totalPowerConsumption, totalPowerProduction]);
    const selectedBuilding = useMemo(() => buildings.find(b => b.id === selectedBuildingId), [buildings, selectedBuildingId]);
    
    const placeBuilding = (x: number, y: number) => {
        const { w, h } = buildingSizes[selectedBuildingType];
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                if (buildings.some(b => b.x <= x + i && b.x + b.width -1 >= x + i && b.y <= y + j && b.y + b.height - 1 >= y + j)) {
                     toast({ title: 'Cannot place here', description: 'Space is already occupied.', variant: 'destructive'});
                    return;
                }
            }
        }

        const cost = buildingCosts[selectedBuildingType];
        if (cost) {
            for (const [resource, amount] of Object.entries(cost)) {
                if ((inventory[resource as Resource] || 0) < amount) {
                    toast({ title: 'Not enough resources', description: `You need ${amount} ${resource} to build a ${selectedBuildingType}.`, variant: 'destructive'});
                    return;
                }
            }
            const newInventory = {...inventory};
            for (const [resource, amount] of Object.entries(cost)) {
                newInventory[resource as Resource]! -= amount;
            }
            setInventory(newInventory);
        }

        const newBuilding: Building = {
            id: nextId.current++,
            type: selectedBuildingType, x, y, width: w, height: h,
            direction: buildingDirection,
            overclock: 1,
            power: buildingPower[selectedBuildingType],
            inventory: {}, 
            ...( (selectedBuildingType === 'assembler' || selectedBuildingType === 'adv_assembler') && { recipe: selectedRecipe, productionProgress: 0 }),
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

    const handleMarketTransaction = (resource: Resource, type: 'buy' | 'sell', amount: number) => {
        const price = resourcePrices[resource]?.[type];
        if (!price || amount <= 0) return;

        if (type === 'buy') {
            const totalCost = price * amount;
            if (money < totalCost) { toast({ title: 'Insufficient Funds', variant: 'destructive'}); return; }
            setMoney(m => m - totalCost);
            setInventory(inv => ({ ...inv, [resource]: (inv[resource] || 0) + amount }));
        } else { // sell
            if ((inventory[resource] || 0) < amount) { toast({ title: 'Not enough items to sell', variant: 'destructive'}); return; }
            const totalGain = price * amount;
            setMoney(m => m + totalGain);
            setInventory(inv => ({ ...inv, [resource]: (inv[resource] || 0) - amount }));
        }
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
        
        const clickedBuilding = buildings.find(b => x >= b.x && x < b.x + b.width && y >= b.y && y < b.y + b.height);
        if (clickedBuilding) {
            setSelectedBuildingId(clickedBuilding.id);
            return;
        }
        
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            placeBuilding(x, y);
        }
    };
    
    // Main Game Loop
    useEffect(() => {
        if (!isPlaying) return;
        const gameTick = setInterval(() => {
            setBuildings(currentBuildings => {
                const updatedBuildings = currentBuildings.map(b => {
                    const power = buildingPower[b.type] * Math.pow(b.overclock, 1.6);
                    const isPowered = powerGridStatus || b.type === 'generator';
                    let newB = {...b, power};
                    if(!isPowered) return newB;

                    if (b.type === 'miner') {
                        const resource = resourcePatches[`${b.x},${b.y}`];
                        if (resource && Math.random() < (0.1 * b.overclock)) {
                            const [ox, oy] = getOutputCoords(b);
                            const canPlace = !items.some(i => i.x === ox && i.y === oy && i.progress < BELT_SPEEDS[beltTier]);
                            if (canPlace) {
                                setItems(prev => [...prev, { id: nextId.current++, resource, x: ox, y: oy, progress: 0 }]);
                            }
                        }
                    }
                    else if ((b.type === 'assembler' || b.type === 'adv_assembler') && b.recipe) {
                        const recipe = recipes[b.recipe];
                        if(!recipe) return newB;
                        // Crafting logic... (simplified for brevity, assume it updates inventory and progress)
                        let canCraft = true;
                        for (const [res, amount] of Object.entries(recipe.inputs)) {
                            if ((b.inventory?.[res as Resource] || 0) < amount) {
                                canCraft = false; break;
                            }
                        }
                        if (canCraft) {
                            newB.productionProgress = (b.productionProgress || 0) + b.overclock;
                            if (newB.productionProgress >= recipe.time) {
                                const [ox, oy] = getOutputCoords(b);
                                if (!items.some(i => i.x === ox && i.y === oy && i.progress < BELT_SPEEDS[beltTier])) {
                                    setItems(prev => [...prev, { id: nextId.current++, resource: b.recipe!, x: ox, y: oy, progress: 0 }]);
                                    newB.inventory = {...b.inventory};
                                    for (const [res, amount] of Object.entries(recipe.inputs)) {
                                        newB.inventory[res as Resource]! -= amount;
                                    }
                                    newB.productionProgress = 0;
                                }
                            }
                        } else {
                            newB.productionProgress = 0;
                        }
                    }
                    return newB;
                });

                updatedBuildings.forEach(b => {
                     if ((b.type === 'assembler' || b.type === 'adv_assembler') && b.recipe) {
                         const recipe = recipes[b.recipe];
                         if(!recipe) return;
                         getAdjacentInputCoords(b).forEach(([ix, iy]) => {
                             const ingredientIndex = items.findIndex(item => item.x === ix && item.y === iy && item.progress >= 1);
                             if(ingredientIndex > -1) {
                                const ingredient = items[ingredientIndex];
                                if (Object.keys(recipe.inputs).includes(ingredient.resource)) {
                                    const currentAmount = b.inventory![ingredient.resource] || 0;
                                    if (currentAmount < 10) {
                                         b.inventory![ingredient.resource] = currentAmount + 1;
                                         setItems(prev => prev.filter(i => i.id !== ingredient.id));
                                    }
                                }
                             }
                         });
                     }
                });

                return updatedBuildings;
            });

            setItems(currentItems => { /* ... movement logic ... */
                const movedItems: ItemOnBelt[] = [];
                currentItems.forEach(item => {
                    const belt = buildings.find(b => b.x === item.x && b.y === item.y);
                    if (!belt || !['belt', 'miner', 'assembler', 'adv_assembler', 'chest'].includes(belt.type)) {
                      movedItems.push(item); return; 
                    }
                    if (belt.type === 'chest') {
                        if (Object.values(belt.inventory || {}).reduce((s, a) => s+a, 0) < 50) {
                             belt.inventory![item.resource] = (belt.inventory![item.resource] || 0) + 1;
                        } else {
                             movedItems.push({ ...item, progress: 1 });
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

        for(let y=0; y<GRID_SIZE; y++) for(let x=0; x<GRID_SIZE; x++) {
            const resource = resourcePatches[`${x},${y}`];
            if (resource) {
                ctx.fillStyle = resourceColors[resource] + '33';
                ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
            }
            ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 0.5;
            ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
        }

        buildings.forEach(b => {
            ctx.fillStyle = b.type === 'miner' ? '#4f46e5' : b.type === 'belt' ? '#64748b' : b.type === 'generator' ? '#facc15' : b.type === 'adv_assembler' ? '#0f766e' : b.type === 'chest' ? '#ca8a04' : '#0d9488';
            if (b.id === selectedBuildingId) {
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 4;
                ctx.strokeRect(b.x*cellSize, b.y*cellSize, b.width*cellSize, b.height*cellSize);
            }
            ctx.fillRect(b.x*cellSize, b.y*cellSize, b.width*cellSize, b.height*cellSize);
            
            const centerX = b.x*cellSize + (b.width*cellSize)/2, centerY = b.y*cellSize + (b.height*cellSize)/2;
            if(!['chest', 'generator'].includes(b.type)) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(b.direction === 'right' ? 0 : b.direction === 'down' ? Math.PI/2 : b.direction === 'left' ? Math.PI : -Math.PI/2);
                ctx.fillStyle = 'white'; ctx.beginPath();
                ctx.moveTo(-5*zoom, -5*zoom); ctx.lineTo(5*zoom, 0); ctx.lineTo(-5*zoom, 5*zoom);
                ctx.closePath(); ctx.fill();
                ctx.restore();
            }
        });

        items.forEach(item => {
            const currentTile = buildings.find(b => b.x === item.x && b.y === item.y);
            let itemX = item.x * cellSize + cellSize / 2, itemY = item.y * cellSize + cellSize / 2;
            if(currentTile && !['chest'].includes(currentTile.type)){
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
    }, [buildings, items, cellSize, viewOffset, zoom, selectedBuildingId]);

    const getOutputCoords = (b: Building) => {
        let {x, y, width, height, direction} = b;
        let ox = x, oy = y;
        if (direction === 'right') { ox = x + width; oy = y + Math.floor(height / 2); }
        else if (direction === 'left') { ox = x - 1; oy = y + Math.floor(height / 2); }
        else if (direction === 'down') { ox = x + Math.floor(width/2); oy = y + height; }
        else { ox = x + Math.floor(width/2); oy = y - 1; }
        return [ox,oy];
    }

    const getAdjacentInputCoords = (b: Building): [number, number][] => {
        const coords: [number, number][] = [];
        for (let i = 0; i < b.width; i++) {
            coords.push([b.x + i, b.y - 1], [b.x + i, b.y + b.height]);
        }
        for (let i = 0; i < b.height; i++) {
            coords.push([b.x - 1, b.y + i], [b.x + b.width, b.y + i]);
        }
        const [ox, oy] = getOutputCoords(b);
        return coords.filter(([ix, iy]) => !(ix === ox && iy === oy));
    }
    
    useEffect(() => { const anim = requestAnimationFrame(draw); return () => cancelAnimationFrame(anim); }, [draw]);
    
    const handlePanStart = (e: React.MouseEvent) => { setIsPanning(true); setPanStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y }); };
    const handlePanMove = (e: React.MouseEvent) => { if (!isPanning) return; setViewOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y }); };
    const handlePanEnd = () => setIsPanning(false);

    const updateOverclock = (id: number, overclock: number) => {
        setBuildings(prev => prev.map(b => b.id === id ? {...b, overclock} : b));
    };

    return (
        <div className="flex flex-col w-full h-full bg-card text-foreground">
            <div className="flex items-center justify-between p-2 border-b border-border bg-background">
                <h3 className="text-lg font-bold text-primary">Automation Simulator</h3>
                 <div className="flex items-center gap-4">
                    <div className="text-sm font-bold flex items-center gap-2 text-green-400">
                        <DollarSign size={16}/> ${money.toLocaleString()}
                    </div>
                    <div className={cn("text-sm font-bold flex items-center gap-2", powerGridStatus ? "text-green-400" : "text-red-500")}>
                        <Zap size={16}/> {totalPowerConsumption.toFixed(0)} / {totalPowerProduction} MW
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={isPlaying ? 'destructive' : 'default'} onClick={() => setIsPlaying(!isPlaying)} size="sm">{isPlaying ? <Pause/>:<Play/>}</Button>
                    <Button variant="outline" onClick={() => { setBuildings([]); setItems([]); setInventory({ iron_plate: 20, gear: 5, circuit: 10 }); setMoney(1000); }} size="sm"><RefreshCw/></Button>
                    <Button variant="outline" onClick={() => setZoom(z => Math.min(z*1.2, 2))} size="sm"><ZoomIn/></Button>
                    <Button variant="outline" onClick={() => setZoom(z => Math.max(z/1.2, 0.5))} size="sm"><ZoomOut/></Button>
                </div>
            </div>
            <div className="flex-grow flex">
                <div className="w-72 p-2 border-r border-border bg-background">
                    <Tabs defaultValue="build">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="build"><Hammer size={16}/></TabsTrigger>
                            <TabsTrigger value="inventory"><Warehouse size={16}/></TabsTrigger>
                            <TabsTrigger value="market"><ShoppingCart size={16}/></TabsTrigger>
                            <TabsTrigger value="help"><HelpCircle size={16}/></TabsTrigger>
                        </TabsList>
                        <TabsContent value="build" className="space-y-2 mt-2">
                            {selectedBuilding ? (
                                <Card>
                                    <CardHeader className='p-2 flex-row justify-between items-center'>
                                        <CardTitle className='text-base capitalize'>{selectedBuilding.type.replace('_', ' ')}</CardTitle>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setSelectedBuildingId(null)}><X className="h-4 w-4" /></Button>
                                    </CardHeader>
                                    <CardContent className="p-2 space-y-2">
                                        <p className="text-xs text-muted-foreground">ID: {selectedBuilding.id}</p>
                                        <div>
                                            <Label>Overclock: {Math.round(selectedBuilding.overclock*100)}%</Label>
                                            <Slider min={0.5} max={2} step={0.1} value={[selectedBuilding.overclock]} onValueChange={v => updateOverclock(selectedBuilding.id, v[0])}/>
                                            <p className="text-xs text-muted-foreground">Power: {selectedBuilding.power?.toFixed(1)} MW</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                 <Card>
                                    <CardHeader className='p-2'><CardTitle className='text-base'>Place Buildings</CardTitle></CardHeader>
                                    <CardContent className="p-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Button size="icon" variant="outline" onClick={rotateBuilding}>
                                                <RotateCcw className={cn( 'transition-transform', buildingDirection === 'down' && 'rotate-90', buildingDirection === 'left' && 'rotate-180', buildingDirection === 'up' && 'rotate-[-90deg]' )}/>
                                            </Button>
                                            <span className="text-sm">Rotate (R key)</span>
                                        </div>
                                        <Button variant={selectedBuildingType === 'generator' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('generator')} className="w-full justify-start gap-2"><Zap/> Generator</Button>
                                        <Button variant={selectedBuildingType === 'miner' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('miner')} className="w-full justify-start gap-2"><HardHat/> Miner</Button>
                                        <Button variant={selectedBuildingType === 'belt' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('belt')} className="w-full justify-start gap-2"><Box/> Belt</Button>
                                        <Button variant={selectedBuildingType === 'chest' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('chest')} className="w-full justify-start gap-2"><Warehouse/> Chest</Button>
                                        <div className="pl-4">
                                            <Label>Belt Tier: {beltTier}</Label>
                                            <Slider min={1} max={3} step={1} value={[beltTier]} onValueChange={v => setBeltTier(v[0] as 1|2|3)}/>
                                        </div>
                                        <Button variant={selectedBuildingType === 'assembler' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('assembler')} className="w-full justify-start gap-2"><Cog/> Assembler</Button>
                                        <Button variant={selectedBuildingType === 'adv_assembler' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('adv_assembler')} className="w-full justify-start gap-2"><Factory/> Adv. Assembler (2x2)</Button>
                                        {(selectedBuildingType === 'assembler' || selectedBuildingType === 'adv_assembler') && (
                                            <div className="pl-4 space-y-1">
                                            <Label>Recipe</Label>
                                            {Object.keys(recipes).filter(r => recipes[r as Resource]?.building.includes(selectedBuildingType)).map(recipe => (
                                                <Button key={recipe} size="sm" variant={selectedRecipe === recipe ? 'secondary' : 'ghost'} onClick={() => setSelectedRecipe(recipe as Resource)} className="w-full justify-start text-xs">{recipe}</Button>
                                            ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                                </>
                            )}
                        </TabsContent>
                         <TabsContent value="inventory" className="mt-2">
                             <Card><CardHeader className='p-2'><CardTitle className='text-base'>Inventory</CardTitle></CardHeader>
                                <CardContent className='p-2 text-xs space-y-1 h-[60vh] overflow-y-auto'>
                                    {Object.entries(inventory).map(([res, count]) => count > 0 && <p key={res}>{res}: {count}</p>)}
                                    {Object.keys(inventory).length === 0 && <p className="text-muted-foreground">Your inventory is empty.</p>}
                                </CardContent>
                            </Card>
                         </TabsContent>
                         <TabsContent value="market" className="mt-2">
                              <Card>
                                <CardHeader className='p-2'><CardTitle className='text-base'>Market</CardTitle></CardHeader>
                                <CardContent className='p-2 text-xs space-y-2 h-[60vh] overflow-y-auto'>
                                   {Object.entries(resourcePrices).map(([res, prices]) => (
                                    <div key={res} className="p-2 border rounded-md">
                                        <p className="font-bold capitalize">{res}</p>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>Buy: ${prices.buy}</span>
                                            <span>Sell: ${prices.sell}</span>
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            <Button size="xs" variant="outline" onClick={() => handleMarketTransaction(res as Resource, 'buy', 1)}>Buy 1</Button>
                                            <Button size="xs" variant="destructive" onClick={() => handleMarketTransaction(res as Resource, 'sell', 1)}>Sell 1</Button>
                                        </div>
                                    </div>
                                   ))}
                                </CardContent>
                            </Card>
                         </TabsContent>
                        <TabsContent value="help" className="mt-2">
                            <Card>
                                <CardHeader className='p-2'><CardTitle className='text-base'>How to Play</CardTitle></CardHeader>
                                <CardContent className='p-2'>
                                    <Accordion type="single" collapsible className='text-xs'>
                                        <AccordionItem value="goal">
                                            <AccordionTrigger>Goal</AccordionTrigger>
                                            <AccordionContent>Automate the production of complex items from raw resources.</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="basics">
                                            <AccordionTrigger>Basics</AccordionTrigger>
                                            <AccordionContent>Place Miners on resource patches. Use Belts to transport items. Use Assemblers to craft new items. Store items in Chests.</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="power">
                                            <AccordionTrigger>Power</AccordionTrigger>
                                            <AccordionContent>All buildings require power. Build Generators to produce power. Overclocking buildings increases speed but consumes much more power.</AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="flex-grow relative bg-background overflow-hidden" onMouseDown={handlePanStart} onMouseMove={handlePanMove} onMouseUp={handlePanEnd} onMouseLeave={handlePanEnd}>
                    <canvas ref={canvasRef} width={GRID_SIZE * 32} height={GRID_SIZE * 32} onClick={handleCanvasClick} className={cn("absolute top-0 left-0", isPanning ? 'cursor-grabbing' : 'cursor-crosshair')} />
                </div>
            </div>
        </div>
    );
};
export default FactorySimulator;

    