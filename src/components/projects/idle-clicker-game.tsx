'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointerClick, Zap, Plus, ArrowUp, RefreshCw, Star, Award, Repeat, ShieldCheck, Hand } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

// --- TYPE DEFINITIONS ---

type CpsUpgrade = {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  cps: number; // Clicks Per Second
  level: number;
};

type ManualUpgrade = {
    id: string;
    name: string;
    description: string;
    baseCost: number;
    clickPower: number; // Clicks per manual click
    level: number;
};

type Achievement = {
    id: string;
    name: string;
    description: string;
    isUnlocked: boolean;
    condition: (state: GameStateForAchievement) => boolean;
    reward: number; // One-time click bonus
};

type GameStateForAchievement = {
    clicks: number;
    cpsUpgrades: CpsUpgrade[];
    manualUpgrades: ManualUpgrade[];
    clicksPerSecond: number;
    rebirthCount: number;
}

// --- INITIAL STATE ---

const initialCpsUpgrades: CpsUpgrade[] = [
  { id: 'cursor', name: 'Auto-Cursor', description: '+1 CPS', baseCost: 15, cps: 1, level: 0 },
  { id: 'grandma', name: 'Grandma', description: '+8 CPS', baseCost: 100, cps: 8, level: 0 },
  { id: 'factory', name: 'Click Factory', description: '+47 CPS', baseCost: 1100, cps: 47, level: 0 },
  { id: 'mine', name: 'Click Mine', description: '+260 CPS', baseCost: 12000, cps: 260, level: 0 },
  { id: 'shipment', name: 'Click Shipment', description: '+1,400 CPS', baseCost: 130000, cps: 1400, level: 0 },
  { id: 'lab', name: 'Alchemy Lab', description: '+7,800 CPS', baseCost: 1.4e6, cps: 7800, level: 0 },
  { id: 'portal', name: 'Portal', description: '+44,000 CPS', baseCost: 2e7, cps: 44000, level: 0 },
  { id: 'time_machine', name: 'Time Machine', description: '+260,000 CPS', baseCost: 3.3e8, cps: 260000, level: 0 },
  { id: 'antimatter', name: 'Antimatter Condenser', description: '+1.6M CPS', baseCost: 5.1e9, cps: 1.6e6, level: 0 },
];

const initialManualUpgrades: ManualUpgrade[] = [
    { id: 'reinforced_mouse', name: 'Reinforced Mouse', description: '+1 click per click', baseCost: 10, clickPower: 1, level: 0 },
    { id: 'golden_cursor', name: 'Golden Cursor', description: '+10 clicks per click', baseCost: 500, clickPower: 10, level: 0 },
    { id: 'diamond_finger', name: 'Diamond Finger', description: '+100 clicks per click', baseCost: 10000, clickPower: 100, level: 0 },
    { id: 'quantum_clicker', name: 'Quantum Clicker', description: '+2,000 clicks per click', baseCost: 5e6, clickPower: 2000, level: 0 },
    { id: 'celestial_tap', name: 'Celestial Tap', description: '+50,000 clicks per click', baseCost: 1e9, clickPower: 50000, level: 0 },
];


