'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, User, Bot, X, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Player = 'X' | 'O';
type Board = (Player | null)[];

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],           // Diagonals
];

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);

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

  const findBestMove = (currentBoard: Board): number => {
    // 1. Check if AI can win
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const nextBoard = [...currentBoard];
        nextBoard[i] = 'O';
        if (checkWinner(nextBoard) === 'O') return i;
      }
    }
    // 2. Check if Player can win and block
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const nextBoard = [...currentBoard];
        nextBoard[i] = 'X';
        if (checkWinner(nextBoard) === 'X') return i;
      }
    }
    // 3. Take center if available
    if (!currentBoard[4]) return 4;
    // 4. Take a random corner
    const corners = [0, 2, 6, 8].filter(i => !currentBoard[i]);
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
    // 5. Take a random side
    const sides = [1, 3, 5, 7].filter(i => !currentBoard[i]);
    if (sides.length > 0) return sides[Math.floor(Math.random() * sides.length)];
    
    return currentBoard.findIndex(cell => cell === null); // Should not be reached in a normal game
  }


  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timeoutId = setTimeout(() => {
        const bestMove = findBestMove(board);
        if (bestMove !== -1) {
            const newBoard = [...board];
            newBoard[bestMove] = 'O';
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
  }, [isPlayerTurn, board, winner]);

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
          <div className="mt-4 flex items-center justify-between w-full">
            <div className={cn("flex items-center gap-2 text-lg font-semibold", status.color)}>
              {status.icon}
              <p>{status.text}</p>
            </div>
            <Button onClick={restartGame} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicTacToe;
