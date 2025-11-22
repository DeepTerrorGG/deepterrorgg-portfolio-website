'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardHat, Cog, Box, Play, Pause, RefreshCw, ZoomIn, ZoomOut, RotateCcw, Zap, Factory, HelpCircle, Warehouse, Hammer, ShoppingCart, DollarSign, X, Trash2, ArrowRight, SunMedium, Move, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// --- TYPE DEFINITIONS ---
type BuildingType = 'miner' | 'belt' | 'assembler' | 'adv_assembler' | 'generator' | 'chest' | 'solar_panel' | 'inserter' | 'export_bus' | 'market_stall';
type Resource = 'iron_ore' | 'copper_ore' | 'coal' | 'iron_plate' | 'copper_wire' | 'gear' | 'circuit' | 'steel_plate' | 'robot_arm' | 'belt' | 'miner' | 'assembler' | 'adv_assembler' | 'inserter' | 'market_stall';
type Direction = 'up' | 'down' | 'left' | 'right';
type Tool = 'build' | 'destroy';

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
  cooldown?: number; // For inserters
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

const resourceColors: Partial<Record<Resource, string>> = {
  iron_ore: '#a1a1aa',
  copper_ore: '#f59e0b',
  coal: '#18181b',
  iron_plate: '#d4d4d8',
  copper_wire: '#fbbf24',
  gear: '#71717a',
  circuit: '#22c55e',
  steel_plate: '#737373',
  robot_arm: '#fb7185',
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
    steel_plate: { inputs: { iron_plate: 2, coal: 1 }, time: 40, output: 1, building: ['adv_assembler'] },
    robot_arm: { inputs: { steel_plate: 1, circuit: 1 }, time: 80, output: 1, building: ['adv_assembler'] },
};

const buildingCosts: Partial<Record<Resource, Partial<Record<Resource, number>>>> = {
    belt: { iron_plate: 1 },
    miner: { iron_plate: 3, gear: 2 },
    assembler: { gear: 4, circuit: 2 },
    adv_assembler: { gear: 8, circuit: 8 },
    chest: { iron_plate: 4 },
    generator: { iron_plate: 5, gear: 3 },
    solar_panel: { steel_plate: 5, circuit: 5 },
    inserter: { robot_arm: 1, gear: 1 },
    export_bus: { circuit: 5, steel_plate: 5 },
    market_stall: { iron_plate: 10, circuit: 2 },
};

const buildingPower: Record<BuildingType, number> = {
    miner: 10,
    belt: 1,
    assembler: 20,
    adv_assembler: 40,
    generator: -100, // negative means production
    chest: 0,
    solar_panel: -25,
    inserter: 2,
    export_bus: 5,
    market_stall: 0,
}

const buildingSizes: Record<BuildingType, {w: number, h: number}> = {
    miner: {w: 1, h: 1},
    belt: {w: 1, h: 1},
    assembler: {w: 1, h: 1},
    adv_assembler: {w: 2, h: 2},
    generator: {w: 1, h: 1},
    chest: {w: 1, h: 1},
    solar_panel: {w: 2, h: 2},
    inserter: {w: 1, h: 1},
    export_bus: {w: 1, h: 1},
    market_stall: {w: 2, h: 2},
}

const resourcePrices: Partial<Record<Resource, { buy: number; sell: number }>> = {
    iron_ore: { buy: 10, sell: 5 },
    copper_ore: { buy: 15, sell: 8 },
    coal: { buy: 20, sell: 12 },
    iron_plate: { buy: 25, sell: 15 },
    copper_wire: { buy: 30, sell: 18 },
    gear: { buy: 100, sell: 60 },
    circuit: { buy: 250, sell: 150 },
    steel_plate: { buy: 80, sell: 45 },
    robot_arm: { buy: 500, sell: 300 },
};

