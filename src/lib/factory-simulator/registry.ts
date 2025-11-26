
// 1. Define the "Types" of items
export type ItemId = 'iron_ore' | 'copper_ore' | 'coal' | 'stone' | 'zinc_ore' | 'crude_oil' | 'water'
  | 'iron_plate' | 'copper_plate' | 'steel_plate' | 'zinc_plate'
  | 'copper_wire' | 'gear' | 'pipe_item'
  | 'circuit' | 'plastic' | 'concrete' | 'brass_ingot' | 'robot_arm' | 'advanced_circuit'
  | 'belt_mk1' | 'belt_mk2' | 'belt_mk3' | 'miner' | 'assembler' | 'assembler_mk2'
  | 'inserter' | 'market_stall' | 'oil_pump' | 'refinery' | 'pipe';

export type BuildingType = 'miner' | 'belt_mk1' | 'belt_mk2' | 'belt_mk3' | 'assembler' | 'assembler_mk2' | 'generator' | 'chest' | 'solar_panel' | 'inserter' | 'export_bus' | 'market_stall' | 'oil_pump' | 'refinery' | 'oil_generator' | 'concrete_mixer' | 'water_pump' | 'pipe' | 'liquid_tank';

interface ItemDef {
  id: ItemId;
  name: string;
  stackSize: number; // Factorio style: belts stack to 100, ores to 50
  icon: string;
}

// 2. The Item Database (O(1) Lookup)
export const ITEMS: Record<ItemId, ItemDef> = {
  // Raw Resources
  iron_ore: { id: 'iron_ore', name: 'Iron Ore', stackSize: 50, icon: '🪨' },
  copper_ore: { id: 'copper_ore', name: 'Copper Ore', stackSize: 50, icon: '🪨' },
  coal: { id: 'coal', name: 'Coal', stackSize: 50, icon: '⚫' },
  stone: { id: 'stone', name: 'Stone', stackSize: 50, icon: '🧱' },
  zinc_ore: { id: 'zinc_ore', name: 'Zinc Ore', stackSize: 50, icon: '🪨' },
  crude_oil: { id: 'crude_oil', name: 'Crude Oil', stackSize: 100, icon: '💧' },
  water: { id: 'water', name: 'Water', stackSize: 100, icon: '💧' },
  
  // Processed Materials
  iron_plate: { id: 'iron_plate', name: 'Iron Plate', stackSize: 100, icon: '⬜' },
  copper_plate: { id: 'copper_plate', name: 'Copper Plate', stackSize: 100, icon: '🟧' },
  steel_plate: { id: 'steel_plate', name: 'Steel Plate', stackSize: 100, icon: '⬛' },
  zinc_plate: { id: 'zinc_plate', name: 'Zinc Plate', stackSize: 100, icon: '⬜' },
  copper_wire: { id: 'copper_wire', name: 'Copper Wire', stackSize: 200, icon: '🪱' },
  gear: { id: 'gear', name: 'Iron Gear', stackSize: 100, icon: '⚙️' },
  pipe_item: { id: 'pipe_item', name: 'Pipe', stackSize: 50, icon: '➖' },
  
  // Components
  circuit: { id: 'circuit', name: 'Electronic Circuit', stackSize: 200, icon: '📟' },
  plastic: { id: 'plastic', name: 'Plastic Bar', stackSize: 100, icon: '🟪' },
  concrete: { id: 'concrete', name: 'Concrete', stackSize: 100, icon: '🧱' },
  brass_ingot: { id: 'brass_ingot', name: 'Brass Ingot', stackSize: 100, icon: '🟨' },
  robot_arm: { id: 'robot_arm', name: 'Robot Arm', stackSize: 50, icon: '🦾' },
  advanced_circuit: { id: 'advanced_circuit', name: 'Advanced Circuit', stackSize: 200, icon: '🟩' },
  
  // Buildings
  belt_mk1: { id: 'belt_mk1', name: 'Transport Belt', stackSize: 50, icon: '⏩' },
  belt_mk2: { id: 'belt_mk2', name: 'Fast Belt', stackSize: 50, icon: '⏩' },
  belt_mk3: { id: 'belt_mk3', name: 'Express Belt', stackSize: 50, icon: '⏩' },
  miner: { id: 'miner', name: 'Electric Drill', stackSize: 10, icon: '⛏️' },
  assembler: { id: 'assembler', name: 'Assembler', stackSize: 10, icon: '🏭' },
  assembler_mk2: { id: 'assembler_mk2', name: 'Adv. Assembler', stackSize: 10, icon: '🏭' },
  inserter: { id: 'inserter', name: 'Inserter', stackSize: 50, icon: '🦾' },
  market_stall: { id: 'market_stall', name: 'Market Stall', stackSize: 10, icon: '🏪' },
  oil_pump: { id: 'oil_pump', name: 'Oil Pump', stackSize: 10, icon: '🛢️' },
  refinery: { id: 'refinery', name: 'Refinery', stackSize: 10, icon: '🔥' },
  pipe: { id: 'pipe', name: 'Pipe', stackSize: 50, icon: '➖' },
};

