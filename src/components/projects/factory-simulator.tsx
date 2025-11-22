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
type BuildingType = 'miner' | 'belt_mk1' | 'belt_mk2' | 'belt_mk3' | 'assembler' | 'assembler_mk2' | 'generator' | 'chest' | 'solar_panel' | 'inserter' | 'export_bus' | 'market_stall' | 'oil_pump' | 'refinery' | 'oil_generator' | 'concrete_mixer' | 'water_pump' | 'pipe' | 'liquid_tank';
type Resource = 'iron_ore' | 'copper_ore' | 'coal' | 'stone' | 'zinc_ore' | 'crude_oil' | 'water' | 'iron_plate' | 'copper_plate' | 'steel_plate' | 'zinc_plate' | 'copper_wire' | 'gear' | 'pipe_item' | 'circuit' | 'plastic' | 'concrete' | 'brass_ingot' | 'robot_arm' | 'advanced_circuit' | 'belt_mk1' | 'belt_mk2' | 'belt_mk3' | 'miner' | 'assembler' | 'assembler_mk2' | 'inserter' | 'market_stall' | 'oil_pump' | 'refinery';
type Fluid = 'crude_oil' | 'water';
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
  recipe?: Resource;
  inventory?: Partial<Record<Resource, number>>;
  fluidInventory?: Partial<Record<Fluid, number>>;
  productionProgress?: number;
  overclock: number;
  power?: number;
  cooldown?: number;
}

interface ItemOnBelt {
  id: number;
  resource: Resource;
  x: number;
  y: number;
  progress: number;
}

// --- CONSTANTS ---
const GRID_SIZE = 40;
const TICK_RATE = 100;
const SAVE_INTERVAL = 5000; // Save every 5 seconds

const BELT_SPEEDS: Partial<Record<BuildingType, number>> = {
    belt_mk1: 0.1,
    belt_mk2: 0.2,
    belt_mk3: 0.4,
};

const resourceColors: Partial<Record<Resource, string>> = {
  iron_ore: '#a1a1aa', copper_ore: '#f59e0b', coal: '#18181b', stone: '#a3a3a3', zinc_ore: '#d4d4d8',
  crude_oil: '#3f3f46', water: '#3b82f6',
  iron_plate: '#e5e5e5', copper_plate: '#fbbf24', steel_plate: '#737373', zinc_plate: '#f5f5f5', copper_wire: '#fde047',
  gear: '#71717a', circuit: '#22c55e', plastic: '#a78bfa', concrete: '#a8a29e', brass_ingot: '#facc15',
  robot_arm: '#fb7185', advanced_circuit: '#10b981',
};

const resourcePatches: Record<string, Resource> = {
    '5,5': 'iron_ore', '6,5': 'iron_ore', '5,6': 'iron_ore',
    '20,20': 'copper_ore', '21,20': 'copper_ore', '20,21': 'copper_ore',
    '10,25': 'coal', '11,25': 'coal', '10,26': 'coal',
    '30,10': 'crude_oil', '31,10': 'crude_oil', '30,11': 'crude_oil',
    '15,3': 'stone', '16,3': 'stone', '15,4': 'stone',
    '3,30': 'zinc_ore', '4,30': 'zinc_ore', '3,31': 'zinc_ore',
};

const fluidTiles: Record<string, Fluid> = {
    '35,35': 'water', '36,35': 'water', '35,36': 'water', '36,36': 'water',
};

type RecipeDefinition = { inputs: Partial<Record<Resource, number>>, time: number, output: number, building: BuildingType[] };

