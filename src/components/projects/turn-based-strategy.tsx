
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Swords, Shield, Heart, User, Bot, Move, LocateFixed, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

// --- TYPE DEFINITIONS ---
interface Unit {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  movement: number;
  owner: 'player' | 'enemy';
  hasMoved: boolean;
  hasAttacked: boolean;
  type: 'swordsman' | 'archer' | 'knight' | 'cleric' | 'mage';
}

type GamePhase = 'player-turn-start' | 'select-unit' | 'move-unit' | 'attack-unit' | 'enemy-turn' | 'game-over';

const GRID_SIZE = 12;
const TILE_SIZE = 48; // in pixels

// --- INITIAL STATE ---
const initialUnits: Unit[] = [
  // Player
  { id: 1, x: 1, y: 5, hp: 22, maxHp: 22, attack: 8, defense: 4, movement: 3, owner: 'player', hasMoved: false, hasAttacked: false, type: 'swordsman' },
  { id: 2, x: 1, y: 6, hp: 16, maxHp: 16, attack: 9, defense: 2, movement: 2, owner: 'player', hasMoved: false, hasAttacked: false, type: 'archer' },
  { id: 3, x: 2, y: 4, hp: 30, maxHp: 30, attack: 7, defense: 6, movement: 4, owner: 'player', hasMoved: false, hasAttacked: false, type: 'knight' },
  { id: 7, x: 2, y: 7, hp: 18, maxHp: 18, attack: 4, defense: 3, movement: 3, owner: 'player', hasMoved: false, hasAttacked: false, type: 'cleric' },

  // Enemy
  { id: 4, x: 10, y: 5, hp: 22, maxHp: 22, attack: 8, defense: 4, movement: 3, owner: 'enemy', hasMoved: false, hasAttacked: false, type: 'swordsman' },
  { id: 5, x: 9, y: 3, hp: 16, maxHp: 16, attack: 9, defense: 2, movement: 2, owner: 'enemy', hasMoved: false, hasAttacked: false, type: 'archer' },
  { id: 6, x: 10, y: 2, hp: 30, maxHp: 30, attack: 7, defense: 6, movement: 4, owner: 'enemy', hasMoved: false, hasAttacked: false, type: 'knight' },
  { id: 8, x: 9, y: 8, hp: 20, maxHp: 20, attack: 12, defense: 1, movement: 2, owner: 'enemy', hasMoved: false, hasAttacked: false, type: 'mage' },
];

const gridLayout = "gggggggggggggwggwgggggggwggwgggggggwggwgggggggwgggggggggggwggwwwwwwgggwgggggggggggwgggggggggggwgggggggggggwggwgggggggwggwgggggggwgggggggggggg".split('');