const FactorySimulator: React.FC = () => {
    const { toast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [items, setItems] = useState<ItemOnBelt[]>([]);
    const [inventory, setInventory] = useState<Partial<Record<Resource, number>>>({ iron_plate: 20, gear: 5, circuit: 10, steel_plate: 10 });
    const [money, setMoney] = useState(1000);
    
    const [tool, setTool] = useState<Tool>('build');
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
    const [isMarketOpen, setIsMarketOpen] = useState(false);

    const totalPowerConsumption = useMemo(() => buildings.reduce((acc, b) => b.power && b.power > 0 ? acc + b.power : acc, 0), [buildings]);
    const totalPowerProduction = useMemo(() => buildings.reduce((acc, b) => b.power && b.power < 0 ? acc - b.power : acc, 0), [buildings]);
    const powerGridStatus = useMemo(() => totalPowerProduction >= totalPowerConsumption, [totalPowerConsumption, totalPowerProduction]);
    const selectedBuilding = useMemo(() => buildings.find(b => b.id === selectedBuildingId), [buildings, selectedBuildingId]);
    
    const destroyBuilding = (building: Building) => {
        setBuildings(prev => prev.filter(b => b.id !== building.id));
        
        const cost = buildingCosts[building.type as Resource];
        if (cost) {
            const newInventory = {...inventory};
            for (const [resource, amount] of Object.entries(cost)) {
                newInventory[resource as Resource] = (newInventory[resource as Resource] || 0) + Math.floor(amount / 2);
            }
            setInventory(newInventory);
        }
        
        if (selectedBuildingId === building.id) {
            setSelectedBuildingId(null);
        }
        
        toast({ title: "Building Destroyed", description: `You salvaged some resources from the ${building.type}.`});
    }

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

        const cost = buildingCosts[selectedBuildingType as Resource];
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
    
    const handCraft = (itemToCraft: Resource) => {
        const cost = buildingCosts[itemToCraft];
        if (!cost) {
            toast({title: 'Cannot be crafted', description: `This item cannot be hand-crafted.`});
            return;
        }
        let canCraft = true;
        for (const [resource, amount] of Object.entries(cost)) {
            if ((inventory[resource as Resource] || 0) < amount) {
                canCraft = false;
                break;
            }
        }
        if(!canCraft) {
            toast({ title: 'Not enough resources', variant: 'destructive'});
            return;
        }
        
        const newInventory = {...inventory};
        for (const [resource, amount] of Object.entries(cost)) {
            newInventory[resource as Resource]! -= amount;
        }
        newInventory[itemToCraft as Resource] = (newInventory[itemToCraft as Resource] || 0) + 1;
        setInventory(newInventory);
        toast({title: 'Crafted!', description: `You crafted 1x ${itemToCraft}.`});
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
    
    const takeFromChest = (chestId: number, resource: Resource) => {
        setBuildings(prev => prev.map(b => {
            if (b.id === chestId) {
                const newInventory = {...b.inventory};
                if ((newInventory[resource] || 0) > 0) {
                    newInventory[resource]! -= 1;
                    setInventory(playerInv => ({...playerInv, [resource]: (playerInv[resource] || 0) + 1}));
                }
                return {...b, inventory: newInventory};
            }
            return b;
        }));
    };
    
    const clearChest = (chestId: number) => {
        setBuildings(prev => prev.map(b => b.id === chestId ? {...b, inventory: {}} : b));
    };

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
        
        if (tool === 'destroy') {
            if (clickedBuilding) {
                destroyBuilding(clickedBuilding);
            }
            return;
        }

        if (clickedBuilding) {
            setSelectedBuildingId(clickedBuilding.id);
            if(clickedBuilding.type === 'market_stall') {
                setIsMarketOpen(true);
            }
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
            let nextItems = [...items];

            setBuildings(currentBuildings => {
                const updatedBuildings = currentBuildings.map(b => {
                    const power = buildingPower[b.type] * Math.pow(b.overclock, 1.6);
                    const isPowered = powerGridStatus || b.power! < 0;
                    let newB = {...b, power};
                    if(!isPowered) return newB;

                    if (b.type === 'miner' && Math.random() < (0.1 * b.overclock)) {
                        const resource = resourcePatches[`${b.x},${b.y}`];
                        if (resource) {
                            const [ox, oy] = getOutputCoords(b);
                            if (!nextItems.some(i => i.x === ox && i.y === oy && i.progress < BELT_SPEEDS[beltTier])) {
                                nextItems.push({ id: nextId.current++, resource, x: ox, y: oy, progress: 0 });
                            }
                        }
                    }
                    else if ((b.type === 'assembler' || b.type === 'adv_assembler') && b.recipe) {
                        const recipe = recipes[b.recipe];
                        if(!recipe) return newB;
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
                                if (!nextItems.some(i => i.x === ox && i.y === oy && i.progress < BELT_SPEEDS[beltTier])) {
                                    nextItems.push({ id: nextId.current++, resource: b.recipe!, x: ox, y: oy, progress: 0 });
                                    newB.inventory = {...b.inventory};
                                    for (const [res, amount] of Object.entries(recipe.inputs)) newB.inventory[res as Resource]! -= amount;
                                    newB.productionProgress = 0;
                                }
                            }
                        } else {
                            newB.productionProgress = 0;
                        }
                    } else if (b.type === 'inserter') {
                        if ((b.cooldown || 0) > 0) {
                            newB.cooldown = b.cooldown! - 1;
                            return newB;
                        }

                        const [ix, iy] = getInserterInputCoords(b);
                        const [ox, oy] = getOutputCoords(b);
                        const sourceBuilding = currentBuildings.find(bld => bld.x <= ix && ix < bld.x + bld.width && bld.y <= iy && iy < bld.y + bld.height);
                        const targetBuilding = currentBuildings.find(bld => bld.x <= ox && ox < bld.x + bld.width && bld.y <= oy && oy < bld.y + bld.height);
                        
                        if (sourceBuilding && sourceBuilding.inventory && Object.keys(sourceBuilding.inventory).length > 0) {
                            const resourceToMove = Object.keys(sourceBuilding.inventory).find(res => sourceBuilding.inventory![res as Resource]! > 0) as Resource | undefined;
                            if (resourceToMove) {
                                if (!targetBuilding || targetBuilding.type === 'belt') {
                                     if (!nextItems.some(item => item.x === ox && item.y === oy)) {
                                        sourceBuilding.inventory[resourceToMove]!--;
                                        nextItems.push({id: nextId.current++, resource: resourceToMove, x: ox, y: oy, progress: 0});
                                        newB.cooldown = 10;
                                     }
                                }
                                else if (targetBuilding.inventory && Object.values(targetBuilding.inventory).reduce((s, a) => s + a, 0) < 50) {
                                    sourceBuilding.inventory[resourceToMove]!--;
                                    targetBuilding.inventory[resourceToMove] = (targetBuilding.inventory[resourceToMove] || 0) + 1;
                                    newB.cooldown = 10;
                                }
                            }
                        }
                    }
                    return newB;
                });

                updatedBuildings.forEach(b => {
                     if ((b.type === 'assembler' || b.type === 'adv_assembler') && b.recipe) {
                         const recipe = recipes[b.recipe]; if(!recipe) return;
                         getAdjacentInputCoords(b).forEach(([ix, iy]) => {
                             const itemIndex = nextItems.findIndex(item => item.x === ix && item.y === iy && item.progress >= 1);
                             if(itemIndex > -1) {
                                const ingredient = nextItems[itemIndex];
                                if (Object.keys(recipe.inputs).includes(ingredient.resource)) {
                                    const currentAmount = b.inventory![ingredient.resource] || 0;
                                    if (currentAmount < 20) {
                                         b.inventory![ingredient.resource] = currentAmount + 1;
                                         nextItems.splice(itemIndex, 1);
                                    }
                                }
                             }
                         });
                     }
                });

                return updatedBuildings;
            });
            
            const movedItems: ItemOnBelt[] = [];
            const itemsToRemove = new Set<number>();
            
            nextItems.forEach(item => {
                const currentTile = buildings.find(b => b.x === item.x && b.y === item.y);
                if (!currentTile || itemsToRemove.has(item.id)) { movedItems.push(item); return; }

                if (currentTile.type === 'export_bus') {
                    const price = resourcePrices[item.resource]?.sell;
                    if(price) setMoney(m => m + price);
                    itemsToRemove.add(item.id);
                    return;
                }
                
                if (currentTile.type === 'chest' || ((currentTile.type === 'assembler' || currentTile.type === 'adv_assembler') && currentTile.recipe && recipes[currentTile.recipe]?.inputs[item.resource] )) {
                    const inventory = currentTile.inventory!;
                    if (Object.values(inventory).reduce((s, a) => s+a, 0) < 50) {
                         inventory[item.resource] = (inventory[item.resource] || 0) + 1;
                         itemsToRemove.add(item.id);
                    } else {
                        movedItems.push({ ...item, progress: 1 });
                    }
                    return;
                }

                if (!['belt', 'miner', 'assembler', 'adv_assembler', 'inserter'].includes(currentTile.type)) { movedItems.push(item); return; }

                const [nextX, nextY] = getOutputCoords(currentTile);
                let newProgress = item.progress + BELT_SPEEDS[beltTier];
                if(newProgress >= 1) {
                    const isNextTileOccupied = nextItems.some(i => i.id !== item.id && i.x === nextX && i.y === nextY && i.progress < BELT_SPEEDS[beltTier]) || movedItems.some(i => i.x === nextX && i.y === nextY);
                    if (!isNextTileOccupied) {
                        movedItems.push({ ...item, x: nextX, y: nextY, progress: newProgress - 1 });
                    } else {
                         movedItems.push({ ...item, progress: 1 });
                    }
                } else {
                    movedItems.push({ ...item, progress: newProgress });
                }
            });
            setItems(movedItems.filter(i => !itemsToRemove.has(i.id)));
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
                ctx.fillStyle = (resourceColors[resource] || '#ffffff') + '33';
                ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
            }
            ctx.strokeStyle = '#3f3f46'; ctx.lineWidth = 0.5;
            ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
        }

        buildings.forEach(b => {
            ctx.fillStyle = b.type === 'miner' ? '#4f46e5' : b.type === 'belt' ? '#64748b' : b.type === 'generator' ? '#f59e0b' : b.type === 'solar_panel' ? '#3b82f6' : b.type === 'adv_assembler' ? '#0f766e' : b.type === 'chest' ? '#ca8a04' : b.type === 'inserter' ? '#94a3b8' : b.type === 'export_bus' ? '#16a34a' : b.type === 'market_stall' ? '#ec4899' : '#0d9488';
            if (b.id === selectedBuildingId) {
                ctx.strokeStyle = '#facc15'; ctx.lineWidth = 4;
                ctx.strokeRect(b.x*cellSize, b.y*cellSize, b.width*cellSize, b.height*cellSize);
            }
            ctx.fillRect(b.x*cellSize, b.y*cellSize, b.width*cellSize, b.height*cellSize);
            
            const centerX = b.x*cellSize + (b.width*cellSize)/2, centerY = b.y*cellSize + (b.height*cellSize)/2;
            if(!['chest', 'generator', 'solar_panel', 'market_stall'].includes(b.type)) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(b.direction === 'right' ? 0 : b.direction === 'down' ? Math.PI/2 : b.direction === 'left' ? Math.PI : -Math.PI/2);
                
                if (b.type === 'inserter') {
                    ctx.fillStyle = '#475569';
                    ctx.fillRect(-5*zoom, -10*zoom, 10*zoom, 20*zoom);
                    ctx.fillStyle = 'yellow';
                    ctx.fillRect(-2*zoom, -14*zoom, 4*zoom, 8*zoom);
                } else {
                    ctx.fillStyle = 'white'; ctx.beginPath();
                    ctx.moveTo(-5*zoom, -5*zoom); ctx.lineTo(5*zoom, 0); ctx.lineTo(-5*zoom, 5*zoom);
                    ctx.closePath(); ctx.fill();
                }
                ctx.restore();
            }
        });

        items.forEach(item => {
            const currentTile = buildings.find(b => b.x <= item.x && item.x < b.x+b.width && b.y <= item.y && item.y < b.y+b.height);
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

    const getOutputCoords = (b: Building): [number, number] => {
        let {x, y, width, height, direction} = b;
        let ox = x, oy = y;
        if (direction === 'right') { ox = x + width; oy = y + Math.floor((height-1) / 2); }
        else if (direction === 'left') { ox = x - 1; oy = y + Math.floor((height-1) / 2); }
        else if (direction === 'down') { ox = x + Math.floor((width-1)/2); oy = y + height; }
        else { ox = x + Math.floor((width-1)/2); oy = y - 1; }
        return [ox,oy];
    }
    
    const getInserterInputCoords = (b: Building): [number, number] => {
        let {x, y, direction} = b;
        if (direction === 'right') return [x - 1, y];
        if (direction === 'left') return [x + 1, y];
        if (direction === 'down') return [x, y - 1];
        return [x, y + 1]; // up
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
                    <Button variant="outline" onClick={() => { setBuildings([]); setItems([]); setInventory({ iron_plate: 20, gear: 5, circuit: 10, steel_plate: 10 }); setMoney(1000); }} size="sm"><RefreshCw/></Button>
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
                                        {selectedBuilding.type !== 'chest' && selectedBuilding.type !== 'export_bus' && selectedBuilding.type !== 'market_stall' ? (
                                            <div>
                                                <Label>Overclock: {Math.round(selectedBuilding.overclock*100)}%</Label>
                                                <Slider min={0.5} max={2} step={0.1} value={[selectedBuilding.overclock]} onValueChange={v => updateOverclock(selectedBuilding.id, v[0])}/>
                                                <p className="text-xs text-muted-foreground">Power: {selectedBuilding.power?.toFixed(1)} MW</p>
                                            </div>
                                        ) : selectedBuilding.type === 'chest' ? (
                                            <div>
                                                <Label>Chest Inventory</Label>
                                                <div className="space-y-1 text-xs max-h-48 overflow-y-auto border p-2 rounded-md">
                                                    {Object.entries(selectedBuilding.inventory || {}).map(([res, count]) => count > 0 && (
                                                        <div key={res} className="flex justify-between items-center">
                                                            <span>{res}: {count}</span>
                                                            <Button size="xs" variant="outline" onClick={() => takeFromChest(selectedBuilding.id, res as Resource)}>Take</Button>
                                                        </div>
                                                    ))}
                                                     {Object.keys(selectedBuilding.inventory || {}).length === 0 && <p className="text-muted-foreground">Empty</p>}
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                     <Button size="sm" variant="outline" className="flex-1" onClick={() => clearChest(selectedBuilding.id)}>Clear</Button>
                                                     <Button size="sm" variant="destructive" className="flex-1" onClick={() => destroyBuilding(selectedBuilding)}>Destroy</Button>
                                                </div>
                                            </div>
                                        ) : null}
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                 <Card>
                                    <CardHeader className='p-2'><CardTitle className='text-base'>Place Buildings</CardTitle></CardHeader>
                                    <CardContent className="p-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Button variant={tool === 'destroy' ? 'destructive' : 'outline'} size="icon" onClick={() => setTool(t => t === 'destroy' ? 'build' : 'destroy')}><Trash2/></Button>
                                            <Button size="icon" variant="outline" onClick={rotateBuilding}>
                                                <RotateCcw className={cn( 'transition-transform', buildingDirection === 'down' && 'rotate-90', buildingDirection === 'left' && 'rotate-180', buildingDirection === 'up' && 'rotate-[-90deg]' )}/>
                                            </Button>
                                            <span className="text-sm">Rotate (R)</span>
                                        </div>
                                        <p className="text-xs font-bold pt-2">Logistics</p>
                                        <Button variant={selectedBuildingType === 'belt' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('belt')} className="w-full justify-start gap-2"><Box/> Belt</Button>
                                        <div className="pl-4"><Label>Tier: {beltTier}</Label><Slider min={1} max={3} step={1} value={[beltTier]} onValueChange={v => setBeltTier(v[0] as 1|2|3)}/></div>
                                        <Button variant={selectedBuildingType === 'inserter' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('inserter')} className="w-full justify-start gap-2"><Move/> Inserter</Button>
                                        <Button variant={selectedBuildingType === 'chest' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('chest')} className="w-full justify-start gap-2"><Warehouse/> Chest</Button>
                                        <Button variant={selectedBuildingType === 'export_bus' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('export_bus')} className="w-full justify-start gap-2"><ArrowRight/> Export Bus</Button>
                                        <Button variant={selectedBuildingType === 'market_stall' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('market_stall')} className="w-full justify-start gap-2"><ShoppingCart/> Market Stall (2x2)</Button>
                                        <p className="text-xs font-bold pt-2">Production</p>
                                        <Button variant={selectedBuildingType === 'miner' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('miner')} className="w-full justify-start gap-2"><HardHat/> Miner</Button>
                                        <Button variant={selectedBuildingType === 'assembler' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('assembler')} className="w-full justify-start gap-2"><Cog/> Assembler</Button>
                                        <Button variant={selectedBuildingType === 'adv_assembler' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('adv_assembler')} className="w-full justify-start gap-2"><Factory/> Adv. Assembler (2x2)</Button>
                                        <p className="text-xs font-bold pt-2">Power</p>
                                        <Button variant={selectedBuildingType === 'generator' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('generator')} className="w-full justify-start gap-2"><Zap/> Coal Generator</Button>
                                        <Button variant={selectedBuildingType === 'solar_panel' ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType('solar_panel')} className="w-full justify-start gap-2"><SunMedium/> Solar Panel (2x2)</Button>
                                        {(selectedBuildingType === 'assembler' || selectedBuildingType === 'adv_assembler') && (
                                            <div className="pl-4 space-y-1">
                                            <Label>Recipe</Label>
                                            {Object.keys(recipes).filter(r => recipes[r as Resource]?.building.includes(selectedBuildingType)).map(recipe => (
                                                <Button key={recipe} size="sm" variant={selectedRecipe === recipe ? 'secondary' : 'ghost'} onClick={() => setSelectedRecipe(recipe as Resource)} className="w-full justify-start text-xs capitalize">{recipe.replace('_', ' ')}</Button>
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
                                <CardContent className='p-2 text-xs space-y-1 h-[20vh] overflow-y-auto'>
                                    {Object.entries(inventory).map(([res, count]) => count > 0 && <p key={res} className="capitalize flex justify-between"><span>{res.replace(/_/g, ' ')}</span> <span>x{count}</span></p>)}
                                    {Object.values(inventory).every(v => v === 0) && <p className="text-muted-foreground">Your inventory is empty.</p>}
                                </CardContent>
                            </Card>
                             <Card className="mt-2"><CardHeader className='p-2'><CardTitle className='text-base'>Hand Crafting</CardTitle></CardHeader>
                                <CardContent className='p-2 text-xs space-y-2 h-[40vh] overflow-y-auto'>
                                    {Object.entries(buildingCosts).map(([item, costs]) => {
                                      const canCraft = Object.entries(costs).every(([res, amount]) => (inventory[res as Resource] || 0) >= amount);
                                      return (
                                        <Card key={item} className="p-2 bg-muted/30">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold capitalize">{item.replace(/_/g, ' ')}</p>
                                                <Button size="xs" onClick={() => handCraft(item as Resource)} disabled={!canCraft}>Craft</Button>
                                            </div>
                                            <div className="text-muted-foreground text-xs mt-1">
                                                {Object.entries(costs).map(([res, amount]) => (
                                                  <p key={res} className={cn((inventory[res as Resource] || 0) < amount ? 'text-red-400' : '')}>
                                                    <span className="capitalize">{res.replace(/_/g, ' ')}</span>: {amount}
                                                  </p>
                                                ))}
                                            </div>
                                        </Card>
                                      )
                                    })}
                                </CardContent>
                            </Card>
                         </TabsContent>
                         <TabsContent value="market" className="mt-2">
                              <Card>
                                <CardHeader className='p-2'><CardTitle className='text-base'>Market</CardTitle></CardHeader>
                                <CardContent className='p-2 text-xs space-y-2 h-[60vh] overflow-y-auto'>
                                   {Object.entries(resourcePrices).map(([res, prices]) => {
                                     const currentAmount = inventory[res as Resource] || 0;
                                     return (
                                        <Card key={res} className="p-3 bg-muted/30">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="font-bold capitalize">{res.replace(/_/g, ' ')}</p>
                                                <p className="text-muted-foreground text-xs">In Stock: {currentAmount}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
                                                <div className="space-y-1">
                                                    <p className="text-green-400 font-semibold text-center">Buy: ${prices.buy}</p>
                                                    <div className="grid grid-cols-3 gap-1">
                                                        <Button size="xs" variant="ghost" onClick={() => handleMarketTransaction(res as Resource, 'buy', 1)}>1</Button>
                                                        <Button size="xs" variant="ghost" onClick={() => handleMarketTransaction(res as Resource, 'buy', 10)}>10</Button>
                                                        <Button size="xs" variant="ghost" onClick={() => handleMarketTransaction(res as Resource, 'buy', 100)}>100</Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-yellow-400 font-semibold text-center">Sell: ${prices.sell}</p>
                                                     <div className="grid grid-cols-3 gap-1">
                                                        <Button size="xs" variant="ghost" onClick={() => handleMarketTransaction(res as Resource, 'sell', 1)} disabled={currentAmount < 1}>1</Button>
                                                        <Button size="xs" variant="ghost" onClick={() => handleMarketTransaction(res as Resource, 'sell', 10)} disabled={currentAmount < 10}>10</Button>
                                                        <Button size="xs" variant="ghost" onClick={() => handleMarketTransaction(res as Resource, 'sell', 100)} disabled={currentAmount < 100}>100</Button>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="secondary" className="col-span-2 mt-1" onClick={() => handleMarketTransaction(res as Resource, 'sell', currentAmount)} disabled={currentAmount <= 0}>Sell All ({currentAmount})</Button>
                                            </div>
                                        </Card>
                                   )})}
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
                                            <AccordionContent>Automate production of complex items. Sell items at the Market or via an Export Bus to make money.</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="basics">
                                            <AccordionTrigger>Basics</AccordionTrigger>
                                            <AccordionContent>Place Miners on resource patches. Use Belts to transport items. Use Assemblers to craft new items. Store items in Chests. Use Inserters to move items between buildings.</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="power">
                                            <AccordionTrigger>Power</AccordionTrigger>
                                            <AccordionContent>All buildings require power. Build Generators or Solar Panels. Overclocking buildings increases speed but consumes much more power.</AccordionContent>
                                        </AccordionItem>
                                         <AccordionItem value="market">
                                            <AccordionTrigger>Market</AccordionTrigger>
                                            <AccordionContent>Buy and sell resources manually from the Market tab. Build a Market Stall and click on it to open the market UI as well. Use an Export Bus to sell items automatically from a conveyor.</AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="flex-grow relative bg-background overflow-hidden" onMouseDown={handlePanStart} onMouseMove={handlePanMove} onMouseUp={handlePanEnd} onMouseLeave={handlePanEnd}>
                    <canvas ref={canvasRef} width={GRID_SIZE * 32} height={GRID_SIZE * 32} onClick={handleCanvasClick} className={cn("absolute top-0 left-0", isPanning ? 'cursor-grabbing' : (tool === 'destroy' ? 'cursor-not-allowed' : 'cursor-crosshair'))} />
                </div>
            </div>
            
        </div>
    );
};
export default FactorySimulator;
