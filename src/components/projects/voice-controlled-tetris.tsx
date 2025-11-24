'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOS, createEmptyBoard, randomTetromino } from '@/lib/tetris';

type Player = {
  pos: { x: number; y: number };
  tetromino: number[][];
  color: string;
  collided: boolean;
};

type Board = (string | number)[][];

const VoiceControlledTetris: React.FC = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [player, setPlayer] = useState<Player>({
    pos: { x: 0, y: 0 },
    tetromino: [],
    color: '',
    collided: false,
  });

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [lines, setLines] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [nextPiece, setNextPiece] = useState<{shape: number[][], color: string} | null>(null);

  // Voice Control State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const dropTime = useRef(1000);
  const previousTimeRef = useRef(0);
  const dropCounter = useRef(0);

  const resetPlayer = useCallback(() => {
    const newPiece = nextPiece || randomTetromino();
    setNextPiece(randomTetromino());
    
    setPlayer({
      pos: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      tetromino: newPiece.shape,
      color: newPiece.color,
      collided: false,
    });
  }, [nextPiece]);
  
  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLevel(0);
    setLines(0);
    setIsGameOver(false);
    setIsPaused(false);
    dropTime.current = 1000;
    setNextPiece(randomTetromino());
    resetPlayer(); // This will use the just-set next piece
  }, [resetPlayer]);

  useEffect(() => {
    startGame();
  }, [startGame]);
  
  // Game Loop
  const update = useCallback((time = 0) => {
    if (isPaused || isGameOver) return;

    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;
    dropCounter.current += deltaTime;

    if (dropCounter.current > dropTime.current) {
        playerDrop();
    }
    requestAnimationFrame(update);
  }, [isPaused, isGameOver]);

  useEffect(() => {
    requestAnimationFrame(update);
  }, [update]);
  
  const playerDrop = () => {
     if (!checkCollision(player, board, { x: 0, y: 1 })) {
      setPlayer(prev => ({ ...prev, pos: { ...prev.pos, y: prev.pos.y + 1 } }));
    } else {
      if (player.pos.y < 1) {
        setIsGameOver(true);
        return;
      }
      updateBoard();
    }
    dropCounter.current = 0;
  }

  const updateBoard = () => {
    const newBoard = board.map(row => [...row]);
    player.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = y + player.pos.y;
          const boardX = x + player.pos.x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              newBoard[boardY][boardX] = player.color;
          }
        }
      });
    });

    // Line clearing logic
    let linesCleared = 0;
    for (let y = newBoard.length - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== 0)) {
        linesCleared++;
        newBoard.splice(y, 1);
      }
    }
    if(linesCleared > 0) {
       for (let i = 0; i < linesCleared; i++) {
            newBoard.unshift(Array(BOARD_WIDTH).fill(0));
       }
       setLines(prev => prev + linesCleared);
       setScore(prev => prev + [0, 40, 100, 300, 1200][linesCleared] * (level + 1));
       if (lines + linesCleared > (level + 1) * 10) {
         setLevel(prev => prev + 1);
         dropTime.current = 1000 / (level + 2);
       }
    }

    setBoard(newBoard);
    resetPlayer();
  };

  const checkCollision = (p: Player, b: Board, move: { x: number; y: number }): boolean => {
    for (let y = 0; y < p.tetromino.length; y++) {
      for (let x = 0; x < p.tetromino[0].length; x++) {
        if (p.tetromino[y][x] !== 0) {
          const newY = y + p.pos.y + move.y;
          const newX = x + p.pos.x + move.x;
          if (
            newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || (newY >= 0 && b[newY][newX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };
  
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
    const originalPos = player.pos.x;
    let offset = 1;
    
    const newPlayer = {...player, tetromino: rotated };

    while(checkCollision(newPlayer, board, {x:0, y:0})) {
        newPlayer.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > newPlayer.tetromino[0].length) {
            newPlayer.pos.x = originalPos; // Cannot rotate
            return;
        }
    }
    setPlayer(newPlayer);
  }

  const hardDrop = () => {
    let newPlayer = { ...player };
    while (!checkCollision(newPlayer, board, { x: 0, y: 1 })) {
        newPlayer.pos.y += 1;
    }
    setPlayer(newPlayer);
  }

  // Keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isPaused || isGameOver) return;
    if (e.key === 'ArrowLeft') movePlayer(-1);
    else if (e.key === 'ArrowRight') movePlayer(1);
    else if (e.key === 'ArrowDown') playerDrop();
    else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'x') rotatePlayer();
    else if (e.key === ' ') hardDrop();
    else if (e.key.toLowerCase() === 'p') setIsPaused(p => !p);
  };
  
  useEffect(() => {
    if (gameAreaRef.current) {
        gameAreaRef.current.focus();
    }
  }, []);


  const GameBoard = ({ currentBoard }: { currentBoard: Board }) => (
    <div className="grid border-2 border-border bg-black" style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)` }}>
      {currentBoard.map((row, y) =>
        row.map((cell, x) => {
          let color = cell;
          // Draw player piece
          if (player.tetromino.length > 0) {
            player.tetromino.forEach((pRow, pY) => {
              pRow.forEach((pValue, pX) => {
                if (pValue !== 0 && y === player.pos.y + pY && x === player.pos.x + pX) {
                  color = player.color;
                }
              });
            });
          }
          return <div key={`${y}-${x}`} className={cn("aspect-square", color !== 0 ? `bg-${color}-500` : 'bg-gray-900' )} />;
        })
      )}
    </div>
  );
  
   const NextPieceDisplay = ({ piece }: { piece: { shape: number[][], color: string } | null }) => {
    const grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    if(piece) {
        piece.shape.forEach((row, y) => row.forEach((val, x) => {
            if(val) grid[y+1][x+1] = piece.color;
        }));
    }
    return (
        <div className="grid gap-px bg-black p-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {grid.flat().map((cell, i) => (
                <div key={i} className={cn('w-4 h-4', cell ? `bg-${cell}-500` : 'bg-gray-800')} />
            ))}
        </div>
    )
  }

  return (
    <div className="w-full h-full bg-card flex items-center justify-center p-4">
      <div 
        ref={gameAreaRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="flex flex-col md:flex-row gap-8 items-start outline-none"
      >
        {/* Game Info Panel */}
        <Card className="w-full md:w-48 bg-muted/30 border-border">
          <CardHeader><CardTitle>Stats</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-sm text-muted-foreground">Score</p><p className="font-bold text-lg">{score}</p></div>
            <div><p className="text-sm text-muted-foreground">Lines</p><p className="font-bold text-lg">{lines}</p></div>
            <div><p className="text-sm text-muted-foreground">Level</p><p className="font-bold text-lg">{level}</p></div>
            <div><p className="text-sm text-muted-foreground mt-4">Next</p><NextPieceDisplay piece={nextPiece} /></div>
          </CardContent>
        </Card>

        {/* Main Game Area */}
        <div className="relative">
          <GameBoard currentBoard={board} />
          {(isGameOver || isPaused) && (
             <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
               <h2 className="text-3xl font-bold text-white">{isGameOver ? "Game Over" : "Paused"}</h2>
               <Button onClick={startGame}><RefreshCw className="mr-2"/>{isGameOver ? 'Play Again' : 'Restart'}</Button>
               {isPaused && <Button onClick={() => setIsPaused(false)}>Resume</Button>}
            </div>
          )}
        </div>
        
        {/* Controls and Voice Panel */}
        <Card className="w-full md:w-56 bg-muted/30 border-border">
            <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Arrows:</strong> Move</p>
                <p><strong>Up / X:</strong> Rotate</p>
                <p><strong>Space:</strong> Hard Drop</p>
                <p><strong>P:</strong> Pause</p>
            </CardContent>
            <CardHeader><CardTitle>Voice</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                 <Button variant="outline" className="w-full">
                     <Mic className="mr-2"/> Enable Voice
                 </Button>
                <div className="bg-black/30 p-2 rounded-md h-12 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground italic">Voice command...</p>
                </div>
            </CardContent>
        </Card>
      </div>
       <div className="hidden bg-cyan-500 bg-blue-500 bg-orange-500 bg-yellow-500 bg-green-500 bg-purple-500 bg-red-500"></div>
    </div>
  );
};

export default VoiceControlledTetris;
