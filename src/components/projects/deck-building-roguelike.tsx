
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Swords, Shield, Heart, Zap, RotateCcw, Dna, Trash, Map, Star, ShieldAlert, ShieldOff, HeartCrack, BookOpen, Crown, Skull, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

// --- TYPE DEFINITIONS ---
type CardType = 'Attack' | 'Skill' | 'Power' | 'Curse';
type EffectType = 'ATTACK' | 'BLOCK' | 'DRAW' | 'HEAL' | 'VULNERABLE' | 'WEAK' | 'ENERGY' | 'STRENGTH' | 'METALLICIZE' | 'ADD_CURSE';

type CardEffect = { 
  type: EffectType;
  amount: number; 
  duration?: number; // For status effects
};

type GameCard = {
  id: number;
  name: string;
  type: CardType;
  cost: number;
  description: string;
  effects: CardEffect[];
  upgraded?: boolean;
};

type StatusEffect = {
    type: 'vulnerable' | 'weak' | 'strength' | 'metallicize';
    duration: number; // For buffs/debuffs, this is turns. For strength, this is the amount.
}

type Actor = {
  hp: number;
  maxHp: number;
  block: number;
  statusEffects: StatusEffect[];
};

type Enemy = Actor & {
    name: string;
    attackPattern: {damage: number, block?: number, effect?: CardEffect}[];
    currentAttackIndex: number;
};

type GameState = 'map' | 'combat' | 'reward' | 'game-over' | 'codex';
type MapNodeType = 'combat' | 'elite' | 'boss' | 'rest' | 'shop' | 'victory';
type MapNode = { type: MapNodeType, enemyTypeIndex?: number };

