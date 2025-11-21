
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Swords, Shield, Heart, Zap, RotateCcw, Dna, Trash, Map, Star, ShieldAlert, ShieldOff, HeartCrack } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPE DEFINITIONS ---
type EffectType = 'ATTACK' | 'BLOCK' | 'DRAW' | 'HEAL' | 'VULNERABLE' | 'WEAK' | 'ENERGY';

type CardEffect = { 
  type: EffectType;
  amount: number; 
  duration?: number; // For status effects
};

type GameCard = {
  id: number;
  name: string;
  cost: number;
  description: string;
  effects: CardEffect[];
  upgraded?: boolean;
};

type StatusEffect = {
    type: 'vulnerable' | 'weak' | 'thorns';
    duration: number;
}

type Actor = {
  hp: number;
  maxHp: number;
  block: number;
  statusEffects: StatusEffect[];
};

type Enemy = Actor & {
    name: string;
    attackPattern: {damage: number, block?: number, effect?: {type: EffectType, amount: number, duration: number}}[];
    currentAttackIndex: number;
};

type GameState = 'map' | 'combat' | 'reward' | 'game-over';
type MapNodeType = 'combat' | 'elite' | 'boss' | 'rest' | 'shop' | 'victory';
type MapNode = { type: MapNodeType, enemyTypeIndex?: number, enemyHp?: number };

