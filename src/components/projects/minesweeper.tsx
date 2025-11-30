
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flag, Bomb, RefreshCw, Play, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};
type Board = Cell[][];
type GameState = 'idle' | 'solving' | 'won' | 'lost';
type Difficulty = 'easy' | 'medium' | 'hard';

const difficulties = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

const MinesweeperSolver: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('hard');
  const [board, setBoard] = useState<Board>([]);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [speed, setSpeed] = useState(5); // Speed on a 1-10 scale
  const [currentFocus, setCurrentFocus] = useState<{r: number, c: number} | null>(null);

  const solverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSolvingRef = useRef(false);

  useEffect(() => {
    isSolvingRef.current = gameState === 'solving';
  }, [gameState]);

  const createBoard = useCallback((firstClick: { r: number; c: number }) => {
    const { rows, cols, mines } = difficulties[difficulty];
    let newBoard: Board = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      }))
    );

    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      // Ensure mine is not at first click or its immediate neighbors
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
    
    // Ensure first click is on a 0-mine cell for a good start
    if (newBoard[firstClick.r][firstClick.c].adjacentMines !== 0 || newBoard[firstClick.r][firstClick.c].isMine) {
        return createBoard(firstClick); // Retry if first click isn't empty
    }

    return newBoard;
  }, [difficulty]);

  const resetGame = useCallback((newDifficulty?: Difficulty) => {
    if (solverTimeoutRef.current) clearTimeout(solverTimeoutRef.current);
    const diff = newDifficulty || difficulty;
    setGameState('idle');
    const { rows, cols } = difficulties[diff];
    const newBoard = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0,
      }))
    );
    setBoard(newBoard);
    setCurrentFocus(null);
  }, [difficulty]);

  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

  const revealCell = useCallback((r: number, c: number, boardToUpdate: Board): Board => {
    let newBoard = boardToUpdate.map(row => row.map(cell => ({ ...cell })));
    const stack: [number, number][] = [[r, c]];
    const visited = new Set<string>();
    visited.add(`${r},${c}`);
    
    while(stack.length > 0) {
        const [row, col] = stack.pop()!;
        if (row < 0 || row >= newBoard.length || col < 0 || col >= newBoard[0].length) continue;
        
        const cell = newBoard[row][col];
        if (cell.isRevealed || cell.isFlagged) continue;

        newBoard[row][col] = { ...cell, isRevealed: true };
        
        if (cell.adjacentMines === 0 && !cell.isMine) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newR = row + i;
                    const newC = col + j;
                    if(!visited.has(`${newR},${newC}`)) {
                       stack.push([newR, newC]);
                       visited.add(`${newR},${newC}`);
                    }
                }
            }
        }
    }
    return newBoard;
  }, []);

  const getNeighbors = (r: number, c: number, b: Board) => {
    const neighbors: ({r: number, c: number} & Cell)[] = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newR = r + i;
            const newC = c + j;
            if (newR >= 0 && newR < b.length && newC >= 0 && newC < b[0].length) {
                neighbors.push({ ...b[newR][newC], r: newR, c: newC });
            }
        }
    }
    return neighbors;
  }

 const solveStep = useCallback(() => {
    if (!isSolvingRef.current) return;

    setBoard(prevBoard => {
      let boardChanged = false;
      let newBoard = prevBoard.map(row => row.map(cell => ({ ...cell })));
      
      const revealQueue: {r: number, c: number}[] = [];
      const flagQueue: {r: number, c: number}[] = [];

      for (let r = 0; r < newBoard.length; r++) {
        for (let c = 0; c < newBoard[0].length; c++) {
          const cell = newBoard[r][c];
          if (!cell.isRevealed || cell.adjacentMines === 0) continue;

          setCurrentFocus({ r, c });

          const neighbors = getNeighbors(r, c, newBoard);
          const flaggedNeighbors = neighbors.filter(n => n.isFlagged).length;
          const unrevealedNeighbors = neighbors.filter(n => !n.isRevealed && !n.isFlagged);

          if (cell.adjacentMines === flaggedNeighbors && unrevealedNeighbors.length > 0) {
            unrevealedNeighbors.forEach(n => revealQueue.push({r: n.r, c: n.c}));
            boardChanged = true;
          }
          
          if (cell.adjacentMines === unrevealedNeighbors.length + flaggedNeighbors && unrevealedNeighbors.length > 0) {
            unrevealedNeighbors.forEach(n => flagQueue.push({r: n.r, c: n.c}));
            boardChanged = true;
          }
        }
      }
      
      revealQueue.forEach(({r, c}) => newBoard = revealCell(r, c, newBoard));
      flagQueue.forEach(({r, c}) => { if(!newBoard[r][c].isFlagged) newBoard[r][c].isFlagged = true; });

      const revealedMines = newBoard.flat().some(c => c.isRevealed && c.isMine);
      if (revealedMines) {
        setGameState('lost');
        return prevBoard;
      }

      const unrevealedNonMines = newBoard.flat().filter(c => !c.isMine && !c.isRevealed).length;
      if (unrevealedNonMines === 0) {
        setGameState('won');
        return newBoard.map(row => row.map(cell => ({...cell, isRevealed: true})));
      }

      if (boardChanged) {
        solverTimeoutRef.current = setTimeout(solveStep, 210 - speed * 20);
      } else {
        setGameState('idle'); // Stuck
      }
      return newBoard;
    });
  }, [speed, revealCell]);


  const startSolving = () => {
    let startR, startC;
    const { rows, cols } = difficulties[difficulty];
    
    // Pick a random starting point.
    startR = Math.floor(Math.random() * rows);
    startC = Math.floor(Math.random() * cols);

    const newBoardWithMines = createBoard({ r: startR, c: startC });
    const finalBoard = revealCell(startR, startC, newBoardWithMines);

    setBoard(finalBoard);
    setGameState('solving');
    
    solverTimeoutRef.current = setTimeout(solveStep, 500);
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
      default: return 'Ready to solve.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-full bg-card p-4">
      <Card className="w-fit mx-auto shadow-2xl bg-muted/40">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Minesweeper Solver</CardTitle>
          <CardDescription>{getStatusMessage()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="grid bg-black/50 border-2 border-border"
            style={{ 
              gridTemplateColumns: `repeat(${difficulties[difficulty].cols}, 1fr)`,
              width: `${difficulties[difficulty].cols * 28}px`,
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center border text-sm',
                    cell.isRevealed ? 'bg-muted/30 border-border/50' : 'bg-card border-border',
                    currentFocus?.r === r && currentFocus?.c === c && gameState === 'solving' && 'ring-2 ring-yellow-400 z-10'
                  )}
                >
                  {getCellContent(cell, r, c)}
                </div>
              ))
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4 items-center">
            <Button onClick={startSolving} disabled={gameState === 'solving'}>
              <Play className="mr-2 h-4 w-4"/>Solve
            </Button>
            <Button onClick={() => resetGame()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4"/>New Board
            </Button>
            <div className="flex items-center gap-2">
                <Label className="w-24">Difficulty</Label>
                <Select onValueChange={(v) => { setDifficulty(v as Difficulty); resetGame(v as Difficulty); }} defaultValue={difficulty} disabled={gameState === 'solving'}>
                    <SelectTrigger className="w-32"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-48">
              <Label className="w-16">Speed</Label>
              <Slider min={1} max={10} step={1} value={[speed]} onValueChange={v => setSpeed(v[0])} disabled={gameState === 'solving'}/>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MinesweeperSolver;
