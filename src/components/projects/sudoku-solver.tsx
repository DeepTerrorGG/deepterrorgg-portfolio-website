
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

type CellValue = number | string | null;
type Board = CellValue[][];
type SolveStep = { board: Board; currentRow: number; currentCol: number, status: 'placing' | 'backtracking' };
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type GridSize = 4 | 9 | 16 | 25;

const puzzles: Record<GridSize, Record<Difficulty, Board>> = {
    4: {
        'Easy': [
            [null, 1, 3, null],
            [3, null, null, 1],
            [2, null, null, 3],
            [null, 2, 1, null],
        ],
        'Medium': [
            [null, null, 2, null],
            [1, null, null, 4],
            [3, null, null, 2],
            [null, 4, null, null],
        ],
        'Hard': [
            [null, null, null, 1],
            [null, 2, null, null],
            [null, null, 3, null],
            [4, null, null, null],
        ],
    },
    9: {
        'Easy': [
            [5,3,null,null,7,null,null,null,null],
            [6,null,null,1,9,5,null,null,null],
            [null,9,8,null,null,null,null,6,null],
            [8,null,null,null,6,null,null,null,3],
            [4,null,null,8,null,3,null,null,1],
            [7,null,null,null,2,null,null,null,6],
            [null,6,null,null,null,null,2,8,null],
            [null,null,null,4,1,9,null,null,5],
            [null,null,null,null,8,null,null,7,9]
        ],
        'Medium': [
            [null,2,null,6,null,8,null,null,null],
            [5,8,null,null,null,9,7,null,null],
            [null,null,null,null,4,null,null,null,null],
            [3,7,null,null,null,null,5,null,null],
            [6,null,null,null,null,null,null,null,4],
            [null,null,8,null,null,null,null,1,3],
            [null,null,null,null,2,null,null,null,null],
            [null,null,9,8,null,null,null,3,6],
            [null,null,null,3,null,6,null,9,null]
        ],
        'Hard': [
            [null,null,null,null,null,null,null,null,null],
            [null,null,null,null,null,3,null,8,5],
            [null,null,1,null,2,null,null,null,null],
            [null,null,null,5,null,7,null,null,null],
            [null,null,4,null,null,null,1,null,null],
            [null,9,null,null,null,null,null,null,null],
            [5,null,null,null,null,null,null,7,3],
            [null,null,2,null,1,null,null,null,null],
            [null,null,null,null,4,null,null,null,9]
        ]
    },
    16: {
        'Easy': [
            [null,11,null,null,null,13,8,3,null,null,5,null,null,null,null,9],
            [9,null,3,null,null,null,null,null,13,null,null,null,14,1,null,null],
            [7,null,12,null,1,null,null,15,null,null,9,null,null,5,null,null],
            [null,null,null,null,null,null,null,11,null,12,null,14,null,null,null,3],
            [null,null,1,13,null,null,null,null,null,null,null,null,11,null,null,6],
            [null,5,null,null,null,null,9,null,null,1,15,7,null,null,null,null],
            [11,null,null,null,15,null,13,null,null,null,null,10,1,null,null,null],
            [null,14,null,15,null,null,null,1,null,null,2,null,null,7,null,null],
            [null,null,9,null,null,14,null,null,1,null,null,null,15,null,7,null],
            [null,null,null,3,11,null,null,null,null,15,null,13,null,null,null,10],
            [null,null,null,null,13,10,3,null,null,7,null,null,null,null,9,null],
            [4,null,null,1,null,null,null,null,null,null,null,null,6,2,null,null],
            [1,null,null,null,12,null,11,null,14,null,null,null,null,null,null,null],
            [null,null,15,null,null,5,null,null,2,null,null,null,null,4,null,12],
            [null,null,7,2,null,null,null,10,null,null,null,null,null,15,null,13],
            [10,null,null,null,null,9,null,null,15,8,13,null,null,null,1,null],
        ],
        'Medium': [
            // Simplified for demonstration as a full 16x16 medium is complex to create
            [11,null,null,null,null,null,8,null,null,null,null,10,null,null,null,4],
            [null,5,16,null,null,null,null,1,null,null,6,null,null,12,3,null],
            [null,null,null,9,null,13,null,11,null,null,null,7,null,16,null,null],
            [null,null,10,null,null,null,null,null,16,null,null,null,null,null,1,null],
            [null,null,null,null,5,null,null,null,null,null,null,15,null,null,null,null],
            [null,14,null,null,null,12,null,null,null,1,null,null,null,null,11,null],
            [null,null,4,null,null,null,null,null,null,null,null,null,null,null,null,null],
            [null,null,null,1,null,null,null,null,null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null,null,null,null,null,null,1,null,null],
            [null,null,null,null,null,null,null,null,null,null,null,null,null,null,4,null],
            [null,11,null,null,null,null,null,null,null,12,null,null,null,14,null,null],
            [null,null,null,null,null,null,15,null,null,null,null,null,null,null,null,null],
            [null,1,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
            [null,null,2,null,null,null,null,null,null,null,null,null,9,null,null,null],
            [null,8,null,null,null,null,null,null,null,3,null,null,null,null,10,null],
            [13,null,null,null,null,null,null,null,null,null,null,null,null,null,null,7],
        ],
        'Hard': [ // This is mostly empty for a true hard challenge
            Array(16).fill(null), Array(16).fill(null), Array(16).fill(null), Array(16).fill(null),
            [null,null,null,null,5,null,null,null,null,null,null,15,null,null,null,null],
            [null,14,null,null,null,12,null,null,null,1,null,null,null,null,11,null],
            Array(16).fill(null), Array(16).fill(null), Array(16).fill(null), Array(16).fill(null),
            [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        ]
    },
    25: {
        'Easy': Array(25).fill(Array(25).fill(null)), // Placeholder for 25x25, extremely complex
        'Medium': Array(25).fill(Array(25).fill(null)),
        'Hard': Array(25).fill(Array(25).fill(null)),
    }
};

const toAlphaNum = (n: number | string | null): string | null => {
    if (n === null) return null;
    if (typeof n === 'string') return n;
    if (n >= 1 && n <= 9) return n.toString();
    if (n >= 10 && n <= 35) return String.fromCharCode(55 + n); // A=10, B=11..
    return '?';
};


const SudokuSolver: React.FC = () => {
    const [size, setSize] = useState<GridSize>(9);
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [board, setBoard] = useState<Board>(puzzles[9].Easy);
    const [initialBoard, setInitialBoard] = useState<Board>(puzzles[9].Easy);
    const [isSolving, setIsSolving] = useState(false);
    const [speed, setSpeed] = useState(1);
    const solverRef = useRef<Generator | null>(null);
    const isSolvingRef = useRef(false);

    useEffect(() => {
        isSolvingRef.current = isSolving;
    }, [isSolving]);

    const resetBoard = useCallback((newSize: GridSize, newDifficulty: Difficulty) => {
        setIsSolving(false);
        let puzzleData = puzzles[newSize]?.[newDifficulty];
        if (!puzzleData || (newSize === 25 && puzzleData.every(row => row.every(cell => cell === null)))) {
            if (newSize === 25) {
                const newBoard = Array(25).fill(null).map(() => Array(25).fill(null));
                for(let i=0; i<25; i++) {
                    newBoard[i][i] = (i % 25) + 1;
                    if(i < 24) newBoard[i][i+1] = ((i+5)%25)+1;
                }
                puzzleData = newBoard;
            } else {
                puzzleData = puzzles[newSize][Object.keys(puzzles[newSize])[0] as Difficulty];
            }
        }
        const newPuzzle = JSON.parse(JSON.stringify(puzzleData));
        setInitialBoard(newPuzzle);
        setBoard(newPuzzle);
    }, []);

    useEffect(() => {
        resetBoard(size, difficulty);
    }, [size, difficulty, resetBoard]);
    
    const isValid = (board: Board, row: number, col: number, num: CellValue, boardSize: number): boolean => {
        if (num === null) return true;
        for (let i = 0; i < boardSize; i++) {
            if ((board[row][i] === num) || (board[i][col] === num)) return false;
        }
        const boxSize = Math.sqrt(boardSize);
        if (!Number.isInteger(boxSize)) return false;
        const startRow = row - (row % boxSize), startCol = col - (col % boxSize);
        for (let i = 0; i < boxSize; i++) {
            for (let j = 0; j < boxSize; j++) {
                if (board[i + startRow][j + startCol] === num) return false;
            }
        }
        return true;
    };

    function* solveGenerator(currentBoard: Board, boardSize: number): Generator<SolveStep, boolean> {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (currentBoard[row][col] === null) {
                    for (let num = 1; num <= boardSize; num++) {
                        if (isValid(currentBoard, row, col, num, boardSize)) {
                            currentBoard[row][col] = num;
                            yield { board: currentBoard.map(r => [...r]), currentRow: row, currentCol: col, status: 'placing' };
                            if (yield* solveGenerator(currentBoard, boardSize)) {
                                return true;
                            }
                            currentBoard[row][col] = null;
                            yield { board: currentBoard.map(r => [...r]), currentRow: row, currentCol: col, status: 'backtracking' };
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    const animateSolve = useCallback(() => {
        if (!isSolvingRef.current || !solverRef.current) {
            setIsSolving(false);
            return;
        }

        const stepsPerFrame = Math.max(1, Math.floor(Math.pow(speed, 2)));
        let result: IteratorResult<SolveStep, boolean> | undefined;

        for (let i = 0; i < stepsPerFrame; i++) {
            result = solverRef.current.next();
            if (result.done) {
                if (result.value) { // Solved successfully
                    // Final board update is already handled by the last yield
                } else {
                    // Could not be solved
                }
                setIsSolving(false);
                return;
            }
        }

        if (result) {
            setBoard(result.value.board);
        }

        requestAnimationFrame(animateSolve);
    }, [speed]);


    const handleSolve = () => {
        setIsSolving(true);
        isSolvingRef.current = true;
        const boardCopy = board.map(r => [...r]);
        solverRef.current = solveGenerator(boardCopy, size);
        requestAnimationFrame(animateSolve);
    };
    
    const boxSize = Math.sqrt(size);

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-full bg-card p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-4xl mx-auto shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2"><Sparkles/>Sudoku Solver</CardTitle>
                    <CardDescription>Visualizing a backtracking algorithm to solve Sudoku puzzles.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    {size === 25 && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Performance Warning</AlertTitle>
                            <AlertDescription>
                                Solving a 25x25 puzzle is computationally intensive and may take a very long time, potentially freezing the browser tab.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className={cn(
                        "grid bg-border/50 border-2 border-border w-fit",
                        size === 25 && "w-full overflow-x-auto"
                    )} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
                        {board.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <div key={`${rowIndex}-${colIndex}`} className={cn(
                                    "flex items-center justify-center font-bold border-border/30",
                                    size === 4 && "w-16 h-16 text-2xl",
                                    size === 9 && "w-10 h-10 text-lg",
                                    size === 16 && "w-7 h-7 text-xs",
                                    size === 25 && "w-6 h-6 text-[0.5rem]",
                                    (rowIndex + 1) % boxSize === 0 && rowIndex < size - 1 ? "border-b-2 border-b-border" : "border-b",
                                    (colIndex + 1) % boxSize === 0 && colIndex < size - 1 ? "border-r-2 border-r-border" : "border-r",
                                    rowIndex === 0 && "border-t-0", colIndex === 0 && "border-l-0",
                                    initialBoard[rowIndex][colIndex] !== null ? "text-foreground bg-muted/20" : "text-primary",
                                )}>
                                    {toAlphaNum(cell)}
                                </div>
                            ))
                        )}
                    </div>
                     <div className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Puzzle Size</Label>
                            <Select onValueChange={(v) => setSize(Number(v) as GridSize)} defaultValue={size.toString()} disabled={isSolving}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="4">4x4</SelectItem>
                                    <SelectItem value="9">9x9</SelectItem>
                                    <SelectItem value="16">16x16</SelectItem>
                                    <SelectItem value="25">25x25</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Difficulty</Label>
                            <Select onValueChange={(v) => setDifficulty(v as Difficulty)} defaultValue={difficulty} disabled={isSolving}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="md:col-span-2">
                             <Label className="flex justify-between">
                                <span>Speed</span>
                                <span>{speed.toFixed(0)}x steps/frame</span>
                             </Label>
                             <Slider min={1} max={100} step={1} value={[speed]} onValueChange={v => setSpeed(v[0])} disabled={isSolving}/>
                        </div>
                    </div>
                     <div className="flex gap-4">
                        <Button onClick={handleSolve} className="w-32" disabled={isSolving}>
                            {isSolving ? <><Pause className="mr-2 h-4 w-4"/>Solving...</> : <><Play className="mr-2 h-4 w-4"/>Solve</>}
                        </Button>
                        <Button onClick={() => resetBoard(size, difficulty)} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4"/>Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SudokuSolver;

