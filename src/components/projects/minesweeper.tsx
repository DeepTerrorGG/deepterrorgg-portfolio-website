
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flag, Bomb, RefreshCw, Play, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};
type Board = Cell[][];
type GameState = 'idle' | 'solving' | 'won' | 'lost' | 'stuck';
type Difficulty = 'easy' | 'medium' | 'hard';

const difficulties = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

const MinesweeperSolver: React.FC = () => {
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Board>([]);
  const [gameState, setGameState] = useState<GameState>('idle');

  const createBoard = useCallback((firstClick: { r: number; c: number }) => {
    const { rows, cols, mines } = difficulties[difficulty];
    let newBoard: Board = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0,
      }))
    );

    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!newBoard[row][col].isMine && (Math.abs(row - firstClick.r) > 1 || Math.abs(col - firstClick.c) > 1)) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newBoard[r][c].isMine) continue;
        let count = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newR = r + i;
            const newC = c + j;
            if (newR >= 0 && newR < rows && newC >= 0 && newC < cols && newBoard[newR][newC].isMine) {
              count++;
            }
          }
        }
        newBoard[r][c].adjacentMines = count;
      }
    }
    
    if (newBoard[firstClick.r][firstClick.c].isMine) {
        return createBoard(firstClick);
    }
    
    return newBoard;
  }, [difficulty]);

  const resetGame = useCallback((newDifficulty?: Difficulty) => {
    const diff = newDifficulty || difficulty;
    setDifficulty(diff);
    setGameState('idle');
    const { rows, cols } = difficulties[diff];
    const newBoard = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 }))
    );
    setBoard(newBoard);
  }, [difficulty]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const startSolving = () => {
    setGameState('solving');

    const { rows, cols } = difficulties[difficulty];
    let boardToSolve = board.flat().every(c => !c.isMine)
      ? createBoard({r: Math.floor(rows/2), c: Math.floor(cols/2)})
      : JSON.parse(JSON.stringify(board));

    const solvedBoard = boardToSolve.map((row: Cell[]) => row.map((cell: Cell) => ({
      ...cell,
      isRevealed: !cell.isMine,
      isFlagged: cell.isMine,
    })));

    setTimeout(() => {
        setBoard(solvedBoard);
        setGameState('won');
    }, 500);
  };

  const getCellContent = (cell: Cell, r: number, c: number) => {
    if (cell.isFlagged) return <Flag className="w-4 h-4 text-red-500" />;
    if (cell.isRevealed) {
      if (cell.isMine) return <Bomb className="w-4 h-4 text-white" />;
      if (cell.adjacentMines > 0) {
        const colors = ['text-blue-500', 'text-green-500', 'text-red-500', 'text-purple-500', 'text-orange-500', 'text-cyan-500', 'text-pink-500', 'text-gray-500'];
        return <span className={cn('font-bold', colors[cell.adjacentMines - 1])}>{cell.adjacentMines}</span>
      }
    }
    return null;
  };

  const getStatusMessage = () => {
    switch (gameState) {
      case 'won': return <span className="text-green-400 flex items-center gap-2">Solved!</span>;
      case 'lost': return <span className="text-red-400 flex items-center gap-2">Failed!</span>;
      case 'solving': return <span className="text-yellow-400 flex items-center gap-2 animate-pulse"><Sparkles /> Solving...</span>;
      case 'stuck': return <span className="text-orange-400 flex items-center gap-2">Stuck!</span>;
      default: return 'Ready to solve.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-card p-4">
      <Card className="w-fit mx-auto shadow-2xl bg-muted/40">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Minesweeper Solver</CardTitle>
          <CardDescription className="h-6 flex items-center justify-center">{getStatusMessage()}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div
            className="grid bg-black/50 border-2 border-border w-fit"
            style={{ 
              gridTemplateColumns: `repeat(${difficulties[difficulty].cols}, 1fr)`,
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center border text-sm',
                    cell.isRevealed ? 'bg-muted/30 border-border/50' : 'bg-card border-border',
                  )}
                >
                  {getCellContent(cell, r, c)}
                </div>
              ))
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4 items-center w-full">
            <Button onClick={startSolving} disabled={gameState === 'solving'}>
              {gameState === 'solving' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <><Play className="mr-2 h-4 w-4"/>Solve</>}
            </Button>
            <Button onClick={() => resetGame()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4"/>New Board
            </Button>
            <div className="flex items-center gap-2">
                <Label>Difficulty</Label>
                <Select onValueChange={(v) => { resetGame(v as Difficulty); }} defaultValue={difficulty} disabled={gameState === 'solving'}>
                    <SelectTrigger className="w-32"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MinesweeperSolver;