const recipes: Partial<Record<Resource, RecipeDefinition>> = {
    iron_plate: { inputs: { iron_ore: 1 }, time: 20, output: 1, building: ['assembler', 'assembler_mk2'] },
    copper_plate: { inputs: { copper_ore: 1 }, time: 20, output: 1, building: ['assembler', 'assembler_mk2']},
    copper_wire: { inputs: { copper_plate: 1 }, time: 10, output: 2, building: ['assembler', 'assembler_mk2'] },
    zinc_plate: { inputs: { zinc_ore: 1 }, time: 25, output: 1, building: ['assembler', 'assembler_mk2']},
    gear: { inputs: { iron_plate: 2 }, time: 50, output: 1, building: ['assembler', 'assembler_mk2'] },
    steel_plate: { inputs: { iron_plate: 2, coal: 1 }, time: 40, output: 1, building: ['assembler', 'assembler_mk2'] },
    circuit: { inputs: { iron_plate: 1, copper_wire: 3}, time: 60, output: 1, building: ['assembler', 'assembler_mk2']},
    plastic: { inputs: { crude_oil: 1 }, time: 30, output: 2, building: ['refinery'] },
    concrete: { inputs: { stone: 2, water: 1 }, time: 50, output: 2, building: ['concrete_mixer']},
    brass_ingot: { inputs: { copper_plate: 1, zinc_plate: 1}, time: 40, output: 2, building: ['assembler', 'assembler_mk2']},
    robot_arm: { inputs: { steel_plate: 1, circuit: 1 }, time: 80, output: 1, building: ['assembler_mk2'] },
    advanced_circuit: { inputs: { circuit: 2, plastic: 1, brass_ingot: 1 }, time: 100, output: 1, building: ['assembler_mk2'] },
    pipe_item: { inputs: { iron_plate: 1 }, time: 10, output: 2, building: ['assembler', 'assembler_mk2']},
    belt_mk2: { inputs: { belt_mk1: 1, gear: 1 }, time: 20, output: 1, building: ['assembler', 'assembler_mk2']},
    belt_mk3: { inputs: { belt_mk2: 1, robot_arm: 1 }, time: 40, output: 1, building: ['assembler_mk2']},
};

const buildingCosts: Partial<Record<Resource, Partial<Record<Resource, number>>>> = {
    belt_mk1: { iron_plate: 1 },
    pipe_item: { iron_plate: 1},
    miner: { iron_plate: 3, gear: 2 },
    oil_pump: { steel_plate: 5, gear: 5 },
    water_pump: { steel_plate: 3, circuit: 2},
    refinery: { steel_plate: 10, gear: 10 },
    concrete_mixer: { steel_plate: 8, gear: 4},
    assembler: { gear: 4, circuit: 2 },
    assembler_mk2: { robot_arm: 2, circuit: 4 },
    chest: { iron_plate: 4 },
    liquid_tank: { steel_plate: 8 },
    generator: { iron_plate: 5, gear: 3 },
    oil_generator: { steel_plate: 8, robot_arm: 1 },
    solar_panel: { steel_plate: 5, circuit: 5 },
    inserter: { robot_arm: 1, gear: 1 },
    export_bus: { circuit: 5, steel_plate: 5 },
    market_stall: { iron_plate: 10, circuit: 2 },
};

const buildingPower: Record<BuildingType, number> = {
    miner: 10, belt_mk1: 1, belt_mk2: 2, belt_mk3: 4, assembler: 20, assembler_mk2: 50, generator: -100, chest: 0,
    solar_panel: -25, inserter: 2, export_bus: 5, market_stall: 0, oil_pump: 15,
    refinery: 30, oil_generator: -250, concrete_mixer: 25, water_pump: 10, pipe: 0, liquid_tank: 0
};

const buildingSizes: Record<BuildingType, {w: number, h: number}> = {
    miner: {w: 1, h: 1}, belt_mk1: {w: 1, h: 1}, belt_mk2: {w: 1, h: 1}, belt_mk3: {w: 1, h: 1},
    assembler: {w: 1, h: 1}, assembler_mk2: {w: 2, h: 2},
    generator: {w: 1, h: 1}, chest: {w: 1, h: 1}, solar_panel: {w: 2, h: 2}, inserter: {w: 1, h: 1},
    export_bus: {w: 1, h: 1}, market_stall: {w: 2, h: 2}, oil_pump: {w: 1, h: 1}, refinery: {w: 2, h: 2},
    oil_generator: {w: 2, h: 1}, concrete_mixer: {w: 2, h: 2}, water_pump: {w: 1, h: 1}, pipe: {w: 1, h: 1}, liquid_tank: {w: 1, h: 1}
};