// 3. The Recipe Database
export interface Recipe {
  id: string;
  output: ItemId;
  outputCount: number;
  timeMs: number; // How long it takes to craft
  inputs: { item: ItemId; count: number }[];
}

export const RECIPES: Recipe[] = [
  { id: 'craft_plate', output: 'iron_plate', outputCount: 1, timeMs: 1000, inputs: [{ item: 'iron_ore', count: 1 }] },
  { id: 'craft_gear', output: 'gear', outputCount: 1, timeMs: 500, inputs: [{ item: 'iron_plate', count: 2 }] },
  { id: 'craft_belt', output: 'belt_mk1', outputCount: 2, timeMs: 500, inputs: [{ item: 'iron_plate', count: 1 }, { item: 'gear', count: 1 }] },
  { id: 'craft_pipe', output: 'pipe_item', outputCount: 2, timeMs: 500, inputs: [{ item: 'iron_plate', count: 1 }] },
  { id: 'craft_copper_plate', output: 'copper_plate', outputCount: 1, timeMs: 1000, inputs: [{ item: 'copper_ore', count: 1}] },
  { id: 'craft_copper_wire', output: 'copper_wire', outputCount: 2, timeMs: 500, inputs: [{ item: 'copper_plate', count: 1}] },
  { id: 'craft_circuit', output: 'circuit', outputCount: 1, timeMs: 600, inputs: [{ item: 'iron_plate', count: 1 }, { item: 'copper_wire', count: 3 }] },
];

export const buildingCosts: Partial<Record<ItemId, Partial<Record<ItemId, number>>>> = {
    belt_mk1: { iron_plate: 1, gear: 1 },
    miner: { iron_plate: 3, gear: 2, circuit: 1 },
    assembler: { gear: 4, circuit: 2 },
    pipe_item: { iron_plate: 1 },
};

export const buildingHelp: Record<BuildingType, string> = {
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

export const buildingPower: Record<BuildingType, number> = {
    miner: 10, belt_mk1: 1, belt_mk2: 2, belt_mk3: 4, assembler: 20, assembler_mk2: 50, generator: -100, chest: 0,
    solar_panel: -25, inserter: 2, export_bus: 5, market_stall: 0, oil_pump: 15,
    refinery: 30, oil_generator: -250, concrete_mixer: 25, water_pump: 10, pipe: 0, liquid_tank: 0
};

export const buildingSizes: Record<BuildingType, {w: number, h: number}> = {
    miner: {w: 1, h: 1}, belt_mk1: {w: 1, h: 1}, belt_mk2: {w: 1, h: 1}, belt_mk3: {w: 1, h: 1},
    assembler: {w: 1, h: 1}, assembler_mk2: {w: 2, h: 2},
    generator: {w: 1, h: 1}, chest: {w: 1, h: 1}, solar_panel: {w: 2, h: 2}, inserter: {w: 1, h: 1},
    export_bus: {w: 1, h: 1}, market_stall: {w: 2, h: 2}, oil_pump: {w: 1, h: 1}, refinery: {w: 2, h: 2},
    oil_generator: {w: 2, h: 1}, concrete_mixer: {w: 2, h: 2}, water_pump: {w: 1, h: 1}, pipe: {w: 1, h: 1}, liquid_tank: {w: 1, h: 1}
};

export const resourcePrices: Partial<Record<ItemId, { buy: number; sell: number }>> = {
    iron_ore: { buy: 10, sell: 5 }, copper_ore: { buy: 15, sell: 8 }, coal: { buy: 20, sell: 12 }, stone: { buy: 8, sell: 4 }, zinc_ore: { buy: 18, sell: 10 },
    crude_oil: { buy: 30, sell: 18}, water: { buy: 5, sell: 1},
    iron_plate: { buy: 25, sell: 15 }, copper_plate: { buy: 30, sell: 18 }, steel_plate: { buy: 80, sell: 45 }, zinc_plate: { buy: 40, sell: 22 },
    gear: { buy: 100, sell: 60 }, circuit: { buy: 250, sell: 150 }, plastic: { buy: 70, sell: 40 }, concrete: { buy: 50, sell: 28 }, brass_ingot: { buy: 120, sell: 70 },
    robot_arm: { buy: 500, sell: 300 }, advanced_circuit: { buy: 800, sell: 500 },
};
