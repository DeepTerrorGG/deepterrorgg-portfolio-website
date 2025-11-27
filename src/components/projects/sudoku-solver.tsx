
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type Board = (number | null)[][];
type SolveStep = { board: Board; currentRow: number; currentCol: number, status: 'placing' | 'backtracking' };

const emptyBoard: Board = Array(9).fill(null).map(() => Array(9).fill(null));

const puzzles = {
    "Easy": [
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
    "Medium": [
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
    "Hard": [
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
};

const SudokuSolver: React.FC = () => {
    const [board, setBoard] = useState<Board>(puzzles.Easy);
    const [initialBoard, setInitialBoard] = useState<Board>(puzzles.Easy);
    const [isSolving, setIsSolving] = useState(false);
    const [speed, setSpeed] = useState(5); // 1-10 scale
    const [currentCell, setCurrentCell] = useState<{row:number, col:number, status: 'placing' | 'backtracking'} | null>(null);

    const solverGenerator = useRef<Generator<SolveStep, boolean> | null>(null);

    const resetBoard = useCallback((puzzleKey: keyof typeof puzzles = "Easy") => {
        setIsSolving(false);
        solverGenerator.current = null;
        const newPuzzle = puzzles[puzzleKey] ? JSON.parse(JSON.stringify(puzzles[puzzleKey])) : JSON.parse(JSON.stringify(puzzles.Easy));
        setInitialBoard(newPuzzle);
        setBoard(newPuzzle);
        setCurrentCell(null);
    }, []);

    useEffect(() => {
        resetBoard();
    }, [resetBoard]);

    const isValid = (board: Board, row: number, col: number, num: number): boolean => {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) return false;
        }
        const startRow = row - (row % 3), startCol = col - (col % 3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i + startRow][j + startCol] === num) return false;
            }
        }
        return true;
    };

    function* solveGenerator(currentBoard: Board): Generator<SolveStep, boolean> {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (currentBoard[row][col] === null) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValid(currentBoard, row, col, num)) {
                            currentBoard[row][col] = num;
                            yield { board: currentBoard.map(r => [...r]), currentRow: row, currentCol: col, status: 'placing' };
                            if (yield* solveGenerator(currentBoard)) {
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
        if (!solverGenerator.current) return;

        const animate = () => {
            if (!isSolvingRef.current) return;
            const result = solverGenerator.current!.next();
            if (!result.done) {
                setBoard(result.value.board);
                setCurrentCell({row: result.value.currentRow, currentCol: result.value.currentCol, status: result.value.status});
                setTimeout(() => requestAnimationFrame(animate), 110 - speed * 10);
            } else {
                setIsSolving(false);
                setCurrentCell(null);
            }
        }
        requestAnimationFrame(animate);

    }, [speed]);

    const isSolvingRef = useRef(isSolving);
    useEffect(() => {
      isSolvingRef.current = isSolving;
      if (isSolving) {
        animateSolve();
      }
    }, [isSolving, animateSolve]);


    const handleSolve = () => {
        setIsSolving(true);
        setCurrentCell(null);
        solverGenerator.current = solveGenerator(board.map(r => [...r]));
    };
    
    const handlePause = () => setIsSolving(false);

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-full bg-card p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-2xl mx-auto shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2"><Sparkles/>Sudoku Solver</CardTitle>
                    <CardDescription>Watch a backtracking algorithm solve Sudoku puzzles.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="grid grid-cols-9 w-fit bg-border/50 border-2 border-border">
                        {board.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <div key={`${rowIndex}-${colIndex}`} className={cn(
                                    "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold border border-border/30 transition-colors duration-150",
                                    (rowIndex + 1) % 3 === 0 && rowIndex < 8 && "border-b-2 border-b-border",
                                    (colIndex + 1) % 3 === 0 && colIndex < 8 && "border-r-2 border-r-border",
                                    initialBoard[rowIndex][colIndex] !== null ? "text-foreground" : "text-primary",
                                    currentCell?.row === rowIndex && currentCell?.col === colIndex && (currentCell.status === 'placing' ? 'bg-green-500/30' : 'bg-red-500/30'),
                                )}>
                                    {cell}
                                </div>
                            ))
                        )}
                    </div>
                     <div className="w-full max-w-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Puzzle Difficulty</Label>
                            <Select onValueChange={(v) => resetBoard(v as keyof typeof puzzles)} defaultValue="Easy" disabled={isSolving}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Easy">Easy</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Visualization Speed</Label>
                            <Slider min={1} max={10} step={1} value={[speed]} onValueChange={v => setSpeed(v[0])} disabled={isSolving}/>
                        </div>
                    </div>
                     <div className="flex gap-4">
                        <Button onClick={isSolving ? handlePause : handleSolve} className="w-32">
                            {isSolving ? <><Pause className="mr-2 h-4 w-4"/>Pause</> : <><Play className="mr-2 h-4 w-4"/>Solve</>}
                        </Button>
                        <Button onClick={() => resetBoard(Object.keys(puzzles).find(k => puzzles[k as keyof typeof puzzles] === initialBoard) as keyof typeof puzzles || "Easy")} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4"/>Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SudokuSolver;
