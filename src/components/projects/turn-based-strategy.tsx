
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Swords, Shield, Heart, User, Bot, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
}

type GamePhase = 'player-turn-start' | 'select-unit' | 'move-unit' | 'attack-unit' | 'enemy-turn' | 'game-over';

const GRID_SIZE = 8;
const TILE_SIZE = 48; // in pixels

// --- INITIAL STATE ---
const initialUnits: Unit[] = [
  { id: 1, x: 2, y: 1, hp: 20, maxHp: 20, attack: 7, defense: 4, movement: 2, owner: 'player', hasMoved: false, hasAttacked: false },
  { id: 2, x: 1, y: 5, hp: 18, maxHp: 18, attack: 6, defense: 5, movement: 3, owner: 'player', hasMoved: false, hasAttacked: false },
  { id: 3, x: 6, y: 1, hp: 15, maxHp: 15, attack: 8, defense: 3, owner: 'enemy', hasMoved: false, hasAttacked: false },
  { id: 4, x: 5, y: 5, hp: 15, maxHp: 15, attack: 8, defense: 3, owner: 'enemy', hasMoved: false, hasAttacked: false },
];
const gridLayout = ['g','g','g','w','w','g','g','g','g','g','g','w','w','g','g','g','g','g','g','w','w','g','g','g','g','w','w','w','w','w','w','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g','g'];


