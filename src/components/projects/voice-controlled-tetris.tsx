
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BOARD_WIDTH, BOARD_HEIGHT, createEmptyBoard, randomTetromino } from '@/lib/tetris';

type Player = {
  pos: { x: number; y: number };
  tetromino: number[][];
  color: string;
};

type Board = (string | number)[][];

const TETROMINO_COLORS: { [key: string]: string } = {
    cyan: 'bg-cyan-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
};

const GameBoard = ({ board, player }: { board: Board, player: Player }) => {
  const displayBoard = board.map(row => [...row]);

  player.tetromino.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const boardY = y + player.pos.y;
        const boardX = x + player.pos.x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          displayBoard[boardY][boardX] = player.color;
        }
      }
    });
  });

  return (
    <div className="grid border-2 border-border bg-black" style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)` }}>
      {displayBoard.map((row, y) =>
        row.map((cell, x) => {
          const colorClass = cell && cell !== 0 ? TETROMINO_COLORS[cell as string] : 'bg-gray-900/50';
          return <div key={`${y}-${x}`} className={cn('w-8 h-8', colorClass)} />;
        })
      )}
    </div>
  );
};

const NextPieceDisplay = ({ piece }: { piece: { shape: number[][]; color: string } | null }) => {
    const grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    if(piece) {
        const shapeHeight = piece.shape.length;
        const shapeWidth = piece.shape[0].length;
        const yOffset = Math.floor((4-shapeHeight)/2);
        const xOffset = Math.floor((4-shapeWidth)/2);
        piece.shape.forEach((row, y) => row.forEach((val, x) => {
            if(val) grid[y+yOffset][x+xOffset] = piece.color as any;
        }));
    }
    return (
        <div className="grid gap-1 bg-black/50 p-2 rounded-md" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {grid.flat().map((cell, i) => (
                <div key={i} className={cn('w-6 h-6 rounded-sm', cell && cell !== 0 ? TETROMINO_COLORS[cell as any] : 'bg-gray-800')} />
            ))}
        </div>
    )
}

const VoiceControlledTetris: React.FC = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [player, setPlayer] = useState<Player>({ pos: { x: 0, y: 0 }, tetromino: [], color: '' });
  const [nextPiece, setNextPiece] = useState<{shape: number[][], color: string} | null>(null);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [lines, setLines] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const dropTimeRef = useRef(1000);
  const previousTimeRef = useRef(0);
  const dropCounter = useRef(0);
  
  // Refs to hold the current state for the game loop
  const playerRef = useRef(player);
  const boardRef = useRef(board);
  const isGameOverRef = useRef(isGameOver);

  useEffect(() => { playerRef.current = player }, [player]);
  useEffect(() => { boardRef.current = board }, [board]);
  useEffect(() => { isGameOverRef.current = isGameOver }, [isGameOver]);

  
  const checkCollision = (p: Player, b: Board, move: { x: number; y: number }): boolean => {
    for (let y = 0; y < p.tetromino.length; y++) {
      for (let x = 0; x < p.tetromino[0].length; x++) {
        if (p.tetromino[y][x] !== 0) {
          const newY = y + p.pos.y + move.y;
          const newX = x + p.pos.x + move.x;

          if (
            newY >= BOARD_HEIGHT ||
            newX < 0 || newX >= BOARD_WIDTH ||
            (newY >= 0 && b[newY][newX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };
  
  const resetPlayer = useCallback(() => {
    const newPiece = nextPiece || randomTetromino();
    const nextNextPiece = randomTetromino();
    setNextPiece(nextNextPiece);

    const newPlayer = {
      pos: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      tetromino: newPiece.shape,
      color: newPiece.color,
    };

    if (checkCollision(newPlayer, boardRef.current, {x: 0, y: 0})) {
      setIsGameOver(true);
      setIsPaused(true);
    } else {
      setPlayer(newPlayer);
    }
  }, [nextPiece]);
  
  const startGame = useCallback(() => {
    const newBoard = createEmptyBoard();
    setBoard(newBoard);
    setScore(0);
    setLevel(0);
    setLines(0);
    setIsGameOver(false);
    
    const firstPiece = randomTetromino();
    const secondPiece = randomTetromino();
    setNextPiece(secondPiece);
    setPlayer({
        pos: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
        tetromino: firstPiece.shape,
        color: firstPiece.color,
    });
    setIsPaused(false);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);


  const updateBoard = useCallback(() => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row]);
      playerRef.current.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const boardY = y + playerRef.current.pos.y;
            const boardX = x + playerRef.current.pos.x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              newBoard[boardY][boardX] = playerRef.current.color;
            }
          }
        });
      });
  
      let linesCleared = 0;
      const clearedBoard = newBoard.filter(row => !row.every(cell => cell !== 0));
      linesCleared = BOARD_HEIGHT - clearedBoard.length;
  
      if (linesCleared > 0) {
        const newRows = Array.from({ length: linesCleared }, () => Array(BOARD_WIDTH).fill(0));
        setLines(prev => prev + linesCleared);
        setScore(prev => prev + [0, 40, 100, 300, 1200][linesCleared] * (level + 1));
        return [...newRows, ...clearedBoard];
      }
      return newBoard;
    });
    resetPlayer();
  }, [level, resetPlayer]);
  
  const playerDrop = useCallback(() => {
    if (checkCollision(playerRef.current, boardRef.current, { x: 0, y: 1 })) {
       if (playerRef.current.pos.y < 1) {
           setIsGameOver(true);
           setIsPaused(true);
           return;
       }
       updateBoard();
    } else {
       setPlayer(prev => ({ ...prev, pos: { ...prev.pos, y: prev.pos.y + 1 } }));
    }
    dropCounter.current = 0;
  }, [updateBoard]);

  const update = useCallback((time = 0) => {
    if (isPaused || isGameOverRef.current) return;
    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;
    dropCounter.current += deltaTime;

    if (dropCounter.current > dropTimeRef.current) {
        playerDrop();
    }
    requestAnimationFrame(update);
  }, [isPaused, playerDrop]);

  useEffect(() => {
    if (!isPaused && !isGameOver) {
      previousTimeRef.current = 0;
      dropCounter.current = 0;
      const animationFrameId = requestAnimationFrame(update);
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [update, isPaused, isGameOver]);
  
  const movePlayer = (dir: -1 | 1) => {
    if (!checkCollision(player, board, { x: dir, y: 0 })) {
      setPlayer(prev => ({ ...prev, pos: { ...prev.pos, x: prev.pos.x + dir } }));
    }
  }

  const rotatePlayer = () => {
    const clonedTetromino = JSON.parse(JSON.stringify(player.tetromino));
    const rotated = clonedTetromino[0].map((_: any, colIndex: number) =>
      clonedTetromino.map((row: any[]) => row[colIndex]).reverse()
    );
    
    let newPlayer = {...player, tetromino: rotated };
    let offset = 1;
    while(checkCollision(newPlayer, board, {x:0, y:0})) {
        newPlayer.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > newPlayer.tetromino[0].length + 1) return;
    }
    setPlayer(newPlayer);
  }

  const hardDrop = () => {
    let tempPlayer = { ...playerRef.current };
    while (!checkCollision(tempPlayer, boardRef.current, { x: 0, y: 1 })) {
        tempPlayer.pos.y += 1;
    }
    // Directly update state before triggering board update
    setPlayer(tempPlayer);
    
    // Defer the board update to the next render cycle to use the new player state
    setTimeout(() => updateBoard(), 0);
  };


  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isGameOver) return;
    if (e.key === 'p' || e.key === 'P') { setIsPaused(p => !p); return; }
    if(isPaused) return;
    if (e.key === 'ArrowLeft') movePlayer(-1);
    else if (e.key === 'ArrowRight') movePlayer(1);
    else if (e.key === 'ArrowDown') playerDrop();
    else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'x') rotatePlayer();
    else if (e.key === ' ') { e.preventDefault(); hardDrop(); }
  }, [isGameOver, isPaused, playerDrop, hardDrop]);

  return (
    <div className="w-full h-full bg-card flex items-center justify-center p-4" onKeyDown={handleKeyDown} tabIndex={0} ref={gameAreaRef}>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <Card className="w-full lg:w-56 bg-muted/30 border-border order-last lg:order-first">
          <CardHeader><CardTitle>Stats</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-sm text-muted-foreground">Score</p><p className="font-bold text-lg">{score}</p></div>
            <div><p className="text-sm text-muted-foreground">Lines</p><p className="font-bold text-lg">{lines}</p></div>
            <div><p className="text-sm text-muted-foreground">Level</p><p className="font-bold text-lg">{level}</p></div>
            <div className="pt-4"><p className="text-sm text-muted-foreground mb-2">Next Piece</p><NextPieceDisplay piece={nextPiece} /></div>
          </CardContent>
        </Card>

        <div className="relative shadow-2xl">
          <GameBoard board={board} player={player} />
          {(isGameOver || isPaused) && (
             <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 z-10">
               <h2 className="text-3xl font-bold text-white">{isGameOver ? "Game Over" : "Paused"}</h2>
               <Button onClick={startGame}><RefreshCw className="mr-2"/>{isGameOver ? 'Play Again' : 'Restart'}</Button>
               {isPaused && !isGameOver && <Button onClick={() => setIsPaused(false)}>Resume</Button>}
            </div>
          )}
        </div>
        
        <Card className="w-full lg:w-56 bg-muted/30 border-border">
            <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Arrows:</strong> Move</p>
                <p><strong>Up / X:</strong> Rotate</p>
                <p><strong>Space:</strong> Hard Drop</p>
                <p><strong>P:</strong> Pause</p>
            </CardContent>
            <CardHeader><CardTitle>Voice</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                 <Button variant="outline" className="w-full" disabled>
                     <MicOff className="mr-2"/> Voice Disabled
                 </Button>
                <div className="bg-black/30 p-2 rounded-md h-12 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground italic">Voice command...</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceControlledTetris;
