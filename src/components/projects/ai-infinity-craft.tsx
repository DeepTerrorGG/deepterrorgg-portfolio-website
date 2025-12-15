
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Wand2, Loader2, ArrowRight, RefreshCw, X, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { craftItem } from '@/ai/flows/craft-item-flow';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

const initialElements = ['Water', 'Fire', 'Wind', 'Earth'];
const DISCOVERED_ITEMS_KEY = 'infinity-craft-items';
const FIRST_DISCOVERIES_KEY = 'infinity-craft-first-discoveries';

interface AIInfinityCraftProps {
    onGenerate: () => boolean;
    usageLeft: number;
}

const AIInfinityCraft: React.FC<AIInfinityCraftProps> = ({ onGenerate, usageLeft }) => {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [discoveredItems, setDiscoveredItems] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(DISCOVERED_ITEMS_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if(Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {
                console.error("Failed to parse saved items from localStorage", e);
            }
        }
    }
    return initialElements;
  });

  const [firstDiscoveries, setFirstDiscoveries] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(FIRST_DISCOVERIES_KEY);
        if (saved) {
            try {
                return new Set(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse first discoveries from localStorage", e);
            }
        }
    }
    return new Set();
  });

  const [slot1, setSlot1] = useState<string | null>(null);
  const [slot2, setSlot2] = useState<string | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [lastResult, setLastResult] = useState<{ item: string; isNew: boolean } | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISCOVERED_ITEMS_KEY, JSON.stringify(discoveredItems));
    }
  }, [discoveredItems]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(FIRST_DISCOVERIES_KEY, JSON.stringify(Array.from(firstDiscoveries)));
    }
  }, [firstDiscoveries]);


   useEffect(() => {
    if (!firestore) return;
    
    const syncAllDiscoveries = async () => {
      const allItems = new Set<string>(initialElements);
      try {
        const recipesQuery = query(collection(firestore, 'recipes'));
        const snapshot = await getDocs(recipesQuery);
        snapshot.forEach(doc => {
          const recipe = doc.data();
          allItems.add(recipe.item1);
          allItems.add(recipe.item2);
          allItems.add(recipe.result);
        });
        
        setDiscoveredItems(prevItems => {
            const combined = new Set([...prevItems, ...Array.from(allItems)]);
            return Array.from(combined).sort();
        });

      } catch (error) {
        console.error("Error fetching all discoveries:", error);
        toast({ title: 'Connection Error', description: 'Could not sync all discoveries from the database.', variant: 'destructive' });
      }
    };
    
    syncAllDiscoveries();
  }, [firestore, toast]);


  const handleItemClick = (item: string) => {
    if (isCrafting) return;
    if (!slot1) {
      setSlot1(item);
    } else if (!slot2) {
      setSlot2(item);
    }
  };

  const handleCraft = useCallback(async () => {
    if (!slot1 || !slot2) {
      toast({ title: 'Select two items', description: 'You need to select two items to combine.', variant: 'destructive' });
      return;
    }
    
    if (!onGenerate()) return;

    setIsCrafting(true);
    setLastResult(null);

    try {
      const { result, isNew } = await craftItem({ item1: slot1, item2: slot2 });

      if (result) {
        setLastResult({ item: result, isNew });
        if (!discoveredItems.find(i => i.toLowerCase() === result!.toLowerCase())) {
          setDiscoveredItems(prev => [...prev, result!].sort());
        }
        if (isNew) {
            setFirstDiscoveries(prev => new Set(prev).add(result));
            toast({
                title: 'First Discovery!',
                description: `You're the first to create ${result}!`,
            });
        } else {
           toast({ title: 'Combination Result', description: `${slot1} + ${slot2} = ${result}` });
        }
      } else {
        toast({ title: 'Hmm...', description: "The AI couldn't figure out what that makes. Try something else!", variant: 'default' });
      }
    } catch (error) {
      console.error("Crafting error:", error);
      toast({ title: 'AI Error', description: 'There was an error communicating with the AI.', variant: 'destructive' });
    } finally {
      setIsCrafting(false);
      setSlot1(null);
      setSlot2(null);
    }
  }, [slot1, slot2, discoveredItems, toast, onGenerate]);

  const clearSlots = () => {
    setSlot1(null);
    setSlot2(null);
  };

  const resetGame = () => {
    setDiscoveredItems(initialElements);
    setFirstDiscoveries(new Set());
    setSlot1(null);
    setSlot2(null);
    setIsCrafting(false);
    setLastResult(null);
    toast({title: "Game Reset", description: "Your local discoveries have been reset. Shared server discoveries will reload."})
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl flex flex-col lg:flex-row">
        {/* Left Side: Discovered Items */}
        <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r">
          <CardHeader>
            <CardTitle className="text-lg">Discovered Items ({discoveredItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 lg:h-[450px]">
              <div className="grid grid-cols-2 gap-2 pr-4">
                {discoveredItems.map(item => (
                  <Button
                    key={item}
                    variant="outline"
                    className="justify-start truncate flex items-center gap-2"
                    onClick={() => handleItemClick(item)}
                    disabled={isCrafting}
                  >
                    {firstDiscoveries.has(item) && <Sparkles className="h-3 w-3 text-yellow-400 flex-shrink-0" />}
                    <span className="truncate">{item}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </div>

        {/* Right Side: Crafting Area */}
        <div className="w-full lg:w-2/3 flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold text-primary">Infinity Craft AI</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-grow gap-4">
            {/* Crafting Slots */}
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <div
                className={cn(
                  "h-24 w-24 sm:h-32 sm:w-32 rounded-lg border-2 border-dashed flex items-center justify-center text-center p-2",
                  slot1 ? 'border-primary' : 'border-border'
                )}
              >
                {slot1 || 'Slot 1'}
              </div>
              <Plus className="h-8 w-8 text-muted-foreground" />
              <div
                className={cn(
                  "h-24 w-24 sm:h-32 sm:w-32 rounded-lg border-2 border-dashed flex items-center justify-center text-center p-2",
                  slot2 ? 'border-primary' : 'border-border'
                )}
              >
                {slot2 || 'Slot 2'}
              </div>
            </div>

            {/* Combine Button */}
            <Button onClick={handleCraft} disabled={!slot1 || !slot2 || isCrafting || usageLeft <= 0} className="w-48">
              {isCrafting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              {usageLeft > 0 ? 'Combine' : 'Limit Reached'}
            </Button>
            
            {/* Result Display */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 h-32">
                {isCrafting && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                {lastResult && !isCrafting && (
                     <div className="flex items-center gap-4 animate-fade-in">
                        <ArrowRight className="h-8 w-8 text-muted-foreground"/>
                        <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-lg bg-primary/10 border-2 border-primary flex items-center justify-center text-center p-2 text-primary font-bold text-lg">
                           {lastResult.item}
                           {lastResult.isNew && (
                             <div className="absolute -top-3 -right-3 bg-yellow-400 text-black p-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                1st
                             </div>
                           )}
                        </div>
                     </div>
                )}
            </div>

          </CardContent>
           <CardFooter className="flex justify-center gap-2">
                <Button variant="ghost" onClick={clearSlots} disabled={(!slot1 && !slot2) || isCrafting}>
                    <X className="mr-2 h-4 w-4" /> Clear Slots
                </Button>
                <Button variant="destructive" onClick={resetGame}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
           </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default AIInfinityCraft;