const TurnBasedStrategy: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>(JSON.parse(JSON.stringify(initialUnits)));
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('player-turn-start');
  const [possibleMoves, setPossibleMoves] = useState<Set<string>>(new Set());
  const [possibleAttacks, setPossibleAttacks] = useState<Set<string>>(new Set());
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);

  const selectedUnit = useMemo(() => units.find(u => u.id === selectedUnitId), [units, selectedUnitId]);

  const getAttackRange = (unit: Unit): number => {
    if (unit.type === 'archer' || unit.type === 'mage') return 3;
    if (unit.type === 'cleric') return 1; // Heal range
    return 1;
  };

  const calculatePossibleMoves = useCallback((unit: Unit) => {
    const moves = new Set<string>();
    const queue: [{x: number, y: number, dist: number}] = [{x: unit.x, y: unit.y, dist: 0}];
    const visited = new Set<string>([`${unit.x},${unit.y}`]);

    while(queue.length > 0) {
      const {x, y, dist} = queue.shift()!;
      if (dist >= unit.movement) continue;

      [[x+1, y], [x-1, y], [x, y+1], [x, y-1]].forEach(([nx, ny]) => {
        const key = `${nx},${ny}`;
        if (nx>=0 && nx<GRID_SIZE && ny>=0 && ny<GRID_SIZE && !visited.has(key) && gridLayout[ny*GRID_SIZE+nx] !== 'w' && !units.some(u => u.x === nx && u.y === ny)) {
          visited.add(key);
          moves.add(key);
          queue.push({x: nx, y: ny, dist: dist + 1});
        }
      });
    }
    setPossibleMoves(moves);
  }, [units]);

  const calculatePossibleAttacks = useCallback((unit: Unit) => {
    const attacks = new Set<string>();
    const attackRange = getAttackRange(unit);
    const isHealer = unit.type === 'cleric';
    
    for(let y=0; y<GRID_SIZE; y++) {
        for(let x=0; x<GRID_SIZE; x++) {
            const dist = Math.abs(x - unit.x) + Math.abs(y - unit.y);
            if (dist > 0 && dist <= attackRange) {
                 const target = units.find(u => u.x === x && u.y === y);
                 if (target) {
                     if (isHealer && target.owner === unit.owner) attacks.add(`${x},${y}`); // can heal allies
                     if (!isHealer && target.owner !== unit.owner) attacks.add(`${x},${y}`); // can attack enemies
                 }
            }
        }
    }
    setPossibleAttacks(attacks);
  }, [units]);
  
  useEffect(() => {
    if (gamePhase === 'player-turn-start') {
      setUnits(u => u.map(unit => unit.owner === 'player' ? { ...unit, hasMoved: false, hasAttacked: false } : unit));
      setGamePhase('select-unit');
    }
  }, [gamePhase]);
  
  const handleTileClick = (x: number, y: number) => {
    if (winner) return;

    if (gamePhase === 'select-unit') {
      const unit = units.find(u => u.x === x && u.y === y && u.owner === 'player' && !u.hasAttacked);
      if (unit) {
        setSelectedUnitId(unit.id);
        if(!unit.hasMoved) calculatePossibleMoves(unit);
        if(!unit.hasAttacked) calculatePossibleAttacks(unit);
        setGamePhase(unit.hasMoved ? 'attack-unit' : 'move-unit');
      }
    } else if ((gamePhase === 'move-unit' || gamePhase === 'attack-unit') && selectedUnit) {
      if (possibleMoves.has(`${x},${y}`)) {
        moveUnit(selectedUnit, x, y);
      } else if (possibleAttacks.has(`${x},${y}`)) {
        attackUnit(selectedUnit, x, y);
      } else { // Deselect
        setSelectedUnitId(null); setPossibleMoves(new Set()); setPossibleAttacks(new Set());
        setGamePhase('select-unit');
      }
    }
  };

  const moveUnit = (unit: Unit, x: number, y: number) => {
    setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, x, y, hasMoved: true } : u));
    const movedUnit = { ...unit, x, y, hasMoved: true };
    calculatePossibleAttacks(movedUnit);
    setPossibleMoves(new Set());
    setGamePhase('attack-unit');
  };

  const attackUnit = (attacker: Unit, targetX: number, targetY: number) => {
    const target = units.find(u => u.x === targetX && u.y === targetY);
    if (!target) return;
    
    if (attacker.type === 'cleric') {
      setUnits(prev => prev.map(u => u.id === target.id ? { ...u, hp: Math.min(u.maxHp, u.hp + attacker.attack) } : u));
    } else {
      const damage = Math.max(1, attacker.attack - target.defense);
      setUnits(prev => prev.map(u => u.id === target.id ? { ...u, hp: Math.max(0, u.hp - damage) } : u).filter(u => u.hp > 0));
    }

    setUnits(prev => prev.map(u => u.id === attacker.id ? { ...u, hasMoved: true, hasAttacked: true } : u));
    setSelectedUnitId(null); setPossibleMoves(new Set()); setPossibleAttacks(new Set());
    setGamePhase('select-unit');
  };

  const endTurn = () => {
    setGamePhase('enemy-turn'); setSelectedUnitId(null); setPossibleMoves(new Set()); setPossibleAttacks(new Set());
    
    setTimeout(() => {
      let currentUnits = [...units];
      const enemyUnits = currentUnits.filter(u => u.owner === 'enemy');
      
      enemyUnits.forEach(enemy => {
        if (!currentUnits.find(u => u.id === enemy.id)) return; // Was defeated mid-turn
        const playerUnits = currentUnits.filter(u => u.owner === 'player');
        if(playerUnits.length === 0) return;

        let closestPlayer: Unit | null = null;
        let minDistance = Infinity;
        playerUnits.forEach(player => {
            const dist = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
            if (dist < minDistance) { minDistance = dist; closestPlayer = player; }
        });
        if(!closestPlayer) return;

        if (minDistance <= getAttackRange(enemy)) {
          const damage = Math.max(1, enemy.attack - closestPlayer.defense);
          currentUnits = currentUnits.map(u => u.id === closestPlayer!.id ? {...u, hp: u.hp - damage} : u).filter(u => u.hp > 0);
        } else {
            let newX = enemy.x; let newY = enemy.y;
            if (closestPlayer.x > enemy.x) newX++; else if (closestPlayer.x < enemy.x) newX--;
            else if (closestPlayer.y > enemy.y) newY++; else if (closestPlayer.y < enemy.y) newY--;

            if (!currentUnits.some(u => u.x === newX && u.y === newY) && gridLayout[newY*GRID_SIZE+newX] !== 'w') {
                currentUnits = currentUnits.map(u => u.id === enemy.id ? {...u, x: newX, y: newY} : u);
            }
        }
      });
      
      setUnits(currentUnits);
      setGamePhase('player-turn-start');
    }, 1000);
  };
  
   useEffect(() => {
    const playerUnitsLeft = units.some(u => u.owner === 'player');
    const enemyUnitsLeft = units.some(u => u.owner === 'enemy');
    if (!playerUnitsLeft) { setWinner('enemy'); setGamePhase('game-over'); }
    else if (!enemyUnitsLeft) { setWinner('player'); setGamePhase('game-over'); }
  }, [units]);

  const restartGame = () => {
    setUnits(JSON.parse(JSON.stringify(initialUnits)));
    setGamePhase('player-turn-start');
    setWinner(null);
    setSelectedUnitId(null);
  };
  
  const unitAt = (x:number, y:number) => units.find(u => u.x === x && u.y === y);

  const unitIcons = {
    swordsman: <Swords/>,
    archer: <LocateFixed/>,
    knight: <Shield/>,
    cleric: <Heart/>,
    mage: <User/> // Placeholder
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 z-20 flex flex-col items-center justify-center gap-4">
            <h2 className={cn("text-6xl font-bold", winner === 'player' ? "text-green-400" : "text-red-500")}>
              {winner === 'player' ? "Victory!" : "Defeat!"}
            </h2>
            <Button onClick={restartGame}>Play Again</Button>
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="w-full max-w-5xl mx-auto shadow-2xl bg-muted/30">
        <CardHeader><CardTitle className="text-3xl font-bold text-primary text-center">Grid-Based Strategy</CardTitle></CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="grid border border-border" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, ${TILE_SIZE}px)`}}>
                {Array.from({length: GRID_SIZE * GRID_SIZE}).map((_, index) => {
                    const x = index % GRID_SIZE, y = Math.floor(index / GRID_SIZE);
                    const unitOnTile = unitAt(x, y);
                    const isMoveable = possibleMoves.has(`${x},${y}`);
                    const isAttackable = possibleAttacks.has(`${x},${y}`);
                    return (
                        <div key={index} onClick={() => handleTileClick(x,y)} className={cn('w-12 h-12 border border-border/20 flex items-center justify-center relative', (isMoveable || isAttackable) && 'cursor-pointer' )}>
                            <div className={cn('w-full h-full', gridLayout[index] === 'w' ? 'bg-blue-800' : 'bg-green-800/50', isMoveable && 'bg-blue-500/30', isAttackable && 'bg-red-500/30')}/>
                            {unitOnTile && (
                                <motion.div layoutId={`unit-${unitOnTile.id}`} className={cn('absolute inset-0 flex items-center justify-center rounded-full m-1 transition-all', unitOnTile.owner === 'player' ? 'bg-blue-600' : 'bg-red-600', selectedUnitId === unitOnTile.id && 'ring-2 ring-yellow-400', (unitOnTile.hasMoved || unitOnTile.hasAttacked) && 'opacity-50')}>
                                    <div className="text-white h-6 w-6">{unitIcons[unitOnTile.type]}</div>
                                </motion.div>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="w-full md:w-64 space-y-4">
                <Card>
                    <CardHeader className="p-2 pb-0"><CardTitle className="text-base text-center capitalize">{gamePhase.replace(/-/g, ' ')}</CardTitle></CardHeader>
                    <CardContent className="p-4 flex justify-around text-center">
                        {selectedUnit ? (
                            <div className="text-left w-full space-y-1">
                                <h4 className="font-bold capitalize">{selectedUnit.type}</h4>
                                <div className="text-sm flex justify-between"><span>HP:</span> <span>{selectedUnit.hp}/{selectedUnit.maxHp}</span></div>
                                <div className="text-sm flex justify-between"><span>ATK:</span> <span>{selectedUnit.attack}</span></div>
                                <div className="text-sm flex justify-between"><span>DEF:</span> <span>{selectedUnit.defense}</span></div>
                                <div className="text-sm flex justify-between"><span>MOV:</span> <span>{selectedUnit.movement}</span></div>
                            </div>
                        ) : <p className="text-sm text-muted-foreground">Select a player unit.</p>}
                    </CardContent>
                </Card>
                <Accordion type="single" collapsible>
                    <AccordionItem value="how-to-play">
                        <AccordionTrigger>How to Play</AccordionTrigger>
                        <AccordionContent className="text-xs space-y-2">
                            <p><strong>Goal:</strong> Defeat all enemy units.</p>
                            <p><strong>Turns:</strong> Select a unit on your turn. Blue squares are possible moves, red squares are possible attacks. A unit can move and then attack, but cannot move after attacking.</p>
                            <p>Press "End Turn" when you are finished. The AI will then take its turn.</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <Button onClick={endTurn} disabled={gamePhase.startsWith('enemy') || gamePhase === 'game-over'} className="w-full">End Turn</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TurnBasedStrategy;
