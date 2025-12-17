'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hand, Scissors, Bot, User, RefreshCw, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import Image from 'next/image';

type Move = 'rock' | 'paper' | 'scissors';
type Difficulty = 'Normal' | 'Adaptive';

const moves: Move[] = ['rock', 'paper', 'scissors'];

const moveIcons: Record<Move, React.ReactNode> = {
  rock: <Image src="/icons/rock.svg" alt="Rock" width={40} height={40} />,
  paper: <Image src="/icons/paper.svg" alt="Paper" width={40} height={40} />,
  scissors: <Image src="/icons/scissors.svg" alt="Scissors" width={40} height={40} className="-rotate-90" />,
};

const RockPaperScissors: React.FC = () => {
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [aiMove, setAiMove] = useState<Move | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Adaptive');
  const [playerHistory, setPlayerHistory] = useState<Move[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);

  const getAiMove = (): Move => {
    if (difficulty === 'Normal' || playerHistory.length < 3) {
      // Normal AI: Plays randomly
      return moves[Math.floor(Math.random() * moves.length)];
    } else {
      // Adaptive AI: Tries to predict and counter player's next move
      const lastMove = playerHistory[playerHistory.length - 1];
      const secondLastMove = playerHistory[playerHistory.length - 2];

      // Simple pattern detection: if player repeats a move, assume they might do it again
      if (lastMove === secondLastMove) {
        // Counter the repeated move
        return counterMove(lastMove);
      }
      
      // If player alternates, try to predict the next in sequence
      // Example: rock -> paper -> (predicts rock)
      const lastMoveIndex = moves.indexOf(lastMove);
      if (playerHistory[playerHistory.length-2] === moves[(lastMoveIndex + 2) % 3]) {
        return counterMove(moves[(lastMoveIndex + 1) % 3]);
      }

      // Default to countering player's last move if no obvious pattern
      return counterMove(lastMove);
    }
  };

  const counterMove = (move: Move): Move => {
    if (move === 'rock') return 'paper';
    if (move === 'paper') return 'scissors';
    return 'rock';
  }

  const handlePlayerMove = (move: Move) => {
    if (playerScore >= 5 || aiScore >= 5) {
      setIsGameOver(true);
      return;
    }

    setPlayerHistory(prev => [...prev, move].slice(-10)); // Keep last 10 moves
    const newAiMove = getAiMove();
    
    setPlayerMove(move);
    setAiMove(newAiMove);

    if (move === newAiMove) {
      setResult('Draw!');
    } else if (
      (move === 'rock' && newAiMove === 'scissors') ||
      (move === 'paper' && newAiMove === 'rock') ||
      (move === 'scissors' && newAiMove === 'paper')
    ) {
      setResult('You Win!');
      setPlayerScore(s => s + 1);
    } else {
      setResult('AI Wins!');
      setAiScore(s => s + 1);
    }
  };

  useEffect(() => {
    if (playerScore >= 5 || aiScore >= 5) {
        setIsGameOver(true);
    }
  },[playerScore, aiScore]);

  const restartGame = () => {
    setPlayerScore(0);
    setAiScore(0);
    setPlayerMove(null);
    setAiMove(null);
    setResult(null);
    setPlayerHistory([]);
    setIsGameOver(false);
  };

  const getResultColor = () => {
    if (!result) return '';
    if (result.includes('You Win')) return 'text-green-400';
    if (result.includes('AI Wins')) return 'text-red-400';
    return 'text-yellow-400';
  };
  
  const moveHistoryStats = playerHistory.reduce((acc, move) => {
    acc[move] = (acc[move] || 0) + 1;
    return acc;
  }, {} as Record<Move, number>);

  return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-lg mx-auto shadow-2xl">
            <CardHeader>
            <CardTitle className="text-2xl text-center font-bold text-primary">Rock, Paper, Scissors</CardTitle>
            <div className="text-center text-muted-foreground text-2xl font-bold">
                {playerScore} : {aiScore}
            </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-8">
            {/* AI and Player Hands */}
            <div className="flex justify-around w-full">
                <div className="flex flex-col items-center gap-2">
                <User className="h-8 w-8" />
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                    {playerMove ? moveIcons[playerMove] : '?'}
                </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                <Bot className="h-8 w-8" />
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                    {aiMove ? moveIcons[aiMove] : '?'}
                </div>
                </div>
            </div>
            
            {/* Result Message */}
            <div className={cn("text-3xl font-bold h-10", getResultColor())}>
                {isGameOver ? (playerScore > aiScore ? "You are the Winner!" : "The AI Wins!") : result || "First to 5 wins!"}
            </div>

            {/* Player Controls */}
            <div className="flex gap-4">
                {moves.map(move => (
                <Button key={move} variant="outline" size="icon" className="h-20 w-20 rounded-full" onClick={() => handlePlayerMove(move)} disabled={!!result || isGameOver}>
                    {React.cloneElement(moveIcons[move] as React.ReactElement, { className: "h-8 w-8"})}
                </Button>
                ))}
            </div>

            {/* Next Round Button */}
            {result && !isGameOver && (
                <Button onClick={() => { setPlayerMove(null); setAiMove(null); setResult(null); }} className="w-full">
                Next Round
                </Button>
            )}

            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <div className="w-full">
                    <Label htmlFor="difficulty-select">AI Difficulty</Label>
                    <div className="flex gap-2">
                        <Select value={difficulty} onValueChange={(v) => { setDifficulty(v as Difficulty); restartGame(); }}>
                            <SelectTrigger id="difficulty-select"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Normal">Normal</SelectItem>
                                <SelectItem value="Adaptive">Adaptive (Learns)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" disabled={difficulty !== 'Adaptive'}>
                                    <BarChart className="h-4 w-4"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60">
                            <p className="text-sm font-semibold mb-2">Player Move History (Last 10)</p>
                            <div className="space-y-1 text-xs text-muted-foreground">
                                    <p>Rock: {moveHistoryStats.rock || 0}</p>
                                    <p>Paper: {moveHistoryStats.paper || 0}</p>
                                    <p>Scissors: {moveHistoryStats.scissors || 0}</p>
                            </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <Button onClick={restartGame} variant="destructive" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Game
                </Button>
            </CardFooter>
        </Card>
        </div>
  );
};

export default RockPaperScissors;