// --- CARD & ENEMY DEFINITIONS ---
const cardLibrary: GameCard[] = [
  // Basic
  { id: 1, name: 'Strike', type: 'Attack', cost: 1, description: 'Deal 6 damage.', effects: [{ type: 'ATTACK', amount: 6 }] },
  { id: 2, name: 'Defend', type: 'Skill', cost: 1, description: 'Gain 5 block.', effects: [{ type: 'BLOCK', amount: 5 }] },
  // Common Attacks
  { id: 3, name: 'Heavy Strike', type: 'Attack', cost: 2, description: 'Deal 12 damage.', effects: [{ type: 'ATTACK', amount: 12 }] },
  { id: 5, name: 'Quick Draw', type: 'Attack', cost: 1, description: 'Deal 3 damage. Draw 1 card.', effects: [{ type: 'ATTACK', amount: 3 }, { type: 'DRAW', amount: 1 }] },
  { id: 7, name: 'Bash', type: 'Attack', cost: 2, description: 'Deal 8 damage. Gain 8 block.', effects: [{ type: 'ATTACK', amount: 8 }, { type: 'BLOCK', amount: 8 }] },
  { id: 8, name: 'Slice', type: 'Attack', cost: 0, description: 'Deal 4 damage.', effects: [{ type: 'ATTACK', amount: 4 }] },
  { id: 10, name: 'Double Tap', type: 'Attack', cost: 1, description: 'Deal 5 damage twice.', effects: [{ type: 'ATTACK', amount: 5 }, { type: 'ATTACK', amount: 5 }] },
  { id: 19, name: 'Carnage', type: 'Attack', cost: 2, description: 'Deal 20 damage.', effects: [{ type: 'ATTACK', amount: 20 }] },
  { id: 24, name: 'Pummel', type: 'Attack', cost: 1, description: 'Deal 2 damage 4 times.', effects: [{ type: 'ATTACK', amount: 2 }, { type: 'ATTACK', amount: 2 }, { type: 'ATTACK', amount: 2 }, { type: 'ATTACK', amount: 2 }] },
  { id: 25, name: 'Iron Wave', type: 'Attack', cost: 1, description: 'Gain 5 block. Deal 5 damage.', effects: [{ type: 'BLOCK', amount: 5 }, { type: 'ATTACK', amount: 5 }] },
  { id: 26, name: 'Thunderclap', type: 'Attack', cost: 1, description: 'Deal 4 damage and apply 1 Vulnerable to ALL enemies.', effects: [{ type: 'ATTACK', amount: 4 }, { type: 'VULNERABLE', amount: 1 }] },
  { id: 27, name: 'Body Slam', type: 'Attack', cost: 1, description: 'Deal damage equal to your block.', effects: [{ type: 'ATTACK', amount: 0 }] }, // Special calculation
  { id: 29, name: 'Uppercut', type: 'Attack', cost: 2, description: 'Deal 13 damage. Apply 1 Weak and 1 Vulnerable.', effects: [{ type: 'ATTACK', amount: 13 }, { type: 'WEAK', amount: 1 }, { type: 'VULNERABLE', amount: 1 }] },
  // Common Skills
  { id: 4, name: 'Fortify', type: 'Skill', cost: 2, description: 'Gain 10 block.', effects: [{ type: 'BLOCK', amount: 10 }] },
  { id: 6, name: 'First Aid', type: 'Skill', cost: 1, description: 'Heal 5 HP.', effects: [{ type: 'HEAL', amount: 5 }] },
  { id: 9, name: 'Energize', type: 'Skill', cost: 0, description: 'Gain 1 Energy. Draw 1 card.', effects: [{ type: 'ENERGY', amount: 1 }, { type: 'DRAW', amount: 1 }] },
  { id: 11, name: 'Intimidate', type: 'Skill', cost: 1, description: 'Apply 2 Vulnerable.', effects: [{ type: 'VULNERABLE', amount: 2 }] },
  { id: 12, name: 'Trip', type: 'Skill', cost: 0, description: 'Apply 1 Weak.', effects: [{ type: 'WEAK', amount: 1 }] },
  { id: 13, name: 'Reinforce', type: 'Skill', cost: 1, description: 'Gain 7 block. If you have Block, draw 1 card.', effects: [{ type: 'BLOCK', amount: 7 }, {type: 'DRAW', amount: 1}] }, // Conditional draw
  { id: 17, name: 'Disarm', type: 'Skill', cost: 1, description: 'Apply 2 Weak to an enemy.', effects: [{ type: 'WEAK', amount: 2 }] },
  { id: 18, name: 'Shrug It Off', type: 'Skill', cost: 1, description: 'Gain 8 Block. Draw 1 card.', effects: [{ type: 'BLOCK', amount: 8 }, { type: 'DRAW', amount: 1 }] },
  { id: 21, name: 'Impervious', type: 'Skill', cost: 2, description: 'Gain 30 Block.', effects: [{ type: 'BLOCK', amount: 30 }] },
  { id: 23, name: 'Offering', type: 'Skill', cost: 0, description: 'Lose 6 HP. Gain 2 Energy. Draw 3 cards.', effects: [{ type: 'ENERGY', amount: 2 }, { type: 'DRAW', amount: 3 }, { type: 'HEAL', amount: -6 }] },
  { id: 28, name: 'Entrench', type: 'Skill', cost: 2, description: 'Double your current block.', effects: [{ type: 'BLOCK', amount: 0 }] }, // Special calculation
  { id: 30, name: 'Seeing Red', type: 'Skill', cost: 1, description: 'Gain 2 Energy.', effects: [{ type: 'ENERGY', amount: 2 }] },
  // Powers
  { id: 50, name: 'Strength Potion', type: 'Power', cost: 1, description: 'Gain 2 Strength. (Deal 2 more damage with each attack for the rest of combat)', effects: [{ type: 'STRENGTH', amount: 2 }] },
  { id: 51, name: 'Metallicize', type: 'Power', cost: 1, description: 'At the end of your turn, gain 3 Block.', effects: [{ type: 'METALLICIZE', amount: 3 }] },
  // Curses
  { id: 100, name: 'Clumsy', type: 'Curse', cost: -2, description: 'Unplayable. Ethereal. (Exhausts when in hand at end of turn)', effects: []},
];

