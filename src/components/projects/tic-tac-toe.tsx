'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, User, Bot, X, Circle, Swords, Trophy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Player = 'X' | 'O';
type Board = (Player | null)[];
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],           // Diagonals
];

const checkWinner = (currentBoard: Board): Player | 'draw' | null => {
    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    if (currentBoard.every(cell => cell !== null)) {
      return 'draw';
    }
    return null;
};

const VsAIGame: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');

   const handlePlayerMove = (index: number) => {
    if (board[index] || !isPlayerTurn || winner) return;
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) setWinner(gameWinner);
    else setIsPlayerTurn(false);
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timeoutId = setTimeout(() => {
        const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(val => val !== null) as number[];
        if (availableMoves.length === 0) return;
        
        let move: number;
        // Simple AI logic
        if (difficulty === 'Easy') {
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        } else { // Medium/Hard AI
            // Check for winning move
            let winningMove = -1;
            for(const m of availableMoves) {
                const nextBoard = [...board]; nextBoard[m] = 'O';
                if(checkWinner(nextBoard) === 'O') { winningMove = m; break; }
            }
            if(winningMove !== -1) move = winningMove;
            else {
                // Check for blocking move
                let blockingMove = -1;
                for(const m of availableMoves) {
                    const nextBoard = [...board]; nextBoard[m] = 'X';
                    if(checkWinner(nextBoard) === 'X') { blockingMove = m; break; }
                }
                if(blockingMove !== -1) move = blockingMove;
                else { // Medium: random, Hard: strategic
                    if (difficulty === 'Hard' && availableMoves.includes(4)) move = 4;
                    else if (difficulty === 'Hard') {
                        const corners = [0,2,6,8].filter(i => availableMoves.includes(i));
                        if(corners.length > 0) move = corners[Math.floor(Math.random() * corners.length)];
                        else move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                    }
                    else move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
                }
            }
        }
        
        const newBoard = [...board];
        newBoard[move] = 'O';
        setBoard(newBoard);
        const gameWinner = checkWinner(newBoard);
        if (gameWinner) setWinner(gameWinner);
        else setIsPlayerTurn(true);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [isPlayerTurn, board, winner, difficulty]);
  
  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
  };
  
  const status = winner ? (winner === 'draw' ? "It's a Draw!" : `${winner} Wins!`) : (isPlayerTurn ? "Your Turn (X)" : "AI's Turn (O)");

  return (
    <div className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-3 gap-2">
            {board.map((cell, index) => (
            <button key={index} onClick={() => handlePlayerMove(index)}
                className={cn("w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-4xl font-bold rounded-lg transition-colors", "bg-muted hover:bg-muted/80", !cell && !winner && isPlayerTurn && "cursor-pointer", cell || winner || !isPlayerTurn ? "cursor-not-allowed" : "")} disabled={!!cell || !!winner || !isPlayerTurn}>
                {cell === 'X' && <X className="w-12 h-12 text-blue-400" />}
                {cell === 'O' && <Circle className="w-12 h-12 text-yellow-400" />}
            </button>
            ))}
        </div>
        <p className="text-lg font-semibold h-8">{status}</p>
        <div className="flex gap-2 items-center">
            <Label>AI Difficulty</Label>
            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}><SelectTrigger className="w-32"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent></Select>
        </div>
        <Button onClick={restartGame} variant="outline"><RefreshCw className="mr-2 h-4 w-4" />New Game</Button>
    </div>
  );
};

const TicTacToe: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">Tic-Tac-Toe</CardTitle>
        </CardHeader>
        <CardContent>
            <VsAIGame />
        </CardContent>
      </Card>
    </div>
  );
};

export default TicTacToe;