// --- CARD & ENEMY DEFINITIONS ---
const cardLibrary: GameCard[] = [
  // Basic
  { id: 1, name: 'Strike', cost: 1, description: 'Deal 6 damage.', effects: [{ type: 'ATTACK', amount: 6 }] },
  { id: 2, name: 'Defend', cost: 1, description: 'Gain 5 block.', effects: [{ type: 'BLOCK', amount: 5 }] },
  // Common
  { id: 3, name: 'Heavy Strike', cost: 2, description: 'Deal 12 damage.', effects: [{ type: 'ATTACK', amount: 12 }] },
  { id: 4, name: 'Fortify', cost: 2, description: 'Gain 10 block.', effects: [{ type: 'BLOCK', amount: 10 }] },
  { id: 5, name: 'Quick Draw', cost: 1, description: 'Deal 3 damage. Draw 1 card.', effects: [{ type: 'ATTACK', amount: 3 }, { type: 'DRAW', amount: 1 }] },
  { id: 6, name: 'First Aid', cost: 1, description: 'Heal 5 HP.', effects: [{ type: 'HEAL', amount: 5 }] },
  { id: 7, name: 'Bash', cost: 2, description: 'Deal 8 damage. Gain 8 block.', effects: [{ type: 'ATTACK', amount: 8 }, { type: 'BLOCK', amount: 8 }] },
  { id: 8, name: 'Slice', cost: 0, description: 'Deal 4 damage.', effects: [{ type: 'ATTACK', amount: 4 }] },
  { id: 9, name: 'Energize', cost: 0, description: 'Gain 1 Energy. Draw 1 card.', effects: [{ type: 'ENERGY', amount: 1 }, { type: 'DRAW', amount: 1 }] },
  { id: 10, name: 'Double Tap', cost: 1, description: 'Deal 5 damage twice.', effects: [{ type: 'ATTACK', amount: 5 }, { type: 'ATTACK', amount: 5 }] },
  { id: 11, name: 'Intimidate', cost: 1, description: 'Apply 2 Vulnerable.', effects: [{ type: 'VULNERABLE', amount: 2 }] },
  { id: 12, name: 'Trip', cost: 0, description: 'Apply 1 Weak.', effects: [{ type: 'WEAK', amount: 1 }] },
  { id: 13, name: 'Reinforce', cost: 1, description: 'Gain 7 block. If you have Block, draw 1 card.', effects: [{ type: 'BLOCK', amount: 7 }, {type: 'DRAW', amount: 1}] }, // Conditional draw
  // Uncommon
  { id: 14, name: 'Rampage', cost: 1, description: 'Deal 7 damage. This card\'s damage increases by 3 for the rest of combat.', effects: [{ type: 'ATTACK', amount: 7 }] }, // Needs stateful logic
  { id: 15, name: 'Whirlwind', cost: -1, description: 'Deal 5 damage to ALL enemies X times.', effects: [{ type: 'ATTACK', amount: 5 }] }, // X-cost card
  { id: 16, name: 'Immolate', cost: 2, description: 'Deal 20 damage to all enemies.', effects: [{ type: 'ATTACK', amount: 20 }] },
  { id: 17, name: 'Disarm', cost: 1, description: 'Apply 2 Weak to an enemy.', effects: [{ type: 'WEAK', amount: 2 }] },
  { id: 18, name: 'Shrug It Off', cost: 1, description: 'Gain 8 Block. Draw 1 card.', effects: [{ type: 'BLOCK', amount: 8 }, { type: 'DRAW', amount: 1 }] },
  { id: 19, name: 'Carnage', cost: 2, description: 'Deal 20 damage.', effects: [{ type: 'ATTACK', amount: 20 }] },
  // Rare
  { id: 20, name: 'Limit Break', cost: 1, description: 'Double your Strength.', effects: [] }, // Needs 'Strength' buff type
  { id: 21, name: 'Impervious', cost: 2, description: 'Gain 30 Block.', effects: [{ type: 'BLOCK', amount: 30 }] },
  { id: 22, name: 'Reaper', cost: 2, description: 'Deal 4 damage to ALL enemies. Heal for unblocked damage dealt.', effects: [{ type: 'ATTACK', amount: 4 }] },
  { id: 23, name: 'Offering', cost: 0, description: 'Lose 6 HP. Gain 2 Energy. Draw 3 cards.', effects: [{ type: 'ENERGY', amount: 2 }, { type: 'DRAW', amount: 3 }, { type: 'HEAL', amount: -6 }] },
  { id: 24, name: 'Pummel', cost: 1, description: 'Deal 2 damage 4 times.', effects: [{ type: 'ATTACK', amount: 2 }, { type: 'ATTACK', amount: 2 }, { type: 'ATTACK', amount: 2 }, { type: 'ATTACK', amount: 2 }] },
  { id: 25, name: 'Iron Wave', cost: 1, description: 'Gain 5 block. Deal 5 damage.', effects: [{ type: 'BLOCK', amount: 5 }, { type: 'ATTACK', amount: 5 }] },
  { id: 26, name: 'Thunderclap', cost: 1, description: 'Deal 4 damage and apply 1 Vulnerable to ALL enemies.', effects: [{ type: 'ATTACK', amount: 4 }, { type: 'VULNERABLE', amount: 1 }] },
  { id: 27, name: 'Body Slam', cost: 1, description: 'Deal damage equal to your block.', effects: [{ type: 'ATTACK', amount: 0 }] }, // Special calculation
  { id: 28, name: 'Entrench', cost: 2, description: 'Double your current block.', effects: [{ type: 'BLOCK', amount: 0 }] }, // Special calculation
  { id: 29, name: 'Uppercut', cost: 2, description: 'Deal 13 damage. Apply 1 Weak and 1 Vulnerable.', effects: [{ type: 'ATTACK', amount: 13 }, { type: 'WEAK', amount: 1 }, { type: 'VULNERABLE', amount: 1 }] },
  { id: 30, name: 'Seeing Red', cost: 1, description: 'Gain 2 Energy.', effects: [{ type: 'ENERGY', amount: 2 }] },
];


const enemyTypes: Omit<Enemy, keyof Actor | 'currentAttackIndex'>[] = [
    { name: 'Slime', attackPattern: [{damage: 7}] },
    { name: 'Goblin', attackPattern: [{damage: 5}, {damage: 9}] },
    { name: 'Orc', attackPattern: [{damage: 0, block: 10}, {damage: 15}] },
    { name: 'Cultist', attackPattern: [{damage: 0, effect: {type: 'VULNERABLE', amount: 2, duration: 2}}, {damage: 12}] },
    { name: 'Armored Sentry', attackPattern: [{damage: 8, block: 8}, {damage: 8, block: 8}] },
    { name: 'Spike Slime', attackPattern: [{damage: 6, effect: {type: 'VULNERABLE', amount: 1, duration: 2}}, {damage: 0, block: 0, effect: { type: 'ATTACK', amount: 3, duration: 99}}] }, // Thorn-like effect
];