const achievementsList: Omit<Achievement, 'isUnlocked'>[] = [
    // Easy
    { id: 'ach1', name: 'Getting Started', description: 'Reach 1,000 clicks.', condition: ({clicks}) => clicks >= 1000, reward: 1000 },
    { id: 'ach_manual1', name: 'Manual Labor', description: 'Buy a Reinforced Mouse.', condition: ({manualUpgrades}) => (manualUpgrades.find(u => u.id === 'reinforced_mouse')?.level || 0) > 0, reward: 500 },
    // Medium
    { id: 'ach2', name: 'Millionaire', description: 'Reach 1,000,000 clicks.', condition: ({clicks}) => clicks >= 1e6, reward: 100000 },
    { id: 'ach4', name: 'Automation Beginner', description: 'Get 100 CPS.', condition: ({clicksPerSecond}) => clicksPerSecond >= 100, reward: 10000 },
    { id: 'ach6', name: 'Grandma\'s Army', description: 'Own 50 Grandmas.', condition: ({cpsUpgrades}) => (cpsUpgrades.find(u => u.id === 'grandma')?.level || 0) >= 50, reward: 250000 },
    // Hard
    { id: 'ach3', name: 'First Rebirth', description: 'Rebirth for the first time.', condition: ({rebirthCount}) => rebirthCount >= 1, reward: 1e6 },
    { id: 'ach5', name: 'Automation Expert', description: 'Get 10,000 CPS.', condition: ({clicksPerSecond}) => clicksPerSecond >= 10000, reward: 500000 },
    { id: 'ach7', name: 'To Infinity', description: 'Own an Antimatter Condenser.', condition: ({cpsUpgrades}) => (cpsUpgrades.find(u => u.id === 'antimatter')?.level || 0) >= 1, reward: 1e7 },
    // Very Hard
    { id: 'ach8', name: 'Billionaire', description: 'Reach 1,000,000,000 clicks.', condition: ({clicks}) => clicks >= 1e9, reward: 1e8 },
    { id: 'ach9', name: 'Industrialist', description: 'Reach 1,000,000 CPS.', condition: ({clicksPerSecond}) => clicksPerSecond >= 1e6, reward: 5e7 },
    { id: 'ach10', name: 'Reborn Again', description: 'Rebirth 5 times.', condition: ({rebirthCount}) => rebirthCount >= 5, reward: 1e9 },
    // Challenge
    { id: 'ach11', name: 'Trillionaire', description: 'Reach 1,000,000,000,000 clicks.', condition: ({clicks}) => clicks >= 1e12, reward: 1e11 },
    { id: 'ach12', name: 'Collector', description: 'Own at least 100 of every automatic upgrade.', condition: ({cpsUpgrades}) => cpsUpgrades.every(u => u.level >= 100), reward: 1e10},
    { id: 'ach13', name: 'Manual Master', description: 'Own at least 100 of every manual upgrade.', condition: ({manualUpgrades}) => manualUpgrades.every(u => u.level >= 100), reward: 1e10},
];