const TurnBasedStrategy: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>(JSON.parse(JSON.stringify(initialUnits)));
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('player-turn-start');
  const [possibleMoves, setPossibleMoves] = useState<Set<string>>(new Set());
  const [possibleAttacks, setPossibleAttacks] = useState<Set<string>>(new Set());
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);

  const selectedUnit = useMemo(() => units.find(u => u.id === selectedUnitId), [units, selectedUnitId]);

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
    const {x, y} = unit;
    [[x+1, y], [x-1, y], [x, y+1], [x, y-1]].forEach(([nx, ny]) => {
        const target = units.find(u => u.x === nx && u.y === ny && u.owner !== unit.owner);
        if (target) attacks.add(`${nx},${ny}`);
    });
    setPossibleAttacks(attacks);
  }, [units]);
  
  useEffect(() => {
    if (gamePhase === 'player-turn-start') {
      setUnits(u => u.map(unit => ({ ...unit, hasMoved: false, hasAttacked: false })));
      setGamePhase('select-unit');
    }
  }, [gamePhase]);
  
  const handleTileClick = (x: number, y: number) => {
    if (winner) return;

    if (gamePhase === 'select-unit') {
      const unit = units.find(u => u.x === x && u.y === y && u.owner === 'player' && !u.hasMoved && !u.hasAttacked);
      if (unit) {
        setSelectedUnitId(unit.id);
        calculatePossibleMoves(unit);
        calculatePossibleAttacks(unit);
        setGamePhase('move-unit');
      }
    } else if (gamePhase === 'move-unit' && selectedUnit) {
      if (possibleMoves.has(`${x},${y}`)) {
        moveUnit(selectedUnit, x, y);
      } else if (possibleAttacks.has(`${x},${y}`)) {
        attackUnit(selectedUnit, x, y);
      } else { // Deselect
        setSelectedUnitId(null);
        setGamePhase('select-unit');
      }
    } else if (gamePhase === 'attack-unit' && selectedUnit) {
        if (possibleAttacks.has(`${x},${y}`)) {
            attackUnit(selectedUnit, x, y);
        } else { // Deselect or cancel attack
            setSelectedUnitId(null);
            setGamePhase('select-unit');
        }
    }
  };

  const moveUnit = (unit: Unit, x: number, y: number) => {
    setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, x, y, hasMoved: true } : u));
    const movedUnit = { ...unit, x, y, hasMoved: true };
    calculatePossibleAttacks(movedUnit);
    setPossibleMoves(new Set()); // Cannot move again
    setGamePhase('attack-unit');
  };

  const attackUnit = (attacker: Unit, targetX: number, targetY: number) => {
    const target = units.find(u => u.x === targetX && u.y === targetY);
    if (!target) return;

    const damage = Math.max(1, attacker.attack - target.defense);
    
    setUnits(prev => prev.map(u => {
        if(u.id === attacker.id) return { ...u, hasMoved: true, hasAttacked: true };
        if(u.id === target.id) return { ...u, hp: Math.max(0, u.hp - damage) };
        return u;
    }).filter(u => u.hp > 0));

    setSelectedUnitId(null);
    setGamePhase('select-unit');
  };

  const endTurn = () => {
    setGamePhase('enemy-turn');
    setSelectedUnitId(null);
    setPossibleMoves(new Set());
    setPossibleAttacks(new Set());
    
    // Basic AI logic
    setTimeout(() => {
      let currentUnits = units;
      const enemyUnits = units.filter(u => u.owner === 'enemy');
      
      enemyUnits.forEach(enemy => {
        const playerUnits = currentUnits.filter(u => u.owner === 'player');
        if(playerUnits.length === 0) return;

        let closestPlayer = playerUnits[0];
        let minDistance = 100;
        playerUnits.forEach(player => {
            const dist = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
            if (dist < minDistance) { minDistance = dist; closestPlayer = player; }
        });
        
        // Attack if in range
        if (minDistance === 1) {
          const damage = Math.max(1, enemy.attack - closestPlayer.defense);
          currentUnits = currentUnits.map(u => u.id === closestPlayer.id ? {...u, hp: u.hp - damage} : u).filter(u => u.hp > 0);
        } else {
            // Move towards player
            let newX = enemy.x; let newY = enemy.y;
            if (closestPlayer.x > enemy.x) newX++;
            else if (closestPlayer.x < enemy.x) newX--;
            else if (closestPlayer.y > enemy.y) newY++;
            else if (closestPlayer.y < enemy.y) newY--;

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

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 z-20 flex flex-col items-center justify-center gap-4">
            <h2 className={cn("text-6xl font-bold", winner === 'player' ? "text-green-400" : "text-red-500")}>
              {winner === 'player' ? "You Win!" : "You Lose!"}
            </h2>
            <Button onClick={restartGame}>Play Again</Button>
          </motion.div>
        )}
      </AnimatePresence>
      <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-muted/30">
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
                                <motion.div layoutId={`unit-${unitOnTile.id}`} className={cn('absolute inset-0 flex items-center justify-center rounded-full m-1', unitOnTile.owner === 'player' ? 'bg-blue-500' : 'bg-red-500', selectedUnitId === unitOnTile.id && 'ring-2 ring-yellow-400')}/>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className="w-full md:w-56 space-y-4">
                <Card>
                    <CardHeader className="p-2 pb-0"><CardTitle className="text-base text-center">{gamePhase.replace(/-/g, ' ')}</CardTitle></CardHeader>
                    <CardContent className="p-4 flex justify-around text-center">
                        {selectedUnit ? (
                            <div className="text-left w-full space-y-1">
                                <h4 className="font-bold">{selectedUnit.owner === 'player' ? 'Player Unit' : 'Enemy Unit'}</h4>
                                <div className="text-sm flex justify-between"><span>HP:</span> <span>{selectedUnit.hp}/{selectedUnit.maxHp}</span></div>
                                <div className="text-sm flex justify-between"><span>ATK:</span> <span>{selectedUnit.attack}</span></div>
                                <div className="text-sm flex justify-between"><span>DEF:</span> <span>{selectedUnit.defense}</span></div>
                                <div className="text-sm flex justify-between"><span>MOV:</span> <span>{selectedUnit.movement}</span></div>
                            </div>
                        ) : <p className="text-sm text-muted-foreground">No unit selected</p>}
                    </CardContent>
                </Card>
                <Button onClick={endTurn} disabled={gamePhase !== 'select-unit' && gamePhase !== 'move-unit' && gamePhase !== 'attack-unit'} className="w-full">End Turn</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TurnBasedStrategy;