const mapNodes: MapNode[] = [
    { type: 'combat', enemyTypeIndex: 0, enemyHp: 40 },
    { type: 'combat', enemyTypeIndex: 1, enemyHp: 52 },
    { type: 'combat', enemyTypeIndex: 3, enemyHp: 48 },
    { type: 'combat', enemyTypeIndex: 2, enemyHp: 75 },
    { type: 'combat', enemyTypeIndex: 4, enemyHp: 60 },
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
    const initialDeck = useMemo(() => {
        const baseDeck = [
            ...Array(5).fill(cardLibrary.find(c => c.id === 1)!),
            ...Array(5).fill(cardLibrary.find(c => c.id === 2)!),
        ];
        // Add a few more varied cards to start
        baseDeck.push(cardLibrary.find(c => c.id === 5)!); // Quick Draw
        baseDeck.push(cardLibrary.find(c => c.id === 11)!); // Intimidate
        return baseDeck;
    }, []);

    const [player, setPlayer] = useState<Actor>({ hp: 80, maxHp: 80, block: 0, statusEffects: [] });
    const [enemy, setEnemy] = useState<Enemy | null>(null);
    const [energy, setEnergy] = useState(3);
    const [maxEnergy, setMaxEnergy] = useState(3);
    const [deck, setDeck] = useState<GameCard[]>(() => shuffle([...initialDeck]));
    const [hand, setHand] = useState<GameCard[]>([]);
    const [discardPile, setDiscardPile] = useState<GameCard[]>([]);
    const [gameState, setGameState] = useState<GameState>('map');
    const [mapPosition, setMapPosition] = useState(0);
    const [cardRewards, setCardRewards] = useState<GameCard[]>([]);
    const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);

  const applyStatusEffectsToDamage = (damage: number, target: Actor) => {
    let modifiedDamage = damage;
    if (target.statusEffects.some(e => e.type === 'vulnerable')) {
      modifiedDamage = Math.floor(modifiedDamage * 1.5);
    }
    return modifiedDamage;
  };
    
  const handleThornsDamage = (attacker: Actor, defender: Actor) => {
    const thornsEffect = defender.statusEffects.find(e => e.type === 'thorns');
    if (thornsEffect) {
        const thornsDamage = thornsEffect.duration; // Using duration to store damage amount for thorns
        const damageToHp = Math.max(0, thornsDamage - attacker.block);
        const newHp = attacker.hp - damageToHp;
        
        if (attacker === player) {
          setPlayer(p => ({...p, hp: newHp, block: Math.max(0, p.block - thornsDamage)}));
          if (newHp <= 0) { setWinner('enemy'); setGameState('game-over'); }
        } else {
          setEnemy(e => e ? ({...e, hp: newHp, block: Math.max(0, e.block - thornsDamage)}) : null);
          if (newHp <= 0) { setWinner('player'); setGameState('reward'); generateCardRewards(); }
        }
    }
  }


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
    let currentDeck = deck;
    let currentDiscard = discardPile;

    if(isNewCombat) {
        currentDeck = shuffle([...deck]);
        currentDiscard = [];
    }

    const { drawn, newDeck, newDiscard } = drawCards(5, currentDeck, currentDiscard);
    setHand(drawn);
    setDeck(newDeck);
    setDiscardPile(newDiscard);
    setEnergy(maxEnergy);

    // Decrement status effects at start of player turn
    setPlayer(p => ({ ...p, block: 0, statusEffects: p.statusEffects.map(e => ({...e, duration: e.duration-1})).filter(e => e.duration > 0) }));
    setEnemy(e => e ? ({ ...e, statusEffects: e.statusEffects.map(se => ({...se, duration: se.duration-1})).filter(se => se.duration > 0) }) : null);

  }, [deck, discardPile, maxEnergy, drawCards]);

  const startCombat = (nodeIndex: number) => {
    const node = mapNodes[nodeIndex];
    if (node.type !== 'combat') return;

    const enemyInfo = enemyTypes[node.enemyTypeIndex!];
    setEnemy({
        ...enemyInfo,
        hp: node.enemyHp!,
        maxHp: node.enemyHp!,
        block: 0,
        statusEffects: [],
        currentAttackIndex: 0,
    });
    setPlayer(p => ({ ...p, hp: p.maxHp, block: 0, statusEffects: [] })); // Full heal before each fight
    startPlayerTurn(true); 
    setGameState('combat');
  };

  const playCard = (card: GameCard, cardIndex: number) => {
    if (gameState !== 'combat' || !enemy || card.cost > energy) return;

    let newPlayer = { ...player };
    let newEnemy = { ...enemy };
    let cardsToDraw = 0;
    let energyGained = 0;

    card.effects.forEach(effect => {
      let finalAmount = effect.amount;
      // Special card logic
      if(card.name === 'Body Slam') finalAmount = newPlayer.block;
      if(card.name === 'Entrench') finalAmount = newPlayer.block;

      switch (effect.type) {
        case 'ATTACK':
          const damage = applyStatusEffectsToDamage(finalAmount, newEnemy);
          const damageToHp = Math.max(0, damage - newEnemy.block);
          newEnemy = { ...newEnemy, hp: newEnemy.hp - damageToHp, block: Math.max(0, newEnemy.block - damage) };
          handleThornsDamage(newPlayer, newEnemy);
          break;
        case 'BLOCK': newPlayer.block += finalAmount; break;
        case 'DRAW': 
            const shouldDraw = !(card.name === 'Reinforce' && newPlayer.block === 0);
            if (shouldDraw) cardsToDraw += finalAmount;
            break;
        case 'HEAL': newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + finalAmount); break;
        case 'ENERGY': energyGained += finalAmount; break;
        case 'VULNERABLE': case 'WEAK':
            const existingEffectIndex = newEnemy.statusEffects.findIndex(e => e.type === effect.type.toLowerCase());
            const duration = effect.duration || effect.amount;
            if (existingEffectIndex > -1) {
                newEnemy.statusEffects[existingEffectIndex].duration += duration;
            } else {
                newEnemy.statusEffects.push({type: effect.type.toLowerCase() as 'vulnerable'|'weak', duration });
            }
            break;
      }
    });
    
    setPlayer(newPlayer);
    setEnergy(e => e - card.cost + energyGained);
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
        setEnemy(e => {
            if (!e) return null;
            let newEnemyState = { ...e, block: 0 };
            const nextAttackIndex = (e.currentAttackIndex + 1) % e.attackPattern.length;
            const currentAttack = e.attackPattern[e.currentAttackIndex];
            
            setPlayer(p => {
              let damageToDeal = currentAttack.damage;
              if(e.statusEffects.some(ef => ef.type === 'weak')) damageToDeal = Math.floor(damageToDeal * 0.75);
              const damage = applyStatusEffectsToDamage(damageToDeal, p);

              const finalDamage = Math.max(0, damage - p.block);
              const newHp = p.hp - finalDamage;
              
              let newPlayerState = { ...p, hp: newHp, block: Math.max(0, p.block - damage) };

              if (currentAttack.effect) {
                 const {type, amount, duration} = currentAttack.effect;
                 if (type === 'VULNERABLE' || type === 'WEAK') {
                      const existing = newPlayerState.statusEffects.find(se => se.type === type.toLowerCase());
                      if(existing) existing.duration += duration;
                      else newPlayerState.statusEffects.push({type: type.toLowerCase() as 'vulnerable'|'weak', duration });
                 }
              }

              if (newHp <= 0) {
                  setWinner('enemy');
                  setGameState('game-over');
                  return { ...newPlayerState, hp: 0 };
              }
              return newPlayerState;
            });
            
            return { ...newEnemyState, currentAttackIndex: nextAttackIndex };
        });
        
        if (player.hp > 0 && gameState === 'combat') {
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
    setPlayer({ hp: 80, maxHp: 80, block: 0, statusEffects: [] });
    setEnemy(null);
    setDeck(shuffle([...initialDeck]));
    setDiscardPile([]);
    setHand([]);
    setEnergy(maxEnergy);
    setGameState('map');
    setMapPosition(0);
    setWinner(null);
  }

  const renderStatusEffects = (actor: Actor) => (
    <div className="flex gap-1 absolute top-0 right-0 -mt-2 -mr-2">
        {actor.statusEffects.map((effect, index) => (
            <div key={index} className="flex items-center gap-1 text-xs p-1 rounded-full bg-black/70 border border-white/20">
                {effect.type === 'vulnerable' && <ShieldAlert className="w-3 h-3 text-red-400"/>}
                {effect.type === 'weak' && <ShieldOff className="w-3 h-3 text-yellow-400"/>}
                {effect.type === 'thorns' && <HeartCrack className="w-3 h-3 text-purple-400"/>}
                <span className="font-bold">{effect.duration}</span>
            </div>
        ))}
    </div>
  );

  const renderMap = () => (
    <div className="flex flex-col items-center justify-center gap-8">
        <h2 className="text-3xl font-bold text-yellow-300">Adventure Map</h2>
        <div className="flex gap-4">
            {mapNodes.map((node, index) => (
                <Button key={index} variant={index === mapPosition ? 'default' : 'outline'} disabled={index !== mapPosition} onClick={() => startCombat(index)}>
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
      <div className="flex flex-col items-center gap-2 mb-8 relative">
        {enemy && <>
          {renderStatusEffects(enemy)}
          <Dna className="w-16 h-16 text-red-400"/>
          <p className="font-bold">{enemy.name}</p>
          <p className="text-sm text-yellow-300">Intends to do {enemy.attackPattern[enemy.currentAttackIndex].damage} damage.</p>
          <div className="relative w-48">
            <Progress value={(enemy.hp / enemy.maxHp) * 100} className="h-6 bg-red-900" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">{enemy.hp} / {enemy.maxHp}</div>
          </div>
          {enemy.block > 0 && <div className="flex items-center gap-1 text-blue-300"><Shield/> {enemy.block}</div>}
        </>}
      </div>

      <div className="h-48 flex items-center justify-center gap-[-40px] my-4">
        {hand.map((card, index) => (
          <motion.div
            key={`${card.id}-${index}-${discardPile.length}`} initial={{ opacity: 0, y: 50, rotate: (index - hand.length/2) * 5 }} animate={{ opacity: 1, y: 0, rotate: (index - hand.length/2) * 5 }} whileHover={{ y: -20, scale: 1.05, zIndex: 10 }} transition={{ duration: 0.3 }} onClick={() => playCard(card, index)}
            className={cn("w-32 h-44 bg-slate-800 border-2 rounded-lg p-2 flex flex-col justify-between cursor-pointer", energy >= card.cost ? 'border-sky-400' : 'border-gray-600', energy < card.cost && 'opacity-60')}
          >
            <div className="flex justify-between items-center"><h3 className="font-bold text-sm">{card.name}</h3><span className="w-6 h-6 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center">{card.cost < 0 ? 'X' : card.cost}</span></div>
            <p className="text-xs">{card.description}</p>
            <div/>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between items-end w-full max-w-lg mt-auto">
        <div className="flex items-center gap-2 text-xs"><RotateCcw/>Deck: {deck.length}</div>
        <div className="flex flex-col items-center relative">
             <div className="flex gap-4">
                {renderStatusEffects(player)}
                {player.block > 0 && <div className="flex items-center gap-1 text-blue-300"><Shield/> {player.block}</div>}
                <div className="flex items-center gap-1 text-yellow-300"><Zap/> {energy}/{maxEnergy}</div>
            </div>
             <Button onClick={endPlayerTurn} disabled={gameState !== 'combat'} className="mt-2">End Turn</Button>
        </div>
        <div className="flex items-center gap-2 text-xs"><Trash/>Discard: {discardPile.length}</div>
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
