'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, User, Bot, X, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type Player = 'X' | 'O';
type Board = (Player | null)[];
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],           // Diagonals
];

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');

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

  const handlePlayerMove = (index: number) => {
    if (board[index] || !isPlayerTurn || winner) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      setIsPlayerTurn(false);
    }
  };

  const findBestMove = (currentBoard: Board, level: Difficulty): number => {
    const availableMoves = currentBoard.map((cell, index) => cell === null ? index : null).filter(val => val !== null) as number[];

    // --- Easy: Random move ---
    if (level === 'Easy') {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // --- Shared Logic for Medium and Hard ---
    // 1. Check if AI can win
    for (const move of availableMoves) {
        const nextBoard = [...currentBoard];
        nextBoard[move] = 'O';
        if (checkWinner(nextBoard) === 'O') return move;
    }
    // 2. Check if Player can win and block
    for (const move of availableMoves) {
        const nextBoard = [...currentBoard];
        nextBoard[move] = 'X';
        if (checkWinner(nextBoard) === 'X') return move;
    }

    // --- Medium: Win/Block, then random ---
    if (level === 'Medium') {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // --- Hard: Strategic move ---
    // 3. Take center if available
    if (availableMoves.includes(4)) return 4;
    // 4. Take a corner
    const corners = [0, 2, 6, 8].filter(i => availableMoves.includes(i));
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
    // 5. Take a side
    const sides = [1, 3, 5, 7].filter(i => availableMoves.includes(i));
    if (sides.length > 0) return sides[Math.floor(Math.random() * sides.length)];

    return availableMoves[0]; // Fallback
  };


  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timeoutId = setTimeout(() => {
        const move = findBestMove(board, difficulty);
        if (move !== -1) {
            const newBoard = [...board];
            newBoard[move] = 'O';
            setBoard(newBoard);
            const gameWinner = checkWinner(newBoard);
            if (gameWinner) {
                setWinner(gameWinner);
            } else {
                setIsPlayerTurn(true);
            }
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [isPlayerTurn, board, winner, difficulty]);

  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
  };
  
  const getStatusMessage = () => {
    if (winner) {
        if (winner === 'X') return { text: "You Win!", icon: <User className="h-5 w-5"/>, color: "text-green-400" };
        if (winner === 'O') return { text: "AI Wins!", icon: <Bot className="h-5 w-5"/>, color: "text-red-400" };
        return { text: "It's a Draw!", icon: null, color: "text-yellow-400" };
    }
    return { text: isPlayerTurn ? "Your Turn (X)" : "AI's Turn (O)", icon: isPlayerTurn ? <User className="h-5 w-5"/> : <Bot className="h-5 w-5"/>, color: "" };
  }

  const status = getStatusMessage();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-sm mx-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">Tic-Tac-Toe</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handlePlayerMove(index)}
                className={cn(
                  "w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-4xl font-bold rounded-lg transition-colors",
                  "bg-muted hover:bg-muted/80",
                  !cell && !winner && isPlayerTurn && "cursor-pointer",
                  cell || winner || !isPlayerTurn ? "cursor-not-allowed" : ""
                )}
                disabled={!!cell || !!winner || !isPlayerTurn}
              >
                {cell === 'X' && <X className="w-12 h-12 text-blue-400" />}
                {cell === 'O' && <Circle className="w-12 h-12 text-yellow-400" />}
              </button>
            ))}
          </div>
          <div className={cn("flex items-center gap-2 text-lg font-semibold h-8", status.color)}>
            {status.icon}
            <p>{status.text}</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <div className="w-full">
                <Label htmlFor="difficulty-select">AI Difficulty</Label>
                <Select value={difficulty} onValueChange={(v) => { setDifficulty(v as Difficulty); restartGame(); }}>
                    <SelectTrigger id="difficulty-select"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={restartGame} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              New Game
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TicTacToe;
