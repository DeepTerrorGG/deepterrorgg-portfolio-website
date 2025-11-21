
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Swords, Shield, Heart, Zap, RotateCcw, Dna, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPE DEFINITIONS ---
type CardEffect = 
  | { type: 'ATTACK'; amount: number }
  | { type: 'BLOCK'; amount: number }
  | { type: 'DRAW'; amount: number }
  | { type: 'HEAL'; amount: number };

type GameCard = {
  id: number;
  name: string;
  cost: number;
  description: string;
  effects: CardEffect[];
};

type Actor = {
  hp: number;
  maxHp: number;
  block: number;
};

// --- CARD DEFINITIONS ---
const cardLibrary: GameCard[] = [
  { id: 1, name: 'Strike', cost: 1, description: 'Deal 6 damage.', effects: [{ type: 'ATTACK', amount: 6 }] },
  { id: 2, name: 'Defend', cost: 1, description: 'Gain 5 block.', effects: [{ type: 'BLOCK', amount: 5 }] },
  { id: 3, name: 'Heavy Strike', cost: 2, description: 'Deal 12 damage.', effects: [{ type: 'ATTACK', amount: 12 }] },
  { id: 4, name: 'Fortify', cost: 2, description: 'Gain 10 block.', effects: [{ type: 'BLOCK', amount: 10 }] },
  { id: 5, name: 'Quick Draw', cost: 1, description: 'Deal 3 damage. Draw 1 card.', effects: [{ type: 'ATTACK', amount: 3 }, { type: 'DRAW', amount: 1 }] },
  { id: 6, name: 'First Aid', cost: 1, description: 'Heal 5 HP.', effects: [{ type: 'HEAL', amount: 5 }] },
  { id: 7, name: 'Bash', cost: 2, description: 'Deal 8 damage. Gain 8 block.', effects: [{ type: 'ATTACK', amount: 8 }, { type: 'BLOCK', amount: 8 }] },
];