const IdleClickerGame: React.FC = () => {
  const { toast } = useToast();

  // --- STATE ---
  const [clicks, setClicks] = useState(0);
  const [cpsUpgrades, setCpsUpgrades] = useState<CpsUpgrade[]>(initialCpsUpgrades);
  const [manualUpgrades, setManualUpgrades] = useState<ManualUpgrade[]>(initialManualUpgrades);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; x: number; y: number; value: string }[]>([]);
  
  // New State
  const [prestigePoints, setPrestigePoints] = useState(0);
  const [rebirthCount, setRebirthCount] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(() => achievementsList.map(ach => ({...ach, isUnlocked: false})));

  // --- GAME LOOP & SAVING ---

  // Load state from local storage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('idleClicker_gameState_v3');
      if (savedState) {
          const loaded = JSON.parse(savedState);
          setClicks(loaded.clicks || 0);
          
          // Merge CPS upgrades
          const loadedCpsUpgrades = loaded.cpsUpgrades || [];
          const mergedCpsUpgrades = initialCpsUpgrades.map(iu => {
              const saved = loadedCpsUpgrades.find((su: CpsUpgrade) => su.id === iu.id);
              return saved ? { ...iu, level: saved.level } : iu;
          });
          setCpsUpgrades(mergedCpsUpgrades);

          // Merge Manual upgrades
          const loadedManualUpgrades = loaded.manualUpgrades || [];
          const mergedManualUpgrades = initialManualUpgrades.map(iu => {
              const saved = loadedManualUpgrades.find((su: ManualUpgrade) => su.id === iu.id);
              return saved ? { ...iu, level: saved.level } : iu;
          });
          setManualUpgrades(mergedManualUpgrades);

          setPrestigePoints(loaded.prestigePoints || 0);
          setRebirthCount(loaded.rebirthCount || 0);
          
          const loadedAchievements = loaded.achievements || [];
           const mergedAchievements = achievementsList.map(ach => {
              const saved = loadedAchievements.find((sa: Achievement) => sa.id === ach.id);
              return { ...ach, isUnlocked: saved ? saved.isUnlocked : false };
            });
          setAchievements(mergedAchievements);
      }
    } catch (error) {
      console.error("Failed to load from local storage", error);
      toast({ title: 'Could not load saved data', variant: 'destructive'});
    }
  }, [toast]);

  // Save state to local storage
  useEffect(() => {
    try {
      const gameState = { clicks, cpsUpgrades, manualUpgrades, prestigePoints, rebirthCount, achievements };
      localStorage.setItem('idleClicker_gameState_v3', JSON.stringify(gameState));
    } catch (error) {
       console.error("Failed to save to local storage", error);
    }
  }, [clicks, cpsUpgrades, manualUpgrades, prestigePoints, rebirthCount, achievements]);

  const clicksPerSecond = useMemo(() => {
    const baseCps = cpsUpgrades.reduce((total, upgrade) => total + (upgrade.level * upgrade.cps), 0);
    const prestigeBonus = 1 + (prestigePoints * 0.05); // 5% bonus per prestige point
    return baseCps * prestigeBonus;
  }, [cpsUpgrades, prestigePoints]);

  const manualClickPower = useMemo(() => {
    const baseClickPower = 1 + manualUpgrades.reduce((total, upgrade) => total + (upgrade.level * upgrade.clickPower), 0);
    const prestigeBonus = 1 + (prestigePoints * 0.05);
    return baseClickPower * prestigeBonus;
  }, [manualUpgrades, prestigePoints]);

  // Main game tick
  useEffect(() => {
    const gameTick = setInterval(() => {
      setClicks(prev => prev + (clicksPerSecond / 10));
    }, 100);

    return () => clearInterval(gameTick);
  }, [clicksPerSecond]);

   // Check for achievements
   useEffect(() => {
    const achievementState = { clicks, cpsUpgrades, manualUpgrades, clicksPerSecond, rebirthCount };
    achievements.forEach(ach => {
        if (!ach.isUnlocked && ach.condition(achievementState)) {
            setAchievements(prev => prev.map(a => a.id === ach.id ? {...a, isUnlocked: true} : a));
            setClicks(c => c + ach.reward);
            toast({
                title: <span className="flex items-center gap-2"><Award className="text-yellow-400"/>Achievement Unlocked!</span>,
                description: `${ach.name} - You earned ${ach.reward.toLocaleString()} clicks!`,
            });
        }
    });
  }, [clicks, cpsUpgrades, manualUpgrades, clicksPerSecond, rebirthCount, achievements, toast]);

  // --- HANDLERS ---
  const calculateCost = (upgrade: { baseCost: number; level: number }) => {
    return Math.ceil(upgrade.baseCost * Math.pow(1.15, upgrade.level));
  };
  
  const showFloatingNumber = (e: React.MouseEvent, value: string) => {
    const id = Date.now() + Math.random();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() * 40 - 20);
    const y = e.clientY - rect.top - 20; // Start slightly above the click
    setFloatingNumbers(prev => [...prev, { id, x, y, value }]);
    setTimeout(() => {
        setFloatingNumbers(prev => prev.filter(n => n.id !== id));
    }, 1000);
  };

  const handleMainClick = (e: React.MouseEvent) => {
    setClicks(prev => prev + manualClickPower);
    showFloatingNumber(e, `+${formatNumber(manualClickPower)}`);
  };

  const buyCpsUpgrade = (upgradeId: string) => {
    const upgrade = cpsUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = calculateCost(upgrade);
    if (clicks >= cost) {
      setClicks(prev => prev - cost);
      setCpsUpgrades(prev => prev.map(u => u.id === upgradeId ? { ...u, level: u.level + 1 } : u));
    } else {
      toast({ title: "Not enough clicks!", description: `You need ${formatNumber(cost)} clicks to buy a ${upgrade.name}.`, variant: "destructive" });
    }
  };

  const buyManualUpgrade = (upgradeId: string) => {
    const upgrade = manualUpgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = calculateCost(upgrade);
    if (clicks >= cost) {
      setClicks(prev => prev - cost);
      setManualUpgrades(prev => prev.map(u => u.id === upgradeId ? { ...u, level: u.level + 1 } : u));
    } else {
      toast({ title: "Not enough clicks!", description: `You need ${formatNumber(cost)} clicks to buy a ${upgrade.name}.`, variant: "destructive" });
    }
  };

  const resetGame = () => {
    setClicks(0);
    setCpsUpgrades(initialCpsUpgrades.map(u => ({...u, level: 0})));
    setManualUpgrades(initialManualUpgrades.map(u => ({...u, level: 0})));
    setPrestigePoints(0);
    setRebirthCount(0);
    setAchievements(achievementsList.map(ach => ({...ach, isUnlocked: false})));
    toast({ title: "Game Reset", description: "Your progress has been wiped." });
  };
  
  const handleRebirth = () => {
    const rebirthRequirement = 1e9; // 1 Billion clicks
    if (clicks < rebirthRequirement) {
        toast({ title: "Not yet!", description: `You need at least ${rebirthRequirement.toLocaleString()} clicks to rebirth.`, variant: 'destructive'});
        return;
    }
    const pointsToGain = Math.floor(Math.log10(clicks/1e8));
    setPrestigePoints(p => p + pointsToGain);
    setRebirthCount(c => c + 1);
    setClicks(0);
    setCpsUpgrades(initialCpsUpgrades.map(u => ({...u, level: 0})));
    setManualUpgrades(initialManualUpgrades.map(u => ({...u, level: 0})));
    toast({ title: "Rebirth Successful!", description: `You gained ${pointsToGain} Prestige Points!`});
  };

  const formatNumber = (num: number): string => {
    if (num < 1e6) return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (num < 1e9) return `${(num / 1e6).toFixed(2)}M`;
    if (num < 1e12) return `${(num / 1e9).toFixed(2)}B`;
    if (num < 1e15) return `${(num / 1e12).toFixed(2)}T`;
    return num.toExponential(2);
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
        
        {/* Left Panel: Clicker */}
        <div className="md:col-span-1 flex flex-col items-center justify-center space-y-6">
            <Card className="w-full text-center">
                <CardHeader>
                    <CardTitle className="text-3xl lg:text-4xl font-bold">{formatNumber(clicks)}</CardTitle>
                    <p className="text-sm text-muted-foreground">{formatNumber(clicksPerSecond)} clicks/sec</p>
                    {prestigePoints > 0 && <p className="text-xs text-yellow-400 font-semibold">{(prestigePoints * 5).toFixed(0)}% Prestige Bonus</p>}
                </CardHeader>
            </Card>
            <div className="relative">
              <motion.button
                onClick={handleMainClick}
                whileTap={{ scale: 0.9 }}
                className="w-48 h-48 rounded-full bg-primary text-primary-foreground shadow-2xl flex flex-col items-center justify-center"
              >
                <MousePointerClick className="h-16 w-16" />
                <span className="text-xl font-bold">Click!</span>
              </motion.button>
              <AnimatePresence>
                {floatingNumbers.map(({id, x, y, value}) => (
                    <motion.div
                        key={id}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 0, y: -50 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute text-xl font-bold text-yellow-300 pointer-events-none"
                        style={{ left: x, top: y }}
                    >
                        {value}
                    </motion.div>
                ))}
            </AnimatePresence>
          </div>
           <Button variant="destructive" size="sm" onClick={resetGame}><RefreshCw className="h-4 w-4 mr-2"/>Full Reset</Button>
        </div>

        {/* Right Panel: Tabs */}
        <Card className="md:col-span-2 shadow-inner">
            <Tabs defaultValue="cps-upgrades" className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="cps-upgrades"><ArrowUp className="mr-1 h-4 w-4"/>Auto</TabsTrigger>
                    <TabsTrigger value="manual-upgrades"><Hand className="mr-1 h-4 w-4"/>Manual</TabsTrigger>
                    <TabsTrigger value="achievements"><Star className="mr-1 h-4 w-4"/>Achieve</TabsTrigger>
                    <TabsTrigger value="rebirth"><Repeat className="mr-1 h-4 w-4"/>Rebirth</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cps-upgrades" className="flex-grow">
                    <ScrollArea className="h-[60vh]">
                    <div className="space-y-3 p-4">
                        {cpsUpgrades.map(upgrade => {
                        const cost = calculateCost(upgrade);
                        const canAfford = clicks >= cost;
                        return (
                            <Card key={upgrade.id} className={cn("flex items-center p-3 transition-colors", !canAfford && "bg-muted/50")}>
                            <div className="flex-grow">
                                <h4 className="font-bold">{upgrade.name} <Badge variant="secondary">{upgrade.level}</Badge></h4>
                                <p className="text-xs text-muted-foreground">{upgrade.description}</p>
                                <p className="text-sm font-semibold text-yellow-400">Cost: {formatNumber(cost)}</p>
                            </div>
                            <Button onClick={() => buyCpsUpgrade(upgrade.id)} disabled={!canAfford}>
                                <Plus className="mr-2 h-4 w-4"/> Buy
                            </Button>
                            </Card>
                        );
                        })}
                    </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="manual-upgrades" className="flex-grow">
                    <ScrollArea className="h-[60vh]">
                    <div className="space-y-3 p-4">
                        {manualUpgrades.map(upgrade => {
                        const cost = calculateCost(upgrade);
                        const canAfford = clicks >= cost;
                        return (
                            <Card key={upgrade.id} className={cn("flex items-center p-3 transition-colors", !canAfford && "bg-muted/50")}>
                            <div className="flex-grow">
                                <h4 className="font-bold">{upgrade.name} <Badge variant="secondary">{upgrade.level}</Badge></h4>
                                <p className="text-xs text-muted-foreground">{upgrade.description}</p>
                                <p className="text-sm font-semibold text-yellow-400">Cost: {formatNumber(cost)}</p>
                            </div>
                            <Button onClick={() => buyManualUpgrade(upgrade.id)} disabled={!canAfford}>
                                <Plus className="mr-2 h-4 w-4"/> Buy
                            </Button>
                            </Card>
                        );
                        })}
                    </div>
                    </ScrollArea>
                </TabsContent>

                 <TabsContent value="achievements" className="flex-grow">
                    <ScrollArea className="h-[60vh]">
                    <div className="space-y-3 p-4">
                        {achievements.map(ach => (
                            <Card key={ach.id} className={cn("p-3 transition-colors flex items-center gap-4", ach.isUnlocked ? "bg-green-500/10 border-green-500/30" : "bg-muted/50")}>
                               <ShieldCheck className={cn("h-8 w-8", ach.isUnlocked ? 'text-green-400' : 'text-muted-foreground')}/>
                               <div className="flex-grow">
                                   <h4 className="font-bold">{ach.name}</h4>
                                   <p className="text-xs text-muted-foreground">{ach.description}</p>
                                   {ach.isUnlocked && <p className="text-xs font-semibold text-yellow-400">Reward: +{ach.reward.toLocaleString()} clicks</p>}
                               </div>
                            </Card>
                        ))}
                    </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="rebirth" className="flex-grow flex items-center justify-center">
                    <div className="text-center space-y-4 p-4">
                       <h3 className="text-2xl font-bold">Rebirth</h3>
                       <p className="text-muted-foreground">Reset your progress to gain Prestige Points. Each point permanently boosts your CPS and manual clicks by 5%.</p>
                       <Card className="p-4">
                           <p className="font-bold text-lg">Current Prestige: {prestigePoints} points</p>
                           <p className="text-sm text-yellow-400">{(prestigePoints * 5).toFixed(0)}% Bonus</p>
                           <p className="text-xs mt-2 text-muted-foreground">Rebirths: {rebirthCount}</p>
                       </Card>
                       <Button onClick={handleRebirth} disabled={clicks < 1e9} className="w-full">
                           <Repeat className="mr-2 h-4 w-4"/>
                           Rebirth (Req: 1B Clicks)
                       </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default IdleClickerGame;