const resourcePrices: Partial<Record<Resource, { buy: number; sell: number }>> = {
    iron_ore: { buy: 10, sell: 5 }, copper_ore: { buy: 15, sell: 8 }, coal: { buy: 20, sell: 12 }, stone: { buy: 8, sell: 4 }, zinc_ore: { buy: 18, sell: 10 },
    crude_oil: { buy: 30, sell: 18}, water: { buy: 5, sell: 1},
    iron_plate: { buy: 25, sell: 15 }, copper_plate: { buy: 30, sell: 18 }, steel_plate: { buy: 80, sell: 45 }, zinc_plate: { buy: 40, sell: 22 },
    gear: { buy: 100, sell: 60 }, circuit: { buy: 250, sell: 150 }, plastic: { buy: 70, sell: 40 }, concrete: { buy: 50, sell: 28 }, brass_ingot: { buy: 120, sell: 70 },
    robot_arm: { buy: 500, sell: 300 }, advanced_circuit: { buy: 800, sell: 500 },
};

const buildingHelp: Record<BuildingType, string> = {
    miner: "Extracts solid resources (Iron, Copper, Coal, Stone, Zinc) from the ground. Must be placed on a resource patch.",
    belt_mk1: "Transports items. The basic, slowest version.",
    belt_mk2: "A faster version of the belt, requiring gears to craft.",
    belt_mk3: "The fastest belt, requiring advanced components.",
    pipe: "Transports fluids like water and oil. Cannot transport solid items.",
    inserter: "Moves items between adjacent buildings, such as from a belt to an assembler.",
    assembler: "Crafts items from recipes. Can handle basic to intermediate recipes.",
    assembler_mk2: "An advanced, larger assembler for complex recipes. Can be overclocked.",
    refinery: "Processes crude oil into plastic, a key component for advanced electronics.",
    concrete_mixer: "Mixes stone and water to create strong concrete, used for advanced structures.",
    chest: "A simple storage container for items. Can be loaded and unloaded by inserters.",
    liquid_tank: "A storage container for fluids like water and oil.",
    generator: "Burns coal to generate a moderate amount of power for your factory.",
    oil_generator: "Burns crude oil to generate a large amount of power.",
    solar_panel: "Generates a small, constant amount of power for free during the day (simulated).",
    oil_pump: "Extracts crude oil from oil patches.",
    water_pump: "Pumps water from water tiles.",
    export_bus: "Automatically sells any item that passes over it on a belt for cash.",
    market_stall: "Allows you to manually buy and sell resources. Click on it when placed to open the market UI.",
};

