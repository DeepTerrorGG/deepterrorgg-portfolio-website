'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, User, Bot, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Player = 'red' | 'yellow';
const ROWS = 6;
const COLS = 7;

const ConnectFour: React.FC = () => {
  const [board, setBoard] = useState< (Player | null)[][]>(() => Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const checkWinner = (currentBoard: (Player | null)[][]): Player | 'draw' | null => {
    // Check horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r][c+1] && currentBoard[r][c] === currentBoard[r][c+2] && currentBoard[r][c] === currentBoard[r][c+3]) {
          return currentBoard[r][c];
        }
      }
    }
    // Check vertical
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r+1][c] && currentBoard[r][c] === currentBoard[r+2][c] && currentBoard[r][c] === currentBoard[r+3][c]) {
          return currentBoard[r][c];
        }
      }
    }
    // Check diagonal (down-right)
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r+1][c+1] && currentBoard[r][c] === currentBoard[r+2][c+2] && currentBoard[r][c] === currentBoard[r+3][c+3]) {
          return currentBoard[r][c];
        }
      }
    }
    // Check diagonal (up-right)
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (currentBoard[r][c] && currentBoard[r][c] === currentBoard[r-1][c+1] && currentBoard[r][c] === currentBoard[r-2][c+2] && currentBoard[r][c] === currentBoard[r-3][c+3]) {
          return currentBoard[r][c];
        }
      }
    }
    // Check for draw
    if (currentBoard.every(row => row.every(cell => cell !== null))) {
      return 'draw';
    }
    return null;
  };

  const handleColumnClick = (colIndex: number) => {
    if (gameOver || board[0][colIndex]) return;

    const newBoard = board.map(row => [...row]);
    
    // "Gravity" logic: find the lowest empty spot in the column
    let rowIndex = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (newBoard[r][colIndex] === null) {
            rowIndex = r;
            break;
        }
    }

    if (rowIndex !== -1) {
        newBoard[rowIndex][colIndex] = currentPlayer;
        setBoard(newBoard);

        const gameWinner = checkWinner(newBoard);
        if (gameWinner) {
            setWinner(gameWinner);
            setGameOver(true);
        } else {
            setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
        }
    }
  };

  const restartGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer('red');
    setWinner(null);
    setGameOver(false);
  };
  
  const getStatusMessage = () => {
    if (winner) {
        if (winner === 'draw') return "It's a Draw!";
        return `${winner.charAt(0).toUpperCase() + winner.slice(1)} Wins!`;
    }
    return `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-muted/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Connect 4</CardTitle>
          <div className={cn("text-xl font-semibold h-8 flex items-center justify-center gap-2",
            winner === 'red' && 'text-red-500',
            winner === 'yellow' && 'text-yellow-400'
          )}>
            {winner && winner !== 'draw' && <Award />}
            {getStatusMessage()}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Column Click Handlers */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
            {Array.from({ length: COLS }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-12 w-12 cursor-pointer flex items-center justify-center"
                onClick={() => handleColumnClick(colIndex)}
              >
                  <motion.div
                    whileHover={{ scale: 1.2, backgroundColor: currentPlayer === 'red' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(234, 179, 8, 0.5)' }}
                    className="w-10 h-10 rounded-full"
                  />
              </div>
            ))}
          </div>
          {/* Game Board */}
          <div className="p-2 bg-blue-800 rounded-lg grid gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div key={`${rowIndex}-${colIndex}`} className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
                   <AnimatePresence>
                    {cell && (
                        <motion.div
                          initial={{ scale: 0, y: -200 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className={cn(
                            "w-10 h-10 rounded-full",
                            cell === 'red' ? 'bg-red-500' : 'bg-yellow-400'
                          )}
                        />
                    )}
                   </AnimatePresence>
                </div>
              ))
            )}
          </div>
          <Button onClick={restartGame} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4"/>
            New Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectFour;
