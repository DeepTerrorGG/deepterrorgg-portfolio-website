'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointerClick, Zap, Plus, ArrowUp, RefreshCw } from 'lucide-react';

// --- TYPE DEFINITIONS ---

type Upgrade = {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  cps: number; // Clicks Per Second
  level: number;
};

// --- INITIAL STATE ---

const initialUpgrades: Upgrade[] = [
  { id: 'cursor', name: 'Auto-Cursor', description: '+1 CPS', baseCost: 15, cps: 1, level: 0 },
  { id: 'grandma', name: 'Grandma', description: '+8 CPS', baseCost: 100, cps: 8, level: 0 },
  { id: 'factory', name: 'Click Factory', description: '+47 CPS', baseCost: 1100, cps: 47, level: 0 },
  { id: 'mine', name: 'Click Mine', description: '+260 CPS', baseCost: 12000, cps: 260, level: 0 },
  { id: 'shipment', name: 'Click Shipment', description: '+1400 CPS', baseCost: 130000, cps: 1400, level: 0 },
  { id: 'lab', name: 'Alchemy Lab', description: '+7800 CPS', baseCost: 1400000, cps: 7800, level: 0 },
];

const IdleClickerGame: React.FC = () => {
  const { toast } = useToast();

  // --- STATE ---
  const [clicks, setClicks] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(initialUpgrades);
  const [floatingNumbers, setFloatingNumbers] = useState<{ id: number; x: number; y: number; value: string }[]>([]);

  // --- GAME LOOP & SAVING ---

  // Load state from local storage
  useEffect(() => {
    try {
      const savedClicks = localStorage.getItem('idleClicker_clicks');
      const savedUpgrades = localStorage.getItem('idleClicker_upgrades');
      if (savedClicks) setClicks(JSON.parse(savedClicks));
      if (savedUpgrades) setUpgrades(JSON.parse(savedUpgrades));
    } catch (error) {
      console.error("Failed to load from local storage", error);
      toast({ title: 'Could not load saved data', variant: 'destructive'});
    }
  }, [toast]);

  // Save state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('idleClicker_clicks', JSON.stringify(clicks));
      localStorage.setItem('idleClicker_upgrades', JSON.stringify(upgrades));
    } catch (error) {
       console.error("Failed to save to local storage", error);
    }
  }, [clicks, upgrades]);

  const clicksPerSecond = useMemo(() => {
    return upgrades.reduce((total, upgrade) => total + (upgrade.level * upgrade.cps), 0);
  }, [upgrades]);

  // Main game tick
  useEffect(() => {
    const gameTick = setInterval(() => {
      setClicks(prev => prev + (clicksPerSecond / 10));
    }, 100);

    return () => clearInterval(gameTick);
  }, [clicksPerSecond]);

  // --- HANDLERS ---
  const calculateCost = (upgrade: Upgrade) => {
    return Math.ceil(upgrade.baseCost * Math.pow(1.15, upgrade.level));
  };
  
  const showFloatingNumber = (e: React.MouseEvent, value: string) => {
    const id = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() * 40 - 20);
    const y = e.clientY - rect.top - 20; // Start slightly above the click
    setFloatingNumbers(prev => [...prev, { id, x, y, value }]);
    setTimeout(() => {
        setFloatingNumbers(prev => prev.filter(n => n.id !== id));
    }, 1000);
  };

  const handleMainClick = (e: React.MouseEvent) => {
    const clickValue = 1;
    setClicks(prev => prev + clickValue);
    showFloatingNumber(e, `+${clickValue}`);
  };

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const cost = calculateCost(upgrade);
    if (clicks >= cost) {
      setClicks(prev => prev - cost);
      setUpgrades(prev => prev.map(u => u.id === upgradeId ? { ...u, level: u.level + 1 } : u));
    } else {
      toast({ title: "Not enough clicks!", description: `You need ${cost.toLocaleString()} clicks to buy a ${upgrade.name}.`, variant: "destructive" });
    }
  };

  const resetGame = () => {
    setClicks(0);
    setUpgrades(initialUpgrades);
    toast({ title: "Game Reset", description: "Your progress has been wiped." });
  };
  
  const formatNumber = (num: number): string => {
    if (num < 1e3) return num.toFixed(0);
    if (num < 1e6) return `${(num / 1e3).toFixed(2)}K`;
    if (num < 1e9) return `${(num / 1e6).toFixed(2)}M`;
    if (num < 1e12) return `${(num / 1e9).toFixed(2)}B`;
    return `${(num / 1e12).toFixed(2)}T`;
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
        
        {/* Left Panel: Clicker */}
        <div className="md:col-span-1 flex flex-col items-center justify-center space-y-6">
            <Card className="w-full text-center">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold">{formatNumber(Math.floor(clicks))}</CardTitle>
                    <p className="text-sm text-muted-foreground">{formatNumber(clicksPerSecond)} clicks/sec</p>
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
        </div>

        {/* Right Panel: Upgrades */}
        <Card className="md:col-span-2 shadow-inner">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Upgrades</CardTitle>
            <Button variant="destructive" size="icon" onClick={resetGame}><RefreshCw className="h-4 w-4"/></Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-3 pr-4">
                {upgrades.map(upgrade => {
                  const cost = calculateCost(upgrade);
                  const canAfford = clicks >= cost;
                  return (
                    <Card key={upgrade.id} className={cn("flex items-center p-3 transition-colors", !canAfford && "bg-muted/50")}>
                      <div className="flex-grow">
                        <h4 className="font-bold">{upgrade.name} <Badge variant="secondary">{upgrade.level}</Badge></h4>
                        <p className="text-xs text-muted-foreground">{upgrade.description}</p>
                        <p className="text-sm font-semibold text-yellow-400">Cost: {formatNumber(cost)}</p>
                      </div>
                      <Button onClick={() => buyUpgrade(upgrade.id)} disabled={!canAfford}>
                        <Plus className="mr-2 h-4 w-4"/> Buy
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IdleClickerGame;