const FactorySimulator: React.FC = () => {
    const { toast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [items, setItems] = useState<ItemOnBelt[]>([]);
    const [inventory, setInventory] = useState<Partial<Record<Resource, number>>>({ iron_plate: 20, gear: 5, circuit: 10, steel_plate: 10, belt_mk1: 20 });
    const [money, setMoney] = useState(1000);
    
    const [tool, setTool] = useState<Tool>('build');
    const [selectedBuildingType, setSelectedBuildingType] = useState<BuildingType>('belt_mk1');
    const [buildingDirection, setBuildingDirection] = useState<Direction>('right');
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

    // --- SAVE & LOAD ---
    const saveState = useCallback(() => {
        try {
            const gameState = { buildings, items, inventory, money, nextId: nextId.current };
            localStorage.setItem('factorySimulatorSave', JSON.stringify(gameState));
        } catch (e) {
            console.error("Failed to save game state:", e);
        }
    }, [buildings, items, inventory, money]);

    useEffect(() => {
        const handle = setInterval(saveState, SAVE_INTERVAL);
        return () => clearInterval(handle);
    }, [saveState]);
    
    useEffect(() => {
        try {
            const savedState = localStorage.getItem('factorySimulatorSave');
            if (savedState) {
                const { buildings, items, inventory, money, nextId: savedNextId } = JSON.parse(savedState);
                setBuildings(buildings || []);
                setItems(items || []);
                setInventory(inventory || { iron_plate: 20, gear: 5 });
                setMoney(money || 1000);
                nextId.current = savedNextId || 0;
            }
        } catch (e) {
            console.error("Failed to load game state:", e);
        }
    }, []);
    // --- END SAVE & LOAD ---


    const totalPowerConsumption = useMemo(() => buildings.reduce((acc, b) => b.power && b.power > 0 ? acc + b.power : acc, 0), [buildings]);
    const totalPowerProduction = useMemo(() => buildings.reduce((acc, b) => b.power && b.power < 0 ? acc - b.power : acc, 0), [buildings]);
    const powerGridStatus = useMemo(() => totalPowerProduction >= totalPowerConsumption, [totalPowerConsumption, totalPowerProduction]);
    const selectedBuilding = useMemo(() => buildings.find(b => b.id === selectedBuildingId), [buildings, selectedBuildingId]);
    
    const destroyBuilding = (building: Building) => {
        setBuildings(prev => prev.filter(b => b.id !== building.id));
        
        let itemToRefund: Resource | undefined = building.type as Resource;
        if (building.type.startsWith('belt')) itemToRefund = 'belt_mk1';
        if (building.type === 'pipe') itemToRefund = 'pipe_item';

        const cost = buildingCosts[itemToRefund];
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
        
        const itemToCraft = selectedBuildingType === 'pipe' ? 'pipe_item' : (selectedBuildingType as Resource);
        const cost = buildingCosts[itemToCraft];
        if (cost) {
            for (const [resource, amount] of Object.entries(cost)) {
                if ((inventory[resource as Resource] || 0) < amount) {
                    toast({ title: 'Not enough resources', description: `You need ${amount} ${resource.replace(/_/g, ' ')} to build a ${selectedBuildingType.replace(/_/g, ' ')}.`, variant: 'destructive'});
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
            fluidInventory: {}, 
            ...( (selectedBuildingType === 'assembler' || selectedBuildingType === 'assembler_mk2' || selectedBuildingType === 'refinery' || selectedBuildingType === 'concrete_mixer') && { recipe: selectedRecipe, productionProgress: 0 }),
        };
        setBuildings(prev => [...prev, newBuilding]);
    };
    
    const handCraft = (itemToCraft: Resource) => {
        const cost = buildingCosts[itemToCraft] || recipes[itemToCraft];
        if (!cost || !('inputs' in cost)) {
            toast({title: 'Cannot be crafted', description: `This item cannot be hand-crafted.`});
            return;
        }
        let canCraft = true;
        for (const [resource, amount] of Object.entries(cost.inputs)) {
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
        for (const [resource, amount] of Object.entries(cost.inputs)) {
            newInventory[resource as Resource]! -= amount;
        }
        newInventory[itemToCraft as Resource] = (newInventory[itemToCraft as Resource] || 0) + ('output' in cost ? cost.output : 1);
        setInventory(newInventory);
        toast({title: 'Crafted!', description: `You crafted ${'output' in cost ? cost.output : 1}x ${itemToCraft.replace(/_/g, ' ')}.`});
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
    
    // Game Loop
    useEffect(() => {
        if (!isPlaying) return;
        const gameTick = setInterval(() => {
            const hasPower = powerGridStatus;
            
            // Item Movement on Belts
            setItems(currentItems => {
                const movedItems: ItemOnBelt[] = [];
                currentItems.forEach(item => {
                    const belt = buildings.find(b => b.x === item.x && b.y === item.y);
                    if (!belt || !belt.type.startsWith('belt')) {
                      movedItems.push(item); return; 
                    }
                    
                    const [nextX, nextY] = getOutputCoords(belt);
                    const beltSpeed = BELT_SPEEDS[belt.type] || 0.1;
                    
                    let newProgress = item.progress + beltSpeed;
                    if(newProgress >= 1) {
                        const nextTile = buildings.find(b => b.x === nextX && b.y === nextY);
                        const isNextTileOccupied = currentItems.some(i => i.id !== item.id && i.x === nextX && i.y === nextY && i.progress < beltSpeed) || movedItems.some(i => i.x === nextX && i.y === nextY);
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
    }, [isPlaying, buildings, powerGridStatus]);


    // Drawing logic
    const draw = useCallback(() => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(viewOffset.x, viewOffset.y);

        // Draw Grass Background and Grid
        for(let y=0; y<GRID_SIZE; y++) for(let x=0; x<GRID_SIZE; x++) {
            ctx.fillStyle = (x+y) % 2 === 0 ? '#228B22' : '#208020';
            ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'; ctx.lineWidth = 0.5;
            ctx.strokeRect(x*cellSize, y*cellSize, cellSize, cellSize);
        }

        // Draw Patches
        for(let y=0; y<GRID_SIZE; y++) for(let x=0; x<GRID_SIZE; x++) {
            const resource = resourcePatches[`${x},${y}`] || fluidTiles[`${x},${y}`];
            if (resource) {
                 const baseColor = (resourceColors[resource] || '#ffffff');
                if (resource === 'crude_oil' || resource === 'water') {
                    ctx.fillStyle = baseColor;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                     ctx.fillStyle = resource === 'crude_oil' ? 'rgba(80,80,80,0.3)' : 'rgba(255,255,255,0.3)';
                    for(let i=0; i<3; i++) { ctx.beginPath(); ctx.arc(x*cellSize+(Math.random()*0.8+0.1)*cellSize, y*cellSize+(Math.random()*0.8+0.1)*cellSize, Math.random()*2*zoom+1, 0, Math.PI*2); ctx.fill(); }
                } else {
                    ctx.fillStyle = baseColor + '66';
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    ctx.fillStyle = baseColor;
                    const patchX = x * cellSize;
                    const patchY = y * cellSize;

                    if (resource === 'iron_ore') {
                        for(let i=0; i<3; i++) { ctx.beginPath(); ctx.moveTo(patchX+3*zoom, patchY+5*zoom); ctx.lineTo(patchX+10*zoom, patchY+12*zoom); ctx.lineTo(patchX+5*zoom, patchY+15*zoom); ctx.fill(); }
                        for(let i=0; i<2; i++) { ctx.beginPath(); ctx.moveTo(patchX+15*zoom, patchY+18*zoom); ctx.lineTo(patchX+25*zoom, patchY+22*zoom); ctx.lineTo(patchX+20*zoom, patchY+30*zoom); ctx.fill(); }
                    } else if (resource === 'copper_ore') {
                        for(let i=0; i<5; i++) { ctx.beginPath(); ctx.arc(patchX+(Math.random()*0.6+0.2)*cellSize, patchY+(Math.random()*0.6+0.2)*cellSize, 2*zoom, 0, Math.PI*2); ctx.fill(); }
                    } else if (resource === 'coal') {
                        for(let i=0; i<4; i++) { ctx.fillRect(patchX+(Math.random()*0.7+0.15)*cellSize, patchY+(Math.random()*0.7+0.15)*cellSize, 8*zoom, 8*zoom); }
                    } else if (resource === 'stone') {
                        for(let i=0; i<4; i++) { ctx.fillStyle = '#b0b0b0'; ctx.fillRect(patchX+(Math.random()*0.6+0.1)*cellSize, patchY+(Math.random()*0.6+0.1)*cellSize, 8*zoom, 8*zoom); ctx.fillStyle = '#8a8a8a'; ctx.fillRect(patchX+(Math.random()*0.6+0.2)*cellSize, patchY+(Math.random()*0.6+0.2)*cellSize, 6*zoom, 6*zoom);}
                    } else if (resource === 'zinc_ore') {
                        for(let i=0; i<4; i++) { 
                            ctx.save();
                            ctx.translate(patchX+(Math.random()*0.7+0.15)*cellSize, patchY+(Math.random()*0.7+0.15)*cellSize);
                            ctx.rotate(Math.PI/4);
                            ctx.fillRect(0,0, 6*zoom, 6*zoom);
                            ctx.restore();
                        }
                    }
                }
            }
        }


        buildings.forEach(b => {
            let color = '#4B5563'; // Default
            if (b.type.startsWith('belt')) color = '#6B7280';
            else if (b.type.startsWith('assembler')) color = '#10B981';
            else if (b.type === 'miner') color = '#6366F1';
            else if (b.type.includes('generator')) color = '#F59E0B';
            else if (b.type === 'solar_panel') color = '#3B82F6';
            else if (b.type === 'chest') color = '#ca8a04';
            else if (b.type === 'inserter') color = '#94a3b8';
            else if (b.type === 'market_stall') color = '#ec4899';
            else if (b.type.includes('oil')) color = '#18181b';
            
            ctx.fillStyle = color;
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 2 * zoom;

            if (b.id === selectedBuildingId) {
                ctx.strokeStyle = '#facc15'; ctx.lineWidth = 4 * zoom;
            }
            ctx.fillRect(b.x*cellSize, b.y*cellSize, b.width*cellSize, b.height*cellSize);
            ctx.strokeRect(b.x*cellSize, b.y*cellSize, b.width*cellSize, b.height*cellSize);
            
            const centerX = b.x*cellSize + (b.width*cellSize)/2, centerY = b.y*cellSize + (b.height*cellSize)/2;
            if(!['chest', 'generator', 'solar_panel', 'market_stall', 'liquid_tank'].includes(b.type)) {
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(b.direction === 'right' ? 0 : b.direction === 'down' ? Math.PI/2 : b.direction === 'left' ? Math.PI : -Math.PI/2);
                
                if (b.type === 'inserter') {
                    ctx.fillStyle = '#475569'; ctx.fillRect(-5*zoom, -10*zoom, 10*zoom, 20*zoom);
                    ctx.fillStyle = 'yellow'; ctx.fillRect(-2*zoom, -14*zoom, 4*zoom, 8*zoom);
                } else if (b.type === 'pipe') {
                    ctx.fillStyle = '#9ca3af'; ctx.fillRect(-4*zoom, -16*zoom, 8*zoom, 32*zoom);
                }
                else {
                    ctx.fillStyle = 'white'; ctx.beginPath();
                    const arrowSize = 5*zoom;
                    ctx.moveTo(-arrowSize, -arrowSize); ctx.lineTo(arrowSize, 0); ctx.lineTo(-arrowSize, arrowSize);
                    ctx.closePath(); ctx.fill();
                }
                ctx.restore();
            }
        });

        items.forEach(item => {
            const currentTile = buildings.find(b => b.x <= item.x && item.x < b.x+b.width && b.y <= item.y && item.y < b.y+b.height);
            let itemX = item.x * cellSize + cellSize / 2, itemY = item.y * cellSize + cellSize / 2;
            if(currentTile && !['chest', 'liquid_tank'].includes(currentTile.type)){
                const [nextX, nextY] = getOutputCoords(currentTile);
                const startX = item.x * cellSize + cellSize / 2, startY = item.y * cellSize + cellSize / 2;
                const endX = nextX * cellSize + cellSize / 2, endY = nextY * cellSize + cellSize / 2;
                itemX = startX + (endX - startX) * item.progress;
                itemY = startY + (endY - startY) * item.progress;
            }
            ctx.fillStyle = resourceColors[item.resource] || '#ffffff';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 0.5 * zoom;
            ctx.beginPath();
            ctx.arc(itemX, itemY, cellSize * 0.2, 0, 2*Math.PI);
            ctx.fill();
            ctx.stroke();
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
    
    useEffect(() => { const anim = requestAnimationFrame(draw); return () => cancelAnimationFrame(anim); }, [draw]);
    
    const handlePanStart = (e: React.MouseEvent) => { setIsPanning(true); setPanStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y }); };
    const handlePanMove = (e: React.MouseEvent) => { if (!isPanning) return; setViewOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y }); };
    const handlePanEnd = () => setIsPanning(false);

    const updateOverclock = (id: number, overclock: number) => {
        setBuildings(prev => prev.map(b => b.id === id ? {...b, overclock} : b));
    };

    const BuildingButton = ({ type, icon, name, tier }: { type: BuildingType; icon: React.ReactNode; name: string; tier?: string }) => (
        <Button variant={selectedBuildingType === type ? 'secondary' : 'outline'} onClick={() => setSelectedBuildingType(type)} className="w-full justify-start gap-2 text-xs h-9">
            <div className="w-4 h-4">{icon}</div>
            <span className="flex-grow">{name}</span>
            {tier && <Badge variant="outline" className="text-xs">{tier}</Badge>}
        </Button>
    );

    return (
        <div className="flex flex-col w-full h-full bg-card text-foreground">
            <div className="flex items-center justify-between p-2 border-b border-border bg-background">
                <h3 className="text-lg font-bold text-primary">Automation Simulator</h3>
                 <div className="flex items-center gap-4">
                    <div className="text-sm font-bold flex items-center gap-2 text-green-400">
                        <CircleDollarSign className="w-4 h-4"/> {money.toLocaleString()}
                    </div>
                    <div className={cn("text-sm font-bold flex items-center gap-2", powerGridStatus ? "text-green-400" : "text-red-500")}>
                        <Zap className="w-4 h-4"/> {totalPowerConsumption.toFixed(0)} / {totalPowerProduction} MW
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={isPlaying ? 'destructive' : 'default'} size="sm" onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause className="w-4 h-4"/>:<Play className="w-4 h-4"/>}</Button>
                    <Button variant="outline" onClick={() => { localStorage.removeItem('factorySimulatorSave'); window.location.reload(); }} size="sm"><RefreshCw className="w-4 h-4"/></Button>
                    <Button variant="outline" onClick={() => setZoom(z => Math.min(z*1.2, 2))} size="sm"><ZoomIn className="w-4 h-4"/></Button>
                    <Button variant="outline" onClick={() => setZoom(z => Math.max(z/1.2, 0.5))} size="sm"><ZoomOut className="w-4 h-4"/></Button>
                </div>
            </div>
            <div className="flex-grow flex">
                <div className="w-72 p-2 border-r border-border bg-background">
                    <Tabs defaultValue="build">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="build"><Wrench /></TabsTrigger>
                            <TabsTrigger value="inventory"><Package /></TabsTrigger>
                            <TabsTrigger value="market"><CircleDollarSign /></TabsTrigger>
                            <TabsTrigger value="help"><Info /></TabsTrigger>
                        </TabsList>
                        <TabsContent value="build" className="space-y-2 mt-2">
                            {selectedBuilding ? (
                                <Card>
                                    <CardHeader className='p-2 flex-row justify-between items-center'>
                                        <CardTitle className='text-base capitalize'>{selectedBuilding.type.replace(/_/g, ' ')}</CardTitle>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setSelectedBuildingId(null)}><X className="h-4 w-4"/></Button>
                                    </CardHeader>
                                    <CardContent className="p-2 space-y-2">
                                        <p className="text-xs text-muted-foreground">ID: {selectedBuilding.id}</p>
                                        {selectedBuilding.type === 'assembler_mk2' ? (
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
                                                            <span className="capitalize">{res.replace(/_/g, ' ')}: {count}</span>
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
                                        ) : <p className="text-xs text-muted-foreground">Power: {selectedBuilding.power?.toFixed(1)} MW</p>}
                                        {(selectedBuilding.type === 'assembler' || selectedBuilding.type === 'assembler_mk2' || selectedBuilding.type === 'refinery' || selectedBuilding.type === 'concrete_mixer') && (
                                            <div className="pl-4 space-y-1 border-t pt-2 mt-2">
                                                <Label>Recipe</Label>
                                                {Object.keys(recipes).filter(r => recipes[r as Resource]?.building.includes(selectedBuilding.type)).map(recipe => (
                                                    <Button key={recipe} size="sm" variant={selectedBuilding.recipe === recipe ? 'secondary' : 'ghost'} onClick={() => setBuildings(prev => prev.map(b => b.id === selectedBuilding.id ? {...b, recipe: recipe as Resource} : b))} className="w-full justify-start text-xs capitalize">{recipe.replace(/_/g, ' ')}</Button>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Accordion type="multiple" defaultValue={['logistics', 'production', 'power']} className="w-full">
                                <Card className="border-none"><CardContent className="p-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Button variant={tool === 'destroy' ? 'destructive' : 'outline'} size="icon" onClick={() => setTool(t => t === 'destroy' ? 'build' : 'destroy')}><Hammer/></Button>
                                        <Button size="icon" variant="outline" onClick={rotateBuilding}>
                                            <RotateCcw className={cn( 'transition-transform', buildingDirection === 'down' && 'rotate-90', buildingDirection === 'left' && 'rotate-180', buildingDirection === 'up' && 'rotate-[-90deg]' )}/>
                                        </Button>
                                        <span className="text-sm">Rotate (R)</span>
                                    </div>
                                    <AccordionItem value="logistics">
                                        <AccordionTrigger>Logistics</AccordionTrigger>
                                        <AccordionContent className="space-y-1">
                                            <BuildingButton type="belt_mk1" icon={<Box />} name="Belt" tier="Mk1"/>
                                            <BuildingButton type="belt_mk2" icon={<Box />} name="Belt" tier="Mk2"/>
                                            <BuildingButton type="belt_mk3" icon={<Box />} name="Belt" tier="Mk3"/>
                                            <BuildingButton type="pipe" icon={<LineIcon />} name="Pipe" />
                                            <BuildingButton type="inserter" icon={<Wrench />} name="Inserter" />
                                            <BuildingButton type="chest" icon={<Package />} name="Chest" />
                                            <BuildingButton type="liquid_tank" icon={<Droplet />} name="Liquid Tank" />
                                            <BuildingButton type="export_bus" icon={<CircleDollarSign />} name="Export Bus" />
                                            <BuildingButton type="market_stall" icon={<CircleDollarSign />} name="Market Stall (2x2)" />
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="production">
                                        <AccordionTrigger>Production</AccordionTrigger>
                                        <AccordionContent className="space-y-1">
                                            <BuildingButton type="miner" icon={<HardHat />} name="Miner" />
                                            <BuildingButton type="oil_pump" icon={<Droplet />} name="Oil Pump" />
                                            <BuildingButton type="water_pump" icon={<Droplet />} name="Water Pump" />
                                            <BuildingButton type="refinery" icon={<Factory />} name="Refinery (2x2)" />
                                            <BuildingButton type="concrete_mixer" icon={<Brick />} name="Concrete Mixer (2x2)" />
                                            <BuildingButton type="assembler" icon={<Cog />} name="Assembler" tier="Mk1" />
                                            <BuildingButton type="assembler_mk2" icon={<Cog />} name="Assembler (2x2)" tier="Mk2" />
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="power">
                                        <AccordionTrigger>Power</AccordionTrigger>
                                        <AccordionContent className="space-y-1">
                                            <BuildingButton type="generator" icon={<Zap />} name="Coal Generator" />
                                            <BuildingButton type="oil_generator" icon={<Zap />} name="Oil Generator (2x1)" />
                                            <BuildingButton type="solar_panel" icon={<Zap />} name="Solar Panel (2x2)" />
                                        </AccordionContent>
                                    </AccordionItem>
                                </CardContent></Card>
                                </Accordion>
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
                                                  <p key={res} className={cn("capitalize", (inventory[res as Resource] || 0) < amount ? 'text-red-400' : '')}>
                                                    <span>{res.replace(/_/g, ' ')}</span>: {amount}
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
                                <CardHeader className='p-2'><CardTitle className='text-base'>Help & Info</CardTitle></CardHeader>
                                <CardContent className='p-2 h-[60vh] overflow-y-auto'>
                                    <Accordion type="single" collapsible className='text-xs'>
                                        {Object.entries(buildingHelp).map(([key, desc]) => (
                                            <AccordionItem key={key} value={key}>
                                                <AccordionTrigger className="capitalize text-left">{key.replace(/_/g, ' ')}</AccordionTrigger>
                                                <AccordionContent>{desc}</AccordionContent>
                                            </AccordionItem>
                                        ))}
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
            
             {isMarketOpen && (
                <Dialog open={isMarketOpen} onOpenChange={setIsMarketOpen}>
                    <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Market</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="market" className="flex-grow overflow-hidden">
                            <TabsContent value="market" className="h-full">
                                <ScrollArea className="h-full">
                                    <div className='p-2 text-xs space-y-2'>
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
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};
export default FactorySimulator;
