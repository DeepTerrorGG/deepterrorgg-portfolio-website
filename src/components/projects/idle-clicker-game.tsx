
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    manualClickPower: number;
    rebirthCount: number;
    prestigePoints: number;
}

type Booster = {
  id: number;
  x: string;
  y: string;
  type: 'click_frenzy';
} | null;

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
    // Click Milestones
    { id: 'clicks1k', name: 'Getting Started', description: 'Reach 1,000 clicks.', condition: ({clicks}) => clicks >= 1000, reward: 1000 },
    { id: 'clicks1m', name: 'Millionaire', description: 'Reach 1,000,000 clicks.', condition: ({clicks}) => clicks >= 1e6, reward: 100000 },
    { id: 'clicks1b', name: 'Billionaire', description: 'Reach 1,000,000,000 clicks.', condition: ({clicks}) => clicks >= 1e9, reward: 1e8 },
    { id: 'clicks1t', name: 'Trillionaire', description: 'Reach 1 Trillion clicks.', condition: ({clicks}) => clicks >= 1e12, reward: 1e11 },
    { id: 'clicks1q', name: 'Quadrillionaire', description: 'Reach 1 Quadrillion clicks.', condition: ({clicks}) => clicks >= 1e15, reward: 1e14 },
    { id: 'clicks1qi', name: 'Quintillionaire', description: 'Reach 1 Quintillion clicks.', condition: ({clicks}) => clicks >= 1e18, reward: 1e17 },
    { id: 'clicks1sx', name: 'Sextillionaire', description: 'Reach 1 Sextillion clicks.', condition: ({clicks}) => clicks >= 1e21, reward: 1e20 },
    { id: 'clicks1sp', name: 'Septillionaire', description: 'Reach 1 Septillion clicks.', condition: ({clicks}) => clicks >= 1e24, reward: 1e23 },

    // CPS Milestones
    { id: 'cps100', name: 'Automation Beginner', description: 'Get 100 CPS.', condition: ({clicksPerSecond}) => clicksPerSecond >= 100, reward: 10000 },
    { id: 'cps10k', name: 'Automation Expert', description: 'Get 10,000 CPS.', condition: ({clicksPerSecond}) => clicksPerSecond >= 10000, reward: 500000 },
    { id: 'cps1m', name: 'Industrialist', description: 'Reach 1,000,000 CPS.', condition: ({clicksPerSecond}) => clicksPerSecond >= 1e6, reward: 5e7 },
    { id: 'cps1b', name: 'Megafactory', description: 'Reach 1 Billion CPS.', condition: ({clicksPerSecond}) => clicksPerSecond >= 1e9, reward: 5e10 },
    { id: 'cps1t', name: 'Planetary Engine', description: 'Reach 1 Trillion CPS.', condition: ({clicksPerSecond}) => clicksPerSecond >= 1e12, reward: 5e13 },

    // Manual Click Milestones
    { id: 'manual1k', name: 'Strong Index Finger', description: 'Reach 1,000 clicks per click.', condition: ({manualClickPower}) => manualClickPower >= 1000, reward: 5e6 },
    { id: 'manual1m', name: 'Carpal Tunnel Syndrome', description: 'Reach 1 Million clicks per click.', condition: ({manualClickPower}) => manualClickPower >= 1e6, reward: 5e9 },
    { id: 'manual1b', name: 'Singularity', description: 'Reach 1 Billion clicks per click.', condition: ({manualClickPower}) => manualClickPower >= 1e9, reward: 5e12 },

    // Upgrade Count Milestones (Specific)
    { id: 'up_manual1', name: 'Manual Labor', description: 'Buy a Reinforced Mouse.', condition: ({manualUpgrades}) => (manualUpgrades.find(u => u.id === 'reinforced_mouse')?.level || 0) > 0, reward: 500 },
    { id: 'up_grandma50', name: 'Grandma\'s Army', description: 'Own 50 Grandmas.', condition: ({cpsUpgrades}) => (cpsUpgrades.find(u => u.id === 'grandma')?.level || 0) >= 50, reward: 250000 },
    { id: 'up_antimatter1', name: 'To Infinity', description: 'Own an Antimatter Condenser.', condition: ({cpsUpgrades}) => (cpsUpgrades.find(u => u.id === 'antimatter')?.level || 0) >= 1, reward: 1e7 },
    { id: 'up_all100', name: 'Collector', description: 'Own at least 100 of every automatic upgrade.', condition: ({cpsUpgrades}) => cpsUpgrades.every(u => u.level >= 100), reward: 1e10},
    { id: 'up_manual_all100', name: 'Manual Master', description: 'Own at least 100 of every manual upgrade.', condition: ({manualUpgrades}) => manualUpgrades.every(u => u.level >= 100), reward: 1e10},
    { id: 'up_factory150', name: 'Industrial Revolution', description: 'Own 150 Click Factories.', condition: ({cpsUpgrades}) => (cpsUpgrades.find(u => u.id === 'factory')?.level || 0) >= 150, reward: 1e8 },
    { id: 'up_portal50', name: 'Gatekeeper', description: 'Own 50 Portals.', condition: ({cpsUpgrades}) => (cpsUpgrades.find(u => u.id === 'portal')?.level || 0) >= 50, reward: 1e9 },
    { id: 'up_time_machine25', name: 'Time Lord', description: 'Own 25 Time Machines.', condition: ({cpsUpgrades}) => (cpsUpgrades.find(u => u.id === 'time_machine')?.level || 0) >= 25, reward: 5e9 },
    { id: 'up_all250', name: 'Hoarder', description: 'Own at least 250 of every automatic upgrade.', condition: ({cpsUpgrades}) => cpsUpgrades.every(u => u.level >= 250), reward: 1e14},
    { id: 'up_all500', name: 'Completionist', description: 'Own at least 500 of every automatic upgrade.', condition: ({cpsUpgrades}) => cpsUpgrades.every(u => u.level >= 500), reward: 1e18},
    
    // Upgrade Count Milestones (Total)
    { id: 'total_up_auto_1k', name: 'Getting Serious', description: 'Buy a total of 1,000 automatic upgrades.', condition: ({cpsUpgrades}) => cpsUpgrades.reduce((sum, u) => sum + u.level, 0) >= 1000, reward: 1e7 },
    { id: 'total_up_auto_5k', name: 'Grand Architect', description: 'Buy a total of 5,000 automatic upgrades.', condition: ({cpsUpgrades}) => cpsUpgrades.reduce((sum, u) => sum + u.level, 0) >= 5000, reward: 1e11 },
    { id: 'total_up_manual_500', name: 'Ergonomics', description: 'Buy a total of 500 manual upgrades.', condition: ({manualUpgrades}) => manualUpgrades.reduce((sum, u) => sum + u.level, 0) >= 500, reward: 1e8 },

    // Rebirth/Prestige Milestones
    { id: 'rebirth1', name: 'First Rebirth', description: 'Rebirth for the first time.', condition: ({rebirthCount}) => rebirthCount >= 1, reward: 1e6 },
    { id: 'rebirth5', name: 'Reborn Again', description: 'Rebirth 5 times.', condition: ({rebirthCount}) => rebirthCount >= 5, reward: 1e9 },
    { id: 'rebirth10', name: 'Eternal Cycle', description: 'Rebirth 10 times.', condition: ({rebirthCount}) => rebirthCount >= 10, reward: 1e12 },
    { id: 'rebirth25', name: 'Transcendent', description: 'Rebirth 25 times.', condition: ({rebirthCount}) => rebirthCount >= 25, reward: 1e15 },
    { id: 'prestige100', name: 'Power Overwhelming', description: 'Accumulate 100 Prestige Points.', condition: ({prestigePoints}) => prestigePoints >= 100, reward: 1e13 },
    { id: 'prestige500', name: 'Ascended', description: 'Accumulate 500 Prestige Points.', condition: ({prestigePoints}) => prestigePoints >= 500, reward: 1e16 },
    
    // Combination / Hardcore
    { id: 'special1', name: 'Balanced Diet', description: 'Own at least one of every upgrade type (manual and automatic).', condition: ({cpsUpgrades, manualUpgrades}) => cpsUpgrades.every(u => u.level > 0) && manualUpgrades.every(u => u.level > 0), reward: 1e8 },
    { id: 'special2', name: 'The Hard Way', description: 'Reach 1 Million clicks with less than 10 CPS.', condition: ({clicks, clicksPerSecond}) => clicks >= 1e6 && clicksPerSecond < 10, reward: 1e7 },
    { id: 'special3', name: 'Look, No Hands!', description: 'Reach 1 Billion clicks with 0 manual upgrades purchased.', condition: ({clicks, manualUpgrades}) => clicks >= 1e9 && manualUpgrades.every(u => u.level === 0), reward: 5e8 },
    { id: 'special4', name: 'Speed Runner', description: 'Reach 1 Billion clicks within your first Rebirth.', condition: ({clicks, rebirthCount}) => clicks >= 1e9 && rebirthCount === 0, reward: 1e9 },
    { id: 'special5', name: 'Zero to Hero', description: 'After a rebirth, buy one of every automatic upgrade before reaching 1 Trillion clicks.', condition: ({clicks, cpsUpgrades, rebirthCount}) => rebirthCount > 0 && clicks < 1e12 && cpsUpgrades.every(u => u.level > 0), reward: 1e12 },
    { id: 'special6', name: 'OCD', description: 'Have the exact same number of all automatic upgrades (at least 10 each).', condition: ({cpsUpgrades}) => {
        if(cpsUpgrades.some(u => u.level < 10)) return false;
        const firstLevel = cpsUpgrades[0].level;
        return cpsUpgrades.every(u => u.level === firstLevel);
    }, reward: 1e11 },
];


