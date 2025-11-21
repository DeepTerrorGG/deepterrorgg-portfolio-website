
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Swords, Shield, Heart, Zap, RotateCcw, Dna, Trash, Map, Star } from 'lucide-react';
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

type Enemy = Actor & {
    name: string;
    attackPattern: number[]; // e.g. [8, 8, 15] -> attacks for 8, 8, then 15, then repeats
    currentAttackIndex: number;
};

type GameState = 'map' | 'combat' | 'reward' | 'game-over';

// --- CARD & ENEMY DEFINITIONS ---
const cardLibrary: GameCard[] = [
  { id: 1, name: 'Strike', cost: 1, description: 'Deal 6 damage.', effects: [{ type: 'ATTACK', amount: 6 }] },
  { id: 2, name: 'Defend', cost: 1, description: 'Gain 5 block.', effects: [{ type: 'BLOCK', amount: 5 }] },
  { id: 3, name: 'Heavy Strike', cost: 2, description: 'Deal 12 damage.', effects: [{ type: 'ATTACK', amount: 12 }] },
  { id: 4, name: 'Fortify', cost: 2, description: 'Gain 10 block.', effects: [{ type: 'BLOCK', amount: 10 }] },
  { id: 5, name: 'Quick Draw', cost: 1, description: 'Deal 3 damage. Draw 1 card.', effects: [{ type: 'ATTACK', amount: 3 }, { type: 'DRAW', amount: 1 }] },
  { id: 6, name: 'First Aid', cost: 1, description: 'Heal 5 HP.', effects: [{ type: 'HEAL', amount: 5 }] },
  { id: 7, name: 'Bash', cost: 2, description: 'Deal 8 damage. Gain 8 block.', effects: [{ type: 'ATTACK', amount: 8 }, { type: 'BLOCK', amount: 8 }] },
  { id: 8, name: 'Slice', cost: 0, description: 'Deal 3 damage.', effects: [{ type: 'ATTACK', amount: 3 }] },
  { id: 9, name: 'Energize', cost: 0, description: 'Draw 2 cards. Next turn, you have 1 less energy.', effects: [{ type: 'DRAW', amount: 2 }] },
];

const enemyTypes: Omit<Enemy, keyof Actor | 'currentAttackIndex'>[] = [
    { name: 'Slime', attackPattern: [7] },
    { name: 'Goblin', attackPattern: [5, 9] },
    { name: 'Orc', attackPattern: [10, 0, 15] }, // 0 attack represents a "charge up" or block turn
];