const enemyTypes: Omit<Enemy, keyof Actor | 'currentAttackIndex'>[] = [
    { name: 'Slime', attackPattern: [{damage: 7}], maxHp: 40 },
    { name: 'Goblin', attackPattern: [{damage: 5}, {damage: 9}], maxHp: 52 },
    { name: 'Orc', attackPattern: [{damage: 0, block: 10}, {damage: 15}], maxHp: 75 },
    { name: 'Cultist', attackPattern: [{damage: 0, effect: {type: 'VULNERABLE', amount: 2, duration: 2}}, {damage: 12}], maxHp: 48 },
    { name: 'Armored Sentry', attackPattern: [{damage: 8, block: 8}, {damage: 8, block: 8}], maxHp: 60 },
    { name: 'Spike Slime', attackPattern: [{damage: 6, effect: {type: 'VULNERABLE', amount: 1, duration: 2}}, {damage: 0, effect: { type: 'ATTACK', amount: 3, duration: 99}}], maxHp: 45 },
    { name: 'The Hexer', attackPattern: [{damage: 10}, {damage: 0, effect: { type: 'ADD_CURSE', amount: 1, duration: 0 }}, {damage: 20}], maxHp: 150 },
];

const mapNodes: MapNode[] = [
    { type: 'combat', enemyTypeIndex: 0 },
    { type: 'combat', enemyTypeIndex: 1 },
    { type: 'combat', enemyTypeIndex: 3 },
    { type: 'combat', enemyTypeIndex: 2 },
    { type: 'elite', enemyTypeIndex: 4 },
    { type: 'boss', enemyTypeIndex: 6 },
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
        cardLibrary.find(c => c.id === 5)!,
        cardLibrary.find(c => c.id === 11)!,
    ], []);

    const [player, setPlayer] = useState<Actor>({ hp: 80, maxHp: 80, block: 0, statusEffects: [] });
    const [enemy, setEnemy] = useState<Enemy | null>(null);
    const [energy, setEnergy] = useState(3);
    const [maxEnergy, setMaxEnergy] = useState(3);
    const [deck, setDeck] = useState<GameCard[]>(() => shuffle([...initialDeck]));
    const [hand, setHand] = useState<GameCard[]>([]);
    const [discardPile, setDiscardPile] = useState<GameCard[]>([]);
    const [exhaustPile, setExhaustPile] = useState<GameCard[]>([]);
    const [playedPowers, setPlayedPowers] = useState<GameCard[]>([]);

    const [gameState, setGameState] = useState<GameState>('map');
    const [mapPosition, setMapPosition] = useState(0);
    const [cardRewards, setCardRewards] = useState<GameCard[]>([]);
    const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);

  const applyStatusEffectsToDamage = (damage: number, attacker: Actor, target: Actor) => {
    let modifiedDamage = damage;
    const strength = attacker.statusEffects.find(e => e.type === 'strength')?.duration || 0;
    modifiedDamage += strength;
    
    if (attacker.statusEffects.some(e => e.type === 'weak')) modifiedDamage = Math.floor(modifiedDamage * 0.75);
    if (target.statusEffects.some(e => e.type === 'vulnerable')) modifiedDamage = Math.floor(modifiedDamage * 1.5);
    
    return modifiedDamage;
  };
    
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

  const startPlayerTurn = useCallback((isNewCombat = false) => {
    if (isNewCombat) {
        const fullDeck = shuffle([...deck, ...discardPile, ...hand, ...exhaustPile].filter(c => c.type !== 'Curse'));
        setDeck(fullDeck);
        setDiscardPile([]);
        setHand([]);
        setExhaustPile([]);
        setPlayedPowers([]);
        const { drawn, newDeck } = drawCards(5, fullDeck, []);
        setHand(drawn);
        setDeck(newDeck);
        setPlayer(p => ({ ...p, statusEffects: [] }));
    } else {
        const { drawn, newDeck, newDiscard } = drawCards(5, deck, discardPile);
        setHand(drawn);
        setDeck(newDeck);
        setDiscardPile(newDiscard);
    }

    setEnergy(maxEnergy);
    setPlayer(p => ({ ...p, block: 0, statusEffects: p.statusEffects.map(e => e.type === 'strength' || e.type === 'metallicize' ? e : {...e, duration: e.duration-1}) .filter(e => e.duration > 0 || e.type === 'strength' || e.type === 'metallicize') }));
    setEnemy(e => e ? ({ ...e, statusEffects: e.statusEffects.map(se => ({...se, duration: se.duration-1})).filter(se => se.duration > 0) }) : null);
  }, [deck, discardPile, hand, exhaustPile, maxEnergy, drawCards]);

  const startCombat = (nodeIndex: number) => {
    const node = mapNodes[nodeIndex];
    if (node.type === 'rest') {
        setPlayer(p => ({...p, hp: Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.3))}));
        setMapPosition(p => p+1);
        return;
    }
    if (node.type !== 'combat' && node.type !== 'elite' && node.type !== 'boss') return;

    const enemyInfo = enemyTypes[node.enemyTypeIndex!];
    setEnemy({
        ...enemyInfo,
        hp: enemyInfo.maxHp!,
        block: 0,
        statusEffects: [],
        currentAttackIndex: 0,
    });
    setGameState('combat');
    startPlayerTurn(true); 
  };

  const playCard = (card: GameCard, cardIndex: number) => {
    if (gameState !== 'combat' || !enemy || (card.cost > energy && card.cost >= 0)) return;

    let newPlayer = { ...player };
    let newEnemy = { ...enemy };
    let cardsToDraw = 0;
    let energyGained = 0;
    
    if (card.type === 'Power') {
      setPlayedPowers(p => [...p, card]);
    }

    card.effects.forEach(effect => {
      let finalAmount = effect.amount;
      if(card.name === 'Body Slam') finalAmount = newPlayer.block;
      if(card.name === 'Entrench') finalAmount = newPlayer.block;

      switch (effect.type) {
        case 'ATTACK':
          const damage = applyStatusEffectsToDamage(finalAmount, newPlayer, newEnemy);
          const damageToHp = Math.max(0, damage - newEnemy.block);
          newEnemy = { ...newEnemy, hp: newEnemy.hp - damageToHp, block: Math.max(0, newEnemy.block - damage) };
          break;
        case 'BLOCK': newPlayer.block += finalAmount; break;
        case 'DRAW': 
            const shouldDraw = !(card.name === 'Reinforce' && newPlayer.block === 0);
            if (shouldDraw) cardsToDraw += finalAmount;
            break;
        case 'HEAL': newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + finalAmount); break;
        case 'ENERGY': energyGained += finalAmount; break;
        case 'STRENGTH': case 'METALLICIZE': {
            const existing = newPlayer.statusEffects.find(e => e.type === effect.type.toLowerCase());
            if (existing) existing.duration += effect.amount;
            else newPlayer.statusEffects.push({ type: effect.type.toLowerCase() as 'strength'|'metallicize', duration: effect.amount });
            break;
        }
        case 'VULNERABLE': case 'WEAK':
            const target = newEnemy;
            const existingEffectIndex = target.statusEffects.findIndex(e => e.type === effect.type.toLowerCase());
            const duration = effect.duration || effect.amount;
            if (existingEffectIndex > -1) target.statusEffects[existingEffectIndex].duration += duration;
            else target.statusEffects.push({type: effect.type.toLowerCase() as 'vulnerable'|'weak', duration });
            break;
      }
    });
    
    setPlayer(newPlayer);
    if(card.cost >= 0) setEnergy(e => e - card.cost + energyGained);
    else setEnergy(0);
    const playedCard = hand[cardIndex];
    
    if (card.type === 'Power') {
        setExhaustPile(d => [...d, playedCard]);
    } else {
        setDiscardPile(d => [...d, playedCard]);
    }
    setHand(h => h.filter((_, i) => i !== cardIndex));
    
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
    if (gameState !== 'combat' || !enemy) return;

    // Handle Ethereal cards
    const etherealInHand = hand.filter(c => c.description.includes('Ethereal'));
    const remainingHand = hand.filter(c => !c.description.includes('Ethereal'));
    setExhaustPile(e => [...e, ...etherealInHand]);
    setDiscardPile(d => [...d, ...remainingHand]);
    setHand([]);
    
    // Apply metallicize at end of turn
    const metallicizeAmount = player.statusEffects.find(e => e.type === 'metallicize')?.duration || 0;
    if (metallicizeAmount > 0) {
        setPlayer(p => ({...p, block: p.block + metallicizeAmount}));
    }
    
    setTimeout(() => {
        setEnemy(e => {
            if (!e) return null;
            let newEnemyState = { ...e, block: 0 };
            const currentAttack = e.attackPattern[e.currentAttackIndex];
            
            setPlayer(p => {
              let damageToDeal = currentAttack.damage || 0;
              if(e.statusEffects.some(ef => ef.type === 'weak')) damageToDeal = Math.floor(damageToDeal * 0.75);
              const damage = applyStatusEffectsToDamage(damageToDeal, e, p);

              const finalDamage = Math.max(0, damage - p.block);
              const newHp = p.hp - finalDamage;
              let newPlayerState = { ...p, hp: newHp, block: Math.max(0, p.block - damage) };

              if (currentAttack.effect) {
                 const {type, amount, duration} = currentAttack.effect;
                 if (type === 'VULNERABLE' || type === 'WEAK') {
                      const existing = newPlayerState.statusEffects.find(se => se.type === type.toLowerCase());
                      if(existing) existing.duration += duration;
                      else newPlayerState.statusEffects.push({type: type.toLowerCase() as 'vulnerable'|'weak', duration: duration! });
                 }
                 if(type === 'ADD_CURSE') {
                    for(let i=0; i<amount; i++) setDiscardPile(dp => [...dp, cardLibrary.find(c => c.id === 100)!]);
                 }
              }

              if (newHp <= 0) {
                  setWinner('enemy'); setGameState('game-over'); return { ...newPlayerState, hp: 0 };
              }
              return newPlayerState;
            });
            
            return { ...newEnemyState, currentAttackIndex: (e.currentAttackIndex + 1) % e.attackPattern.length };
        });
        
        if (player.hp > 0 && gameState === 'combat') startPlayerTurn();
        
    }, 1000);
  };
  
  const generateCardRewards = () => {
    const rewards: GameCard[] = [];
    const availableCards = cardLibrary.filter(c => c.type !== 'Curse' && c.type !== 'Power'); 
    const availablePowers = cardLibrary.filter(c => c.type === 'Power');
    
    // 1 Power card
    rewards.push(availablePowers[Math.floor(Math.random() * availablePowers.length)]);
    // 2 regular cards
    while(rewards.length < 3 && availableCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        rewards.push(availableCards.splice(randomIndex, 1)[0]);
    }
    setCardRewards(shuffle(rewards));
  }

  const selectReward = (card: GameCard) => {
    setDeck(d => [...d, card]);
    setCardRewards([]);
    setMapPosition(p => p + 1);
    if(mapPosition + 1 >= mapNodes.length) { // Check if it was the last node
        setWinner('player');
        setGameState('game-over');
    } else {
        setGameState('map');
    }
  }

  const restartGame = () => {
    setPlayer({ hp: 80, maxHp: 80, block: 0, statusEffects: [] });
    setEnemy(null);
    setDeck(shuffle([...initialDeck]));
    setDiscardPile([]); setHand([]); setExhaustPile([]); setPlayedPowers([]);
    setEnergy(maxEnergy);
    setGameState('map');
    setMapPosition(0);
    setWinner(null);
  }
  
  const renderCard = (card: GameCard, index: number, context: 'hand' | 'codex') => {
      const isPlayable = card.cost <= energy || card.cost < 0;
      const cardTypeColors: Record<CardType, string> = {
          'Attack': 'bg-red-800/80 border-red-500',
          'Skill': 'bg-blue-800/80 border-blue-500',
          'Power': 'bg-purple-800/80 border-purple-500',
          'Curse': 'bg-zinc-800/80 border-zinc-500',
      };
      
      const cardComponent = (
        <div className={cn("w-40 h-56 rounded-lg p-3 flex flex-col justify-between shadow-lg", cardTypeColors[card.type])}>
            <div className="flex justify-between items-start"><h3 className="font-bold text-base w-2/3">{card.name}</h3>
                {card.cost >= 0 && <span className="w-8 h-8 text-xl rounded-full bg-sky-300 text-black font-bold flex items-center justify-center border-2 border-sky-100">{card.cost}</span>}
            </div>
            <p className="text-xs">{card.description}</p>
            <p className="text-center text-xs font-bold uppercase">{card.type}</p>
        </div>
      );
      
      if(context === 'hand') {
        return (
          <motion.div key={`${card.id}-${index}`} layoutId={`card-${card.id}-${index}`}
            initial={{ opacity: 0, y: 50, rotate: (index - hand.length/2) * 5 }} animate={{ opacity: 1, y: 0, rotate: (index - hand.length/2) * 5 }} exit={{ opacity: 0, scale: 0.5 }} whileHover={{ y: -20, scale: 1.05, zIndex: 10 }} transition={{ duration: 0.2 }} onClick={() => isPlayable && playCard(card, index)}
            className={cn("cursor-pointer", !isPlayable && 'opacity-60 cursor-not-allowed')}
          >
            {cardComponent}
          </motion.div>
        );
      }
      return <div className="cursor-default">{cardComponent}</div>;
  };

  const renderStatusEffects = (actor: Actor) => {
    const icons: Record<string, React.ReactNode> = { 'vulnerable': <ShieldAlert/>, 'weak': <ShieldOff/>, 'strength': <Swords/>, 'metallicize': <Shield/> };
    const colors: Record<string, string> = { 'vulnerable': 'text-red-400', 'weak': 'text-yellow-400', 'strength': 'text-orange-400', 'metallicize': 'text-gray-400' };
    return (
      <div className="flex gap-1 absolute top-0 right-0 mt-1 mr-1 z-10">
        {actor.statusEffects.map((effect, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger>
                  <div className={cn("flex items-center gap-1 text-xs p-1 rounded-full bg-black/70 border border-white/20", colors[effect.type] || '')}>
                      {icons[effect.type]}
                      <span className="font-bold">{effect.duration}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent><p className="capitalize">{effect.type}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
        ))}
      </div>
    );
  };
  
  const renderMap = () => (
    <div className="flex flex-col items-center justify-center gap-8">
        <h2 className="text-3xl font-bold text-yellow-300">Adventure Map</h2>
        <div className="flex gap-4 p-4 bg-black/30 rounded-lg">
            {mapNodes.map((node, index) => {
                const isClickable = index === mapPosition;
                const isCompleted = index < mapPosition;
                const nodeIcons = { combat: <Swords/>, elite: <Skull/>, boss: <Crown/>, victory: <Star/>, rest: <Heart/> };
                return (
                    <Button key={index} variant={isCompleted ? 'secondary' : 'outline'} disabled={!isClickable} onClick={() => startCombat(index)} className={cn("w-16 h-16 flex-col gap-1", isClickable && "ring-2 ring-yellow-400")}>
                        <div className="h-6 w-6">{nodeIcons[node.type]}</div>
                        <span className="text-xs capitalize">{node.type}</span>
                    </Button>
                )
            })}
        </div>
        <div className="flex gap-2">
            <Button onClick={restartGame}>Restart Run</Button>
            <Button variant="secondary" onClick={() => setGameState('codex')}><BookOpen className="mr-2"/>Card Codex</Button>
        </div>
    </div>
  );
  
  const renderReward = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <h2 className="text-3xl font-bold text-green-400">Choose a Reward</h2>
        <div className="flex gap-4">
            {cardRewards.map((card, i) => (
                <div key={i} onClick={() => selectReward(card)}>
                  {renderCard(card, i, 'codex')}
                </div>
            ))}
        </div>
    </div>
  );
  
  const renderCodex = () => {
    const cardTypes: CardType[] = ['Attack', 'Skill', 'Power', 'Curse'];
    return (
      <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
        <h2 className="text-3xl font-bold text-sky-400">Card Codex</h2>
        <div className="w-full max-w-4xl h-[60vh] bg-black/30 p-4 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cardTypes.map(type => (
              <div key={type}>
                <h3 className="font-bold text-xl mb-2 text-center">{type}s</h3>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {cardLibrary.filter(c => c.type === type).map((card, i) => (
                    <div key={i}>{renderCard(card, i, 'codex')}</div>
                ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={() => setGameState('map')}>Back to Map</Button>
      </div>
    );
  }

  const renderCombat = () => (
    <>
      <div className="flex flex-col items-center gap-2 mb-8 relative">
        {enemy && <>
          {renderStatusEffects(enemy)}
          {enemy.name === 'The Hexer' ? <Crown className="w-16 h-16 text-purple-400"/> : <Dna className="w-16 h-16 text-red-400"/>}
          <p className="font-bold">{enemy.name}</p>
          <p className="text-sm text-yellow-300">Intends to {enemy.attackPattern[enemy.currentAttackIndex].damage > 0 ? `deal ${enemy.attackPattern[enemy.currentAttackIndex].damage} damage` : 'do something...'}.</p>
          <div className="relative w-48">
            <Progress value={(enemy.hp / enemy.maxHp) * 100} className="h-6 bg-red-900" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{enemy.hp} / {enemy.maxHp}</div>
          </div>
          {enemy.block > 0 && <div className="flex items-center gap-1 text-blue-300"><Shield/> {enemy.block}</div>}
        </>}
      </div>
      
      <div className="flex-grow">
          <AnimatePresence>
            <div className="h-52 flex items-center justify-center relative w-[600px]">
                {hand.map((card, index) => renderCard(card, index, 'hand'))}
            </div>
          </AnimatePresence>
      </div>

      <div className="flex justify-between items-end w-full max-w-2xl mt-auto">
        <TooltipProvider>
            <Tooltip><TooltipTrigger><div className="flex items-center gap-2 text-xs cursor-pointer"><RotateCcw/>Deck: {deck.length}</div></TooltipTrigger><TooltipContent><p>Cards remaining in your draw pile.</p></TooltipContent></Tooltip>
        </TooltipProvider>

        <div className="flex flex-col items-center relative">
             <div className="flex items-center gap-4">
                {renderStatusEffects(player)}
                <div className="flex items-center gap-1 text-blue-300"><Shield/> {player.block}</div>
                <div className="flex items-center gap-1 text-yellow-300"><Zap/> {energy}/{maxEnergy}</div>
            </div>
            {playedPowers.length > 0 && 
              <div className="flex gap-2 mt-2">
                {playedPowers.map(p => (
                  <TooltipProvider key={p.id}><Tooltip><TooltipTrigger><div className="w-8 h-8 rounded-full bg-purple-800 border-2 border-purple-500 flex items-center justify-center"><Sparkles className="w-4 h-4"/></div></TooltipTrigger><TooltipContent>{p.name}: {p.description}</TooltipContent></Tooltip></TooltipProvider>
                ))}
              </div>
            }
             <Button onClick={endPlayerTurn} disabled={gameState !== 'combat'} className="mt-2">End Turn</Button>
        </div>
        <TooltipProvider>
           <Tooltip><TooltipTrigger><div className="flex items-center gap-2 text-xs cursor-pointer"><Trash/>Discard: {discardPile.length}</div></TooltipTrigger><TooltipContent><p>Cards in your discard pile.</p></TooltipContent></Tooltip>
           <Tooltip><TooltipTrigger><div className="flex items-center gap-2 text-xs cursor-pointer"><X/>Exhaust: {exhaustPile.length}</div></TooltipTrigger><TooltipContent><p>Cards removed from combat.</p></TooltipContent></Tooltip>
        </TooltipProvider>
      </div>
      <div className="relative mt-4 w-48">
        <Progress value={(player.hp / player.maxHp) * 100} className="h-6 bg-green-900" />
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{player.hp} / {player.maxHp}</div>
      </div>
    </>
  );

  const renderContent = () => {
    switch(gameState) {
        case 'map': return renderMap();
        case 'combat': return renderCombat();
        case 'reward': return renderReward();
        case 'codex': return renderCodex();
        case 'game-over': return (
            <div className="flex flex-col items-center justify-center gap-4">
                <h2 className={cn("text-6xl font-bold", winner === 'player' ? "text-green-400" : "text-red-500")}>
                    {winner === 'player' ? "Victory!" : "Defeated"}
                </h2>
                <Button onClick={restartGame}>Play Again</Button>
                <Button variant="secondary" onClick={() => setGameState('codex')}><BookOpen className="mr-2"/>Card Codex</Button>
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