const IdleClickerGame: React.FC = () => {
  const { toast } = useToast();

  // --- STATE ---
  const [clicks, setClicks] = useState(0);
  const [cpsUpgrades, setCpsUpgrades] = useState<CpsUpgrade[]>(initialCpsUpgrades);
  const [manualUpgrades, setManualUpgrades] = useState<ManualUpgrade[]>(initialManualUpgrades);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; x: number; y: number; value: string }[]>([]);
  
  const [prestigePoints, setPrestigePoints] = useState(0);
  const [rebirthCount, setRebirthCount] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(() => achievementsList.map(ach => ({...ach, isUnlocked: false})));
  
  const [booster, setBooster] = useState<Booster>(null);
  const [activeBooster, setActiveBooster] = useState<'click_frenzy' | null>(null);
  const boosterTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // --- GAME LOOP & SAVING ---

  // Load state from local storage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('idleClicker_gameState_v3');
      if (savedState) {
          const loaded = JSON.parse(savedState);
          setClicks(loaded.clicks || 0);
          
          const loadedCpsUpgrades = loaded.cpsUpgrades || [];
          const mergedCpsUpgrades = initialCpsUpgrades.map(iu => {
              const saved = loadedCpsUpgrades.find((su: CpsUpgrade) => su.id === iu.id);
              return saved ? { ...iu, level: saved.level } : iu;
          });
          setCpsUpgrades(mergedCpsUpgrades);

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
    const frenzyMultiplier = activeBooster === 'click_frenzy' ? 777 : 1;
    return baseClickPower * prestigeBonus * frenzyMultiplier;
  }, [manualUpgrades, prestigePoints, activeBooster]);

  // Main game tick
  useEffect(() => {
    const gameTick = setInterval(() => {
      setClicks(prev => prev + (clicksPerSecond / 10));
    }, 100);

    return () => clearInterval(gameTick);
  }, [clicksPerSecond]);
  
  // Booster spawn logic
  useEffect(() => {
    const scheduleBooster = () => {
      // Spawn between 30 to 60 minutes
      const spawnTime = (Math.random() * 30 + 30) * 60 * 1000;
      boosterTimeoutRef.current = setTimeout(() => {
        setBooster({
          id: Date.now(),
          x: `${Math.random() * 70 + 15}%`, // 15% to 85% to stay within button
          y: `${Math.random() * 70 + 15}%`,
          type: 'click_frenzy'
        });
        // Despawn after 10 seconds
        setTimeout(() => setBooster(null), 10000);
      }, spawnTime);
    };

    scheduleBooster(); // Initial scheduling
    return () => {
      if (boosterTimeoutRef.current) clearTimeout(boosterTimeoutRef.current);
    };
  }, [rebirthCount]); // Reschedule on rebirth


   // Check for achievements
   useEffect(() => {
    const achievementState = { clicks, cpsUpgrades, manualUpgrades, clicksPerSecond, manualClickPower, rebirthCount, prestigePoints };
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
  }, [clicks, cpsUpgrades, manualUpgrades, clicksPerSecond, manualClickPower, rebirthCount, prestigePoints, achievements, toast]);

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

  const handleBoosterClick = () => {
    if (!booster) return;
    if (booster.type === 'click_frenzy') {
      setActiveBooster('click_frenzy');
      toast({ title: 'CLICK FRENZY!', description: 'All your clicks are 777x more powerful for 10 seconds!' });
      setTimeout(() => setActiveBooster(null), 10000);
    }
    setBooster(null);
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
                className={cn(
                    "w-48 h-48 rounded-full bg-primary text-primary-foreground shadow-2xl flex flex-col items-center justify-center transition-all duration-300",
                    activeBooster === 'click_frenzy' && "animate-pulse bg-yellow-400 shadow-yellow-400/50"
                )}
              >
                <MousePointerClick className="h-16 w-16" />
                <span className="text-xl font-bold">Click!</span>
              </motion.button>

              <AnimatePresence>
                {booster && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0}}
                      animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={handleBoosterClick}
                      className="absolute w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center z-10 shadow-lg shadow-yellow-400/50"
                      style={{ left: booster.x, top: booster.y }}
                    >
                      <Zap />
                    </motion.button>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {floatingNumbers.map(({id, x, y, value}) => (
                    <motion.div
                        key={id}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 0, y: -50 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute text-xl font-bold text-yellow-300 pointer-events-none z-20"
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
                    <TabsTrigger value="rebirth"><Zap className="mr-1 h-4 w-4" />Rebirth</TabsTrigger>
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

    