const mapNodes = [
    { type: 'combat', enemyTypeIndex: 0, enemyHp: 40 },
    { type: 'combat', enemyTypeIndex: 1, enemyHp: 52 },
    { type: 'combat', enemyTypeIndex: 2, enemyHp: 75 },
    { type: 'victory' },
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
        ...Array(5).fill(cardLibrary.find(c => c.id === 1)!),
        ...Array(5).fill(cardLibrary.find(c => c.id === 2)!),
    ], []);

    const [player, setPlayer] = useState<Actor>({ hp: 80, maxHp: 80, block: 0 });
    const [enemy, setEnemy] = useState<Enemy | null>(null);
    const [energy, setEnergy] = useState(3);
    const [maxEnergy, setMaxEnergy] = useState(3);
    const [deck, setDeck] = useState<GameCard[]>(shuffle([...initialDeck]));
    const [hand, setHand] = useState<GameCard[]>([]);
    const [discardPile, setDiscardPile] = useState<GameCard[]>([]);
    const [gameState, setGameState] = useState<GameState>('map');
    const [mapPosition, setMapPosition] = useState(0);
    const [cardRewards, setCardRewards] = useState<GameCard[]>([]);
    const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
    

  const drawCards = useCallback((amount: number, currentDeck: GameCard[], currentDiscard: GameCard[]) => {
    let newDeck = [...currentDeck];
    let newDiscard = [...currentDiscard];
    let drawn: GameCard[] = [];

    for (let i = 0; i < amount; i++) {
      if (newDeck.length === 0) {
        if (newDiscard.length === 0) break;
        newDeck = shuffle([...newDiscard]);
        newDiscard = [];
      }
      drawn.push(newDeck.pop()!);
    }
    return { drawn, newDeck, newDiscard };
  }, []);

  const startCombat = (nodeIndex: number) => {
    const node = mapNodes[nodeIndex];
    if (node.type !== 'combat') return;

    const enemyInfo = enemyTypes[node.enemyTypeIndex];
    setEnemy({
        ...enemyInfo,
        hp: node.enemyHp,
        maxHp: node.enemyHp,
        block: 0,
        currentAttackIndex: 0,
    });
    
    startPlayerTurn(true); // true to reset deck for new combat
    setGameState('combat');
  };

  const startPlayerTurn = useCallback((isNewCombat = false) => {
    setPlayer(p => ({ ...p, block: 0 }));
    let currentDeck = deck;
    let currentDiscard = discardPile;

    if(isNewCombat) {
        currentDeck = shuffle([...initialDeck, ...deck, ...discardPile]);
        currentDiscard = [];
    }

    const { drawn, newDeck, newDiscard } = drawCards(5, currentDeck, currentDiscard);
    setHand(drawn);
    setDeck(newDeck);
    setDiscardPile(newDiscard);
    setEnergy(maxEnergy);
  }, [deck, discardPile, maxEnergy, drawCards, initialDeck]);

  const playCard = (card: GameCard, cardIndex: number) => {
    if (gameState !== 'combat' || !enemy || card.cost > energy) return;

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
        case 'BLOCK': newPlayer.block += effect.amount; break;
        case 'DRAW': cardsToDraw += effect.amount; break;
        case 'HEAL': newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + effect.amount); break;
      }
    });
    
    setPlayer(newPlayer);
    setEnergy(e => e - card.cost);
    const playedCard = hand[cardIndex];
    setHand(h => h.filter((_, i) => i !== cardIndex));
    setDiscardPile(d => [...d, playedCard]);
    
    if (cardsToDraw > 0) {
      const { drawn, newDeck, newDiscard } = drawCards(cardsToDraw, deck, [...discardPile, playedCard]);
      setHand(h => [...h.filter((_, i) => i !== cardIndex), ...drawn]);
      setDeck(newDeck);
      setDiscardPile(newDiscard);
    }
    
    if(newEnemy.hp <= 0) {
      setEnemy({ ...newEnemy, hp: 0 });
      setGameState('reward');
      generateCardRewards();
      return;
    }
    setEnemy(newEnemy);
  };
  
  const endPlayerTurn = () => {
    if (gameState !== 'combat') return;
    setDiscardPile(d => [...d, ...hand]);
    setHand([]);
    
    setTimeout(() => {
        if (!enemy) return;
        setEnemy(e => e ? ({ ...e, block: 0 }) : null); 
        const nextAttackIndex = (enemy.currentAttackIndex + 1) % enemy.attackPattern.length;
        const damageToDeal = enemy.attackPattern[enemy.currentAttackIndex];
        
        setPlayer(p => {
          const damage = Math.max(0, damageToDeal - p.block);
          const newHp = p.hp - damage;
          if (newHp <= 0) {
              setWinner('enemy');
              setGameState('game-over');
              return { ...p, hp: 0 };
          }
          return { ...p, hp: newHp, block: Math.max(0, p.block - damageToDeal) };
        });

        setEnemy(e => e ? ({ ...e, currentAttackIndex: nextAttackIndex }) : null);
        
        if (player.hp > 0) {
            startPlayerTurn();
        }
    }, 1000);
  };
  
  const generateCardRewards = () => {
    const rewards: GameCard[] = [];
    const availableCards = cardLibrary.filter(c => c.id > 2); // Exclude basic Strike/Defend
    while(rewards.length < 3 && availableCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        rewards.push(availableCards.splice(randomIndex, 1)[0]);
    }
    setCardRewards(rewards);
  }

  const selectReward = (card: GameCard) => {
    setDeck(d => [...d, card]);
    setCardRewards([]);
    setMapPosition(p => p + 1);
    if(mapPosition + 1 >= mapNodes.length-1) {
        setWinner('player');
        setGameState('game-over');
    } else {
        setGameState('map');
    }
  }

  const restartGame = () => {
    setPlayer({ hp: 80, maxHp: 80, block: 0 });
    setEnemy(null);
    const newDeck = shuffle([...initialDeck]);
    setDeck(newDeck);
    setDiscardPile([]);
    setHand([]);
    setEnergy(maxEnergy);
    setGameState('map');
    setMapPosition(0);
    setWinner(null);
  }

  // Render components
  const renderMap = () => (
    <div className="flex flex-col items-center justify-center gap-8">
        <h2 className="text-3xl font-bold text-yellow-300">Adventure Map</h2>
        <div className="flex gap-4">
            {mapNodes.map((node, index) => (
                <Button key={index} disabled={index !== mapPosition} onClick={() => startCombat(index)}>
                    {node.type === 'combat' && <Swords/>}
                    {node.type === 'victory' && <Star/>}
                </Button>
            ))}
        </div>
    </div>
  );
  
  const renderReward = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <h2 className="text-3xl font-bold text-green-400">Choose a Reward</h2>
        <div className="flex gap-4">
            {cardRewards.map(card => (
                <Card key={card.id} onClick={() => selectReward(card)} className="w-40 h-56 bg-slate-800 border-2 border-sky-400 rounded-lg p-3 flex flex-col justify-between cursor-pointer hover:scale-105 transition-transform">
                    <div className="flex justify-between items-center"><h3 className="font-bold text-base">{card.name}</h3><span className="w-7 h-7 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center">{card.cost}</span></div>
                    <p className="text-sm">{card.description}</p>
                    <div/>
                </Card>
            ))}
        </div>
    </div>
  );

  const renderCombat = () => (
    <>
      <div className="flex flex-col items-center gap-2 mb-8">
        {enemy && <>
          <Dna className="w-16 h-16 text-red-400"/>
          <p className="font-bold">{enemy.name}</p>
          <p className="text-sm text-yellow-300">Intends to attack for {enemy.attackPattern[enemy.currentAttackIndex]}</p>
          <div className="relative">
            <Progress value={(enemy.hp / enemy.maxHp) * 100} className="w-48 h-6 bg-red-900" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{enemy.hp} / {enemy.maxHp}</div>
          </div>
          {enemy.block > 0 && <div className="flex items-center gap-1 text-blue-300"><Shield/> {enemy.block}</div>}
        </>}
      </div>

      <div className="h-48 flex items-center justify-center gap-[-40px] my-4">
        {hand.map((card, index) => (
          <motion.div
            key={`${card.id}-${index}`} initial={{ opacity: 0, y: 50, rotate: (index - hand.length/2) * 5 }} animate={{ opacity: 1, y: 0, rotate: (index - hand.length/2) * 5 }} whileHover={{ y: -20, scale: 1.05, zIndex: 10 }} transition={{ duration: 0.3 }} onClick={() => playCard(card, index)}
            className={cn("w-32 h-44 bg-slate-800 border-2 rounded-lg p-2 flex flex-col justify-between cursor-pointer", energy >= card.cost ? 'border-sky-400' : 'border-gray-600', energy < card.cost && 'opacity-60')}
          >
            <div className="flex justify-between items-center"><h3 className="font-bold text-sm">{card.name}</h3><span className="w-6 h-6 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center">{card.cost}</span></div>
            <p className="text-xs">{card.description}</p>
            <div/>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between items-end w-full max-w-lg mt-auto">
        <div className="flex items-center gap-2 text-xs"><RotateCcw/>Deck: {deck.length}</div>
        <div className="flex flex-col items-center">
             <div className="flex gap-4">
                {player.block > 0 && <div className="flex items-center gap-1 text-blue-300"><Shield/> {player.block}</div>}
                <div className="flex items-center gap-1 text-yellow-300"><Zap/> {energy}/{maxEnergy}</div>
            </div>
             <Button onClick={endPlayerTurn} disabled={gameState !== 'combat'} className="mt-2">End Turn</Button>
        </div>
        <div className="flex items-center gap-2 text-xs"><Trash/>Discard: {discardPile.length}</div>
      </div>
      <div className="relative mt-4">
        <Progress value={(player.hp / player.maxHp) * 100} className="w-48 h-6 bg-green-900" />
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{player.hp} / {player.maxHp}</div>
      </div>
    </>
  );

  const renderContent = () => {
    switch(gameState) {
        case 'map': return renderMap();
        case 'combat': return renderCombat();
        case 'reward': return renderReward();
        case 'game-over': return (
            <div className="flex flex-col items-center justify-center gap-4">
                <h2 className={cn("text-6xl font-bold", winner === 'player' ? "text-green-400" : "text-red-500")}>
                    {winner === 'player' ? "Victory!" : "Defeated"}
                </h2>
                <Button onClick={restartGame}>Play Again</Button>
            </div>
        );
        default: return null;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 text-white font-serif">
      {renderContent()}
    </div>
  );
};
export default DeckBuildingRoguelike;

