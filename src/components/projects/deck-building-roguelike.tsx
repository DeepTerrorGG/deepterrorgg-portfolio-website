
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Swords, Shield, Heart, Zap, RotateCcw, Dna, Trash, Map, Star, ShieldAlert, ShieldOff, HeartCrack, BookOpen, Crown, Skull, Sparkles, ArrowUp, Bed, Hammer, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  upgradeDesc?: string;
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

type GameState = 'map' | 'combat' | 'reward' | 'rest' | 'upgrade' | 'game-over' | 'codex';
type MapNodeType = 'combat' | 'elite' | 'boss' | 'rest' | 'victory';

type MapNode = {
  id: string;
  level: number;
  col: number;
  type: MapNodeType;
  enemyTypeIndex?: number;
};

type MapData = {
  levels: MapNode[][];
};


// --- CARD & ENEMY DEFINITIONS ---
const cardLibrary: GameCard[] = [
  // Basic
  { id: 1, name: 'Strike', type: 'Attack', cost: 1, description: 'Deal 6 damage.', upgradeDesc: 'Deal 9 damage.', effects: [{ type: 'ATTACK', amount: 6 }] },
  { id: 2, name: 'Defend', type: 'Skill', cost: 1, description: 'Gain 5 block.', upgradeDesc: 'Gain 8 block.', effects: [{ type: 'BLOCK', amount: 5 }] },
  // Common Attacks
  { id: 3, name: 'Heavy Strike', type: 'Attack', cost: 2, description: 'Deal 12 damage.', upgradeDesc: 'Deal 16 damage.', effects: [{ type: 'ATTACK', amount: 12 }] },
  { id: 5, name: 'Quick Draw', type: 'Attack', cost: 1, description: 'Deal 3 damage. Draw 1 card.', upgradeDesc: 'Deal 4 damage. Draw 2 cards.', effects: [{ type: 'ATTACK', amount: 3 }, { type: 'DRAW', amount: 1 }] },
  { id: 7, name: 'Bash', type: 'Attack', cost: 2, description: 'Deal 8 damage. Gain 8 block.', upgradeDesc: 'Deal 10 damage. Gain 10 block.', effects: [{ type: 'ATTACK', amount: 8 }, { type: 'BLOCK', amount: 8 }] },
  { id: 8, name: 'Slice', type: 'Attack', cost: 0, description: 'Deal 4 damage.', upgradeDesc: 'Deal 6 damage.', effects: [{ type: 'ATTACK', amount: 4 }] },
  { id: 10, name: 'Double Tap', type: 'Attack', cost: 1, description: 'Deal 5 damage twice.', upgradeDesc: 'Deal 7 damage twice.', effects: [{ type: 'ATTACK', amount: 5 }, { type: 'ATTACK', amount: 5 }] },
  { id: 19, name: 'Carnage', type: 'Attack', cost: 2, description: 'Deal 20 damage.', upgradeDesc: 'Deal 28 damage.', effects: [{ type: 'ATTACK', amount: 20 }] },
  { id: 24, name: 'Pummel', type: 'Attack', cost: 1, description: 'Deal 2 damage 4 times.', upgradeDesc: 'Deal 2 damage 5 times.', effects: [{ type: 'ATTACK', amount: 2 }, { type: 'ATTACK', amount: 2 }, { type: 'ATTACK', amount: 2 }, { type: 'ATTACK', amount: 2 }] },
  { id: 25, name: 'Iron Wave', type: 'Attack', cost: 1, description: 'Gain 5 block. Deal 5 damage.', upgradeDesc: 'Gain 7 block. Deal 7 damage.', effects: [{ type: 'BLOCK', amount: 5 }, { type: 'ATTACK', amount: 5 }] },
  { id: 26, name: 'Thunderclap', type: 'Attack', cost: 1, description: 'Deal 4 damage and apply 1 Vulnerable to ALL enemies.', upgradeDesc: 'Deal 7 damage and apply 2 Vulnerable.', effects: [{ type: 'ATTACK', amount: 4 }, { type: 'VULNERABLE', amount: 1 }] },
  { id: 27, name: 'Body Slam', type: 'Attack', cost: 1, description: 'Deal damage equal to your block.', upgradeDesc: 'Cost 0. Deal damage equal to your block.', effects: [{ type: 'ATTACK', amount: 0 }] }, // Special calculation
  { id: 29, name: 'Uppercut', type: 'Attack', cost: 2, description: 'Deal 13 damage. Apply 1 Weak and 1 Vulnerable.', upgradeDesc: 'Deal 16 damage. Apply 2 Weak and 2 Vulnerable.', effects: [{ type: 'ATTACK', amount: 13 }, { type: 'WEAK', amount: 1 }, { type: 'VULNERABLE', amount: 1 }] },
  // Common Skills
  { id: 4, name: 'Fortify', type: 'Skill', cost: 2, description: 'Gain 10 block.', upgradeDesc: 'Gain 14 block.', effects: [{ type: 'BLOCK', amount: 10 }] },
  { id: 6, name: 'First Aid', type: 'Skill', cost: 1, description: 'Heal 5 HP.', upgradeDesc: 'Heal 8 HP.', effects: [{ type: 'HEAL', amount: 5 }] },
  { id: 9, name: 'Energize', type: 'Skill', cost: 0, description: 'Gain 1 Energy. Draw 1 card.', upgradeDesc: 'Gain 2 Energy. Draw 1 card.', effects: [{ type: 'ENERGY', amount: 1 }, { type: 'DRAW', amount: 1 }] },
  { id: 11, name: 'Intimidate', type: 'Skill', cost: 1, description: 'Apply 2 Vulnerable.', upgradeDesc: 'Apply 3 Vulnerable.', effects: [{ type: 'VULNERABLE', amount: 2 }] },
  { id: 12, name: 'Trip', type: 'Skill', cost: 0, description: 'Apply 1 Weak.', upgradeDesc: 'Apply 2 Weak.', effects: [{ type: 'WEAK', amount: 1 }] },
  { id: 13, name: 'Reinforce', type: 'Skill', cost: 1, description: 'Gain 7 block. If you have Block, draw 1 card.', upgradeDesc: 'Gain 10 block. If you have Block, draw 1 card.', effects: [{ type: 'BLOCK', amount: 7 }, {type: 'DRAW', amount: 1}] }, // Conditional draw
  { id: 17, name: 'Disarm', type: 'Skill', cost: 1, description: 'Apply 2 Weak to an enemy.', upgradeDesc: 'Apply 3 Weak to an enemy.', effects: [{ type: 'WEAK', amount: 2 }] },
  { id: 18, name: 'Shrug It Off', type: 'Skill', cost: 1, description: 'Gain 8 Block. Draw 1 card.', upgradeDesc: 'Gain 11 Block. Draw 1 card.', effects: [{ type: 'BLOCK', amount: 8 }, { type: 'DRAW', amount: 1 }] },
  { id: 21, name: 'Impervious', type: 'Skill', cost: 2, description: 'Gain 30 Block.', upgradeDesc: 'Gain 40 Block.', effects: [{ type: 'BLOCK', amount: 30 }] },
  { id: 23, name: 'Offering', type: 'Skill', cost: 0, description: 'Lose 6 HP. Gain 2 Energy. Draw 3 cards.', upgradeDesc: 'Lose 6 HP. Gain 2 Energy. Draw 5 cards.', effects: [{ type: 'ENERGY', amount: 2 }, { type: 'DRAW', amount: 3 }, { type: 'HEAL', amount: -6 }] },
  { id: 28, name: 'Entrench', type: 'Skill', cost: 2, description: 'Double your current block.', upgradeDesc: 'Cost 1. Double your current block.', effects: [{ type: 'BLOCK', amount: 0 }] }, // Special calculation
  { id: 30, name: 'Seeing Red', type: 'Skill', cost: 1, description: 'Gain 2 Energy.', upgradeDesc: 'Gain 3 Energy.', effects: [{ type: 'ENERGY', amount: 2 }] },
  // Powers
  { id: 50, name: 'Strength Potion', type: 'Power', cost: 1, description: 'Gain 2 Strength.', upgradeDesc: 'Gain 3 Strength.', effects: [{ type: 'STRENGTH', amount: 2 }] },
  { id: 51, name: 'Metallicize', type: 'Power', cost: 1, description: 'At the end of your turn, gain 3 Block.', upgradeDesc: 'At the end of your turn, gain 5 Block.', effects: [{ type: 'METALLICIZE', amount: 3 }] },
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

const shuffle = <T,>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const generateMap = (): MapData => {
    const numLevels = 10;
    const levels: MapNode[][] = [];
    let nodeIdCounter = 0;

    for (let i = 0; i < numLevels; i++) {
        const levelNodeCount = (i === 0 || i > 7) ? 1 : (i % 2 === 1 ? 3 : 2);
        const nodesInLevel: MapNode[] = [];
        
        let availableCols = [0, 1, 2, 3, 4, 5, 6].sort(() => 0.5 - Math.random());
        if (i === 0) {
            availableCols = [3];
        }

        let addedCount = 0;
        for (const col of availableCols) {
            if (addedCount >= levelNodeCount) break;
            if (nodesInLevel.some(n => Math.abs(n.col - col) < 2)) continue;
            
            let nodeType: MapNodeType;
            if (i === numLevels - 1) nodeType = 'victory';
            else if (i === numLevels - 2) nodeType = 'boss';
            else if (i === Math.floor(numLevels / 2) || i === numLevels - 3) nodeType = 'elite';
            else if (i === 2 || i === 6) nodeType = 'rest';
            else nodeType = 'combat';

            nodesInLevel.push({
                id: `node-${nodeIdCounter++}`,
                level: i,
                col: col,
                type: nodeType,
                enemyTypeIndex: nodeType === 'rest' || nodeType === 'victory' ? undefined : (nodeType === 'boss' ? 6 : nodeType === 'elite' ? Math.floor(Math.random() * 3) + 4 : Math.floor(Math.random() * 4)),
            });
            addedCount++;
        }
        levels.push(nodesInLevel.sort((a,b) => a.col - b.col));
    }
    return { levels };
};

const DeckBuildingRoguelike: React.FC = () => {
    const initialDeck = useMemo(() => [
        ...Array(4).fill(cardLibrary.find(c => c.id === 1)!), // 4 Strikes
        ...Array(4).fill(cardLibrary.find(c => c.id === 2)!), // 4 Defends
        cardLibrary.find(c => c.id === 25)!, // Iron Wave
        cardLibrary.find(c => c.id === 18)!, // Shrug It Off
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
    const [mapData, setMapData] = useState<MapData>(generateMap());
    const [currentLevel, setCurrentLevel] = useState(-1);
    const [currentNode, setCurrentNode] = useState<MapNode | null>(null);
    
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

  const startCombat = (node: MapNode) => {
    if (node.type === 'rest') {
        setGameState('rest');
        setCurrentNode(node);
        return;
    }
    if (node.type === 'victory') {
        setWinner('player');
        setGameState('game-over');
        return;
    }
    
    if (node.type !== 'combat' && node.type !== 'elite' && node.type !== 'boss') {
        return;
    }

    const enemyInfo = enemyTypes[node.enemyTypeIndex!];
    setEnemy({
        ...enemyInfo,
        hp: enemyInfo.maxHp!,
        block: 0,
        statusEffects: [],
        currentAttackIndex: 0,
    });
    setGameState('combat');
    setCurrentNode(node);
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

      if(card.upgraded) {
        if(effect.type === 'ATTACK' && card.id === 1) finalAmount = 9;
        if(effect.type === 'BLOCK' && card.id === 2) finalAmount = 8;
        if(effect.type === 'HEAL') finalAmount += 3;
        if(effect.type === 'ATTACK' || effect.type === 'BLOCK') {
            if(card.id === 3) finalAmount = 16;
            if(card.id === 4) finalAmount = 14;
            if(card.id === 7) finalAmount = 10;
            if(card.id === 18) finalAmount = 11;
            if(card.id === 25) finalAmount = 7;
            if(card.id === 21) finalAmount = 40;
        }
        if(effect.type === 'DRAW') {
          if (card.id === 5) cardsToDraw += 1;
        }
      }

      switch (effect.type) {
        case 'ATTACK':
          const damage = applyStatusEffectsToDamage(finalAmount, newPlayer, newEnemy);
          const damageToHp = Math.max(0, damage - newEnemy.block);
          newEnemy = { ...newEnemy, hp: newEnemy.hp - damageToHp, block: Math.max(0, newEnemy.block - damage) };
          break;
        case 'BLOCK': newPlayer.block += finalAmount; break;
        case 'DRAW': 
            let shouldDraw = !(card.name === 'Reinforce' && newPlayer.block === 0);
            if (shouldDraw) cardsToDraw += finalAmount;
            break;
        case 'HEAL': newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + finalAmount); break;
        case 'ENERGY': energyGained += finalAmount; if(card.upgraded && card.id === 9) energyGained +=1; break;
        case 'STRENGTH': case 'METALLICIZE': {
            const existing = newPlayer.statusEffects.find(e => e.type === effect.type.toLowerCase());
            let amount = effect.amount;
            if(card.upgraded && (card.id === 50 || card.id === 51)) amount += (card.id === 50 ? 1 : 2);
            if (existing) existing.duration += amount;
            else newPlayer.statusEffects.push({ type: effect.type.toLowerCase() as 'strength'|'metallicize', duration: amount });
            break;
        }
        case 'VULNERABLE': case 'WEAK':
            const target = newEnemy;
            const existingEffectIndex = target.statusEffects.findIndex(e => e.type === effect.type.toLowerCase());
            let duration = effect.duration || effect.amount;
            if (card.upgraded) duration += 1;
            if (existingEffectIndex > -1) target.statusEffects[existingEffectIndex].duration += duration;
            else target.statusEffects.push({type: effect.type.toLowerCase() as 'vulnerable'|'weak', duration });
            break;
      }
    });
    
    let finalCost = card.cost;
    if(card.upgraded) {
        if(card.id === 27) finalCost = 0; // Upgraded Body Slam
        if(card.id === 28) finalCost = 1; // Upgraded Entrench
    }
    setPlayer(newPlayer);
    if(finalCost >= 0) setEnergy(e => e - finalCost + energyGained);
    else setEnergy(0);
    const playedCard = hand[cardIndex];
    
    if (card.type === 'Power' || card.description.includes('Exhaust')) {
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

    const etherealInHand = hand.filter(c => c.description.includes('Ethereal'));
    const remainingHand = hand.filter(c => !c.description.includes('Ethereal'));
    setExhaustPile(e => [...e, ...etherealInHand]);
    setDiscardPile(d => [...d, ...remainingHand]);
    setHand([]);
    
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
                      if(existing) existing.duration += duration!;
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
    const availableCards = cardLibrary.filter(c => c.type !== 'Curse' && c.type !== 'Power' && c.id > 2); 
    const availablePowers = cardLibrary.filter(c => c.type === 'Power');
    
    if(Math.random() < 0.3) { // 30% chance for a power card
        rewards.push(availablePowers[Math.floor(Math.random() * availablePowers.length)]);
    }
    
    while(rewards.length < 3 && availableCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableCards.length);
        rewards.push(availableCards.splice(randomIndex, 1)[0]);
    }
    setCardRewards(shuffle(rewards));
  }

  const selectReward = (card: GameCard | null) => {
    if (card) {
      setDeck(d => [...d, card]);
    }
    setCardRewards([]);
    setCurrentLevel(l => l + 1);
    setGameState('map');
  }

  const restartGame = () => {
    setPlayer({ hp: 80, maxHp: 80, block: 0, statusEffects: [] });
    setEnemy(null);
    setMapData(generateMap());
    setCurrentLevel(-1);
    setCurrentNode(null);
    setDeck(shuffle([...initialDeck]));
    setDiscardPile([]); setHand([]); setExhaustPile([]); setPlayedPowers([]);
    setEnergy(maxEnergy);
    setGameState('map');
    setWinner(null);
  }
  
  const handleRestChoice = (choice: 'heal' | 'upgrade') => {
      if (choice === 'heal') {
          setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * 0.3)) }));
          setCurrentLevel(l => l + 1);
          setGameState('map');
      } else {
          setGameState('upgrade');
      }
  }
  
  const handleUpgradeCard = (cardToUpgrade: GameCard) => {
    const upgradedCard: GameCard = { ...cardToUpgrade, upgraded: true };
    const definition = cardLibrary.find(c => c.id === cardToUpgrade.id);

    if (definition?.upgradeDesc) upgradedCard.description = definition.upgradeDesc;
    
    const allCards = [...deck, ...discardPile, ...hand, ...exhaustPile];
    const indexToUpgrade = allCards.findIndex(c => c.id === cardToUpgrade.id && !c.upgraded);
    
    if (indexToUpgrade > -1) {
        allCards[indexToUpgrade] = upgradedCard;
    }
    
    setDeck(shuffle(allCards));
    setHand([]);
    setDiscardPile([]);
    setExhaustPile([]);
    
    setCurrentLevel(l => l + 1);
    setGameState('map');
  };

  const renderCard = (card: GameCard, index: number, context: 'hand' | 'codex' | 'reward' | 'upgrade') => {
      const isPlayable = card.cost <= energy || card.cost < 0;
      
      const cardComponent = (
         <div className={cn(
            "w-44 h-64 rounded-lg p-3 flex flex-col justify-between shadow-lg text-white border-2 bg-slate-800/80 backdrop-blur-sm relative overflow-hidden",
            card.upgraded && "border-yellow-400/80 ring-2 ring-yellow-400/50 shadow-yellow-500/30",
            card.type === 'Attack' && 'border-red-500/30',
            card.type === 'Skill' && 'border-blue-500/30',
            card.type === 'Power' && 'border-purple-500/30',
            card.type === 'Curse' && 'border-zinc-500/30'
        )}>
            <div className={cn(
                "absolute -top-1 -left-1 w-12 h-12 rotate-45",
                 card.type === 'Attack' && 'bg-red-500/30',
                 card.type === 'Skill' && 'bg-blue-500/30',
                 card.type === 'Power' && 'bg-purple-500/30',
                 card.type === 'Curse' && 'bg-zinc-500/30'
            )} />

            <div className="flex justify-between items-start z-10">
                <h3 className="font-bold text-sm flex items-center gap-1">
                    {card.name}
                    {card.upgraded && <Plus className="w-3 h-3 text-yellow-400"/>}
                </h3>
                {card.cost >= 0 && (
                    <span className="w-8 h-8 text-lg rounded-full font-bold flex items-center justify-center border-2 bg-sky-900 border-sky-400 text-sky-200">{card.upgraded && (card.id === 27 || card.id === 28) ? card.cost : card.cost}</span>
                )}
            </div>
            
            <div className="flex-grow flex items-center">
                <p className="text-xs my-2 z-10">{card.upgraded && card.upgradeDesc ? card.upgradeDesc : card.description}</p>
            </div>
            
            <p className="text-center text-xs font-bold uppercase opacity-60 z-10">{card.type}</p>
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
      return <div className="cursor-pointer hover:scale-105 transition-transform">{cardComponent}</div>;
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
    <div className="flex flex-col items-center justify-center w-full h-full p-4 relative backdrop-blur-sm bg-black/30 rounded-lg">
      <h2 className="text-4xl font-bold text-yellow-300 mb-8 tracking-wider">Choose Your Path</h2>
      <div className="w-full flex-grow grid grid-cols-7 gap-x-4">
        {mapData.levels.map((level, levelIndex) => (
            <React.Fragment key={levelIndex}>
                {level.map(node => {
                    const isReachable = node.level === currentLevel + 1;
                    return (
                        <div
                            key={node.id}
                            className="flex items-center justify-center"
                            style={{
                                gridColumn: node.col + 1,
                                gridRow: node.level + 1,
                            }}
                        >
                            <motion.button
                                onClick={() => isReachable && startCombat(node)}
                                className="w-24 h-24 flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-300 transform"
                                disabled={!isReachable}
                                whileHover={{ scale: isReachable ? 1.1 : 1 }}
                                initial={{ opacity: 0.5 }}
                                animate={{ opacity: isReachable ? 1 : 0.5, scale: isReachable ? 1 : 0.9, y: isReachable ? [0, -5, 0] : 0 }}
                                transition={{ y: { repeat: Infinity, duration: 1.5 }, opacity: {duration: 0.3}, scale: {duration: 0.3} }}
                            >
                                <div className={cn(
                                    "w-full h-full flex flex-col items-center justify-center rounded-md border-2",
                                    isReachable ? "bg-gray-700/80 border-yellow-400/50 cursor-pointer" : "bg-gray-900/50 border-gray-700 cursor-not-allowed"
                                )}>
                                    <div className="w-8 h-8">{ { combat: <Swords/>, elite: <Skull/>, boss: <Crown/>, victory: <Star/>, rest: <Bed/> }[node.type]}</div>
                                    <span className="text-xs font-semibold capitalize mt-1">{node.type}</span>
                                </div>
                            </motion.button>
                        </div>
                    )
                })}
            </React.Fragment>
        ))}
      </div>
      <div className="flex gap-2 mt-8 shrink-0">
        <Button onClick={restartGame}>Restart Run</Button>
        <Dialog><DialogTrigger asChild><Button variant="secondary"><BookOpen className="mr-2"/>Card Codex</Button></DialogTrigger>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-slate-900/90 border-slate-700 text-white p-0 backdrop-blur-xl">
            {renderCodex()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
);
  
  const renderReward = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <h2 className="text-3xl font-bold text-green-400">Choose a Reward</h2>
        <div className="flex gap-4">
            {cardRewards.map((card, i) => (
                <div key={i} onClick={() => selectReward(card)}>
                  {renderCard(card, i, 'reward')}
                </div>
            ))}
        </div>
         <Button variant="outline" onClick={() => selectReward(null)}>Skip</Button>
    </div>
  );

  const renderUpgradeScreen = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-white w-full">
        <h2 className="text-3xl font-bold">Upgrade a Card</h2>
        <ScrollArea className="h-[70vh] w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {[...deck, ...discardPile].filter(c => !c.upgraded && c.type !== 'Curse').map((card, i) => (
                  <div key={i} onClick={() => handleUpgradeCard(card)}>
                      {renderCard(card, i, 'upgrade')}
                  </div>
              ))}
          </div>
        </ScrollArea>
        <Button variant="outline" onClick={() => setGameState('rest')}>Back to Rest Site</Button>
    </div>
  );

  const renderRestSite = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-white">
        <h2 className="text-4xl font-bold text-yellow-300">Rest Site</h2>
        <p className="text-lg">You find a moment of peace. What will you do?</p>
        <div className="flex gap-4 mt-4">
            <Button className="h-24 w-48 flex-col gap-2" onClick={() => handleRestChoice('heal')}>
                <Bed size={32}/>
                <span>Rest</span>
                <span className="text-xs font-normal">Heal 30% of max HP</span>
            </Button>
            <Button className="h-24 w-48 flex-col gap-2" onClick={() => handleRestChoice('upgrade')}>
                <Hammer size={32} />
                <span>Upgrade</span>
                 <span className="text-xs font-normal">Upgrade a card</span>
            </Button>
        </div>
    </div>
  );
  
  const renderCodex = () => {
    const cardTypes: CardType[] = ['Attack', 'Skill', 'Power', 'Curse'];
    return (
      <div className="flex flex-col h-full">
        <DialogHeader className="p-6 border-b border-slate-700">
          <DialogTitle className="text-primary text-3xl font-bold">Card Codex</DialogTitle>
          <DialogDescription>Browse all available cards in the game.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="Attack" className="flex-grow flex flex-col p-6 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 shrink-0">
            {cardTypes.map(type => <TabsTrigger key={type} value={type}>{type}s</TabsTrigger>)}
          </TabsList>
          {cardTypes.map(type => (
            <TabsContent key={type} value={type} className="flex-grow mt-4 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cardLibrary.filter(c => c.type === type).map((card, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      {renderCard(card, i, 'codex')}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
        <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-gray-400 hover:text-white rounded-full">
              <X className="h-5 w-5" /><span className="sr-only">Close</span>
            </Button>
        </DialogClose>
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
           <Tooltip><TooltipTrigger><div className="flex items-center gap-2 text-xs cursor-pointer"><HeartCrack/>Exhaust: {exhaustPile.length}</div></TooltipTrigger><TooltipContent><p>Cards removed from combat.</p></TooltipContent></Tooltip>
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
        case 'rest': return renderRestSite();
        case 'upgrade': return renderUpgradeScreen();
        case 'codex': return renderCodex();
        case 'game-over': return (
            <div className="flex flex-col items-center justify-center gap-4">
                <h2 className={cn("text-6xl font-bold", winner === 'player' ? "text-green-400" : "text-red-500")}>
                    {winner === 'player' ? "Victory!" : "Defeated"}
                </h2>
                <Button onClick={restartGame}>Play Again</Button>
                 <Dialog><DialogTrigger asChild><Button variant="secondary"><BookOpen className="mr-2"/>Card Codex</Button></DialogTrigger>
                    <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-slate-900/90 border-slate-700 text-white p-0 backdrop-blur-xl">
                        {renderCodex()}
                    </DialogContent>
                </Dialog>
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