const shuffle = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const DeckBuildingRoguelike: React.FC = () => {
  const initialDeck = useMemo(() => [
    ...Array(5).fill(cardLibrary.find(c => c.id === 1)!), // 5 Strikes
    ...Array(5).fill(cardLibrary.find(c => c.id === 2)!), // 5 Defends
  ], []);

  const [player, setPlayer] = useState<Actor>({ hp: 80, maxHp: 80, block: 0 });
  const [enemy, setEnemy] = useState<Actor>({ hp: 52, maxHp: 52, block: 0 });
  
  const [energy, setEnergy] = useState(3);
  const [maxEnergy, setMaxEnergy] = useState(3);
  
  const [deck, setDeck] = useState<GameCard[]>(shuffle([...initialDeck]));
  const [hand, setHand] = useState<GameCard[]>([]);
  const [discardPile, setDiscardPile] = useState<GameCard[]>([]);
  
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  const drawCards = useCallback((amount: number, currentDeck: GameCard[], currentDiscard: GameCard[]) => {
    let newDeck = [...currentDeck];
    let newDiscard = [...currentDiscard];
    let drawn: GameCard[] = [];

    for (let i = 0; i < amount; i++) {
      if (newDeck.length === 0) {
        if (newDiscard.length === 0) break; // No more cards to draw
        newDeck = shuffle([...newDiscard]);
        newDiscard = [];
      }
      drawn.push(newDeck.pop()!);
    }
    return { drawn, newDeck, newDiscard };
  }, []);

  const startPlayerTurn = useCallback(() => {
    setPlayer(p => ({ ...p, block: 0 }));
    const { drawn, newDeck, newDiscard } = drawCards(5, deck, discardPile);
    setHand(drawn);
    setDeck(newDeck);
    setDiscardPile(newDiscard);
    setEnergy(maxEnergy);
    setIsPlayerTurn(true);
  }, [deck, discardPile, maxEnergy, drawCards]);
  
  useEffect(() => {
    startPlayerTurn();
  }, []);

  const playCard = (card: GameCard, cardIndex: number) => {
    if (!isPlayerTurn || card.cost > energy || gameState !== 'playing') return;

    let newPlayer = { ...player };
    let newEnemy = { ...enemy };
    let cardsToDraw = 0;

    card.effects.forEach(effect => {
      switch (effect.type) {
        case 'ATTACK':
          const damage = Math.max(0, effect.amount - newEnemy.block);
          const newEnemyBlock = Math.max(0, newEnemy.block - effect.amount);
          newEnemy = { ...newEnemy, hp: newEnemy.hp - damage, block: newEnemyBlock };
          break;
        case 'BLOCK':
          newPlayer.block += effect.amount;
          break;
        case 'DRAW':
          cardsToDraw += effect.amount;
          break;
        case 'HEAL':
          newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + effect.amount);
          break;
      }
    });
    
    setPlayer(newPlayer);
    if(newEnemy.hp <= 0) {
      setEnemy({ ...newEnemy, hp: 0 });
      setGameState('won');
      return;
    }
    setEnemy(newEnemy);

    setEnergy(e => e - card.cost);
    setHand(h => h.filter((_, i) => i !== cardIndex));
    setDiscardPile(d => [...d, card]);
    
    if (cardsToDraw > 0) {
      const { drawn, newDeck, newDiscard } = drawCards(cardsToDraw, deck, [...discardPile, card]);
      setHand(h => [...h.filter((_, i) => i !== cardIndex), ...drawn]);
      setDeck(newDeck);
      setDiscardPile(newDiscard);
    }
  };
  
  const endPlayerTurn = () => {
    setIsPlayerTurn(false);
    setDiscardPile(d => [...d, ...hand]);
    setHand([]);
    
    // Simple Enemy AI
    setTimeout(() => {
        setEnemy(e => ({ ...e, block: 0 })); // Enemy block resets
        const damageToDeal = 6 + Math.floor(Math.random() * 5); // Deals 6-10 damage
        setPlayer(p => {
          const damage = Math.max(0, damageToDeal - p.block);
          const newHp = p.hp - damage;
          if (newHp <= 0) {
              setGameState('lost');
              return { ...p, hp: 0 };
          }
          return { ...p, hp: newHp, block: Math.max(0, p.block - damageToDeal) };
        });

        if (gameState !== 'lost') {
            startPlayerTurn();
        }
    }, 1000);
  };
  
  const restartGame = () => {
    setPlayer({ hp: 80, maxHp: 80, block: 0 });
    setEnemy({ hp: 52, maxHp: 52, block: 0 });
    const shuffledDeck = shuffle([...initialDeck]);
    const { drawn, newDeck } = drawCards(5, shuffledDeck, []);
    setDeck(newDeck);
    setHand(drawn);
    setDiscardPile([]);
    setEnergy(maxEnergy);
    setIsPlayerTurn(true);
    setGameState('playing');
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 text-white font-serif">
      <AnimatePresence>
        {(gameState === 'won' || gameState === 'lost') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 z-20 flex flex-col items-center justify-center gap-4">
                <h2 className={cn("text-6xl font-bold", gameState === 'won' ? "text-green-400" : "text-red-500")}>
                    {gameState === 'won' ? "Victory!" : "Defeated"}
                </h2>
                <Button onClick={restartGame}>Play Again</Button>
            </motion.div>
        )}
      </AnimatePresence>
      {/* Enemy Area */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <Dna className="w-16 h-16 text-red-400"/>
        <div className="relative">
          <Progress value={(enemy.hp / enemy.maxHp) * 100} className="w-48 h-6 bg-red-900" />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
            {enemy.hp} / {enemy.maxHp}
          </div>
        </div>
         {enemy.block > 0 && <div className="flex items-center gap-1 text-blue-300"><Shield/> {enemy.block}</div>}
      </div>

      {/* Player Area */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        <div className="relative">
          <Progress value={(player.hp / player.maxHp) * 100} className="w-48 h-6 bg-green-900" />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
            {player.hp} / {player.maxHp}
          </div>
        </div>
        <div className="flex gap-4">
          {player.block > 0 && <div className="flex items-center gap-1 text-blue-300"><Shield/> {player.block}</div>}
          <div className="flex items-center gap-1 text-yellow-300"><Zap/> {energy}/{maxEnergy}</div>
        </div>
      </div>
      
      {/* Hand */}
      <div className="h-48 flex items-center justify-center gap-[-40px] my-4">
        {hand.map((card, index) => (
          <motion.div
            key={`${card.id}-${index}`}
            initial={{ opacity: 0, y: 50, rotate: (index - hand.length/2) * 5 }}
            animate={{ opacity: 1, y: 0, rotate: (index - hand.length/2) * 5 }}
            whileHover={{ y: -20, scale: 1.05, zIndex: 10 }}
            transition={{ duration: 0.3 }}
            onClick={() => playCard(card, index)}
            className={cn("w-32 h-44 bg-slate-800 border-2 rounded-lg p-2 flex flex-col justify-between cursor-pointer", energy >= card.cost && isPlayerTurn ? 'border-sky-400' : 'border-gray-600', energy < card.cost && 'opacity-60')}
          >
            <div className="flex justify-between items-center"><h3 className="font-bold text-sm">{card.name}</h3><span className="w-6 h-6 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center">{card.cost}</span></div>
            <p className="text-xs">{card.description}</p>
            <div/>
          </motion.div>
        ))}
      </div>
      
      {/* Deck & Discard & Turn Button */}
      <div className="flex justify-between items-end w-full max-w-lg">
        <div className="flex items-center gap-2 text-xs">
          <RotateCcw/>Deck: {deck.length}
        </div>
        <Button onClick={endPlayerTurn} disabled={!isPlayerTurn || gameState !== 'playing'}>End Turn</Button>
        <div className="flex items-center gap-2 text-xs">
          <Trash/>Discard: {discardPile.length}
        </div>
      </div>
    </div>
  );
};
export default DeckBuildingRoguelike;
