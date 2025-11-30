
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';


type CellValue = number | string | null;
type Board = CellValue[][];
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type GridSize = 4 | 9 | 16 | 25;

const puzzles: Record<GridSize, Record<Difficulty, Board>> = {
    4: {
        'Easy': [
            [null, null, 4, null],
            [3, 4, null, null],
            [null, null, 1, 2],
            [null, 2, null, null]
        ],
        'Medium': [
            [null, null, 2, null],
            [1, null, null, null],
            [null, null, null, 3],
            [null, 4, null, null],
        ],
        'Hard': [
            [4, null, null, null],
            [null, 1, null, null],
            [null, null, 2, null],
            [null, null, null, 3],
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
            [11,5,null,null,null,13,null,8,null,2,null,null,null,1,null,null],
            [null,null,2,null,null,11,1,null,null,15,4,null,null,null,null,null],
            [8,null,null,12,null,null,5,null,11,null,1,null,null,null,14,null],
            [null,null,null,1,null,null,null,3,null,null,null,6,null,null,null,null],
            [null,13,null,null,1,null,null,null,null,5,null,null,null,null,null,9],
            [4,null,11,null,null,null,15,null,null,null,7,null,null,2,null,null],
            [null,null,null,10,null,null,null,7,null,null,null,null,null,null,1,null],
            [null,1,null,null,null,14,null,null,null,null,null,null,null,null,10,13],
            [13,8,null,null,null,null,null,null,null,null,14,null,null,null,2,null],
            [null,9,null,null,null,null,null,null,5,null,null,null,1,null,null,null],
            [null,null,1,null,null,12,null,null,null,16,null,null,null,15,null,7],
            [16,null,null,null,null,null,13,null,null,null,null,2,null,null,9,null],
            [null,null,null,null,null,15,null,null,null,4,null,null,null,14,null,null],
            [null,10,null,null,null,1,null,null,null,3,null,null,12,null,null,2],
            [null,null,null,null,null,9,6,null,null,1,13,null,null,10,null,null],
            [null,11,4,null,null,null,10,null,null,null,16,null,null,null,13,15],
        ],
        'Medium': [
            [null, 1, 2, null, null, 3, null, null, null, 4, null, null, 16, null, null, null],
            [null, null, null, 3, null, null, null, null, null, null, null, 5, 6, null, null, null],
            [null, null, null, null, 11, null, null, 6, null, null, null, null, 15, null, 1, 7],
            [7, 8, null, null, null, null, 13, null, null, null, null, 1, null, null, null, null],
            [null, 10, null, null, 1, null, null, null, null, null, null, null, null, null, null, 8],
            [null, null, null, null, null, 12, null, null, 3, null, null, null, null, 9, null, null],
            [13, 14, null, null, null, null, null, null, null, 7, null, null, null, 5, null, null],
            [null, null, null, null, null, null, 9, null, null, null, 10, null, 2, null, null, null],
            [null, null, null, 1, null, 16, null, null, null, null, 12, null, null, null, null, null],
            [null, null, 10, null, null, null, 11, null, null, null, null, null, null, null, 14, 4],
            [null, null, 7, null, null, null, null, 15, null, null, 13, null, null, null, null, null],
            [16, null, null, null, null, null, null, null, null, null, null, 8, null, null, 10, null],
            [null, null, null, null, null, 13, null, null, 1, null, null, null, null, null, 11, 12],
            [5, 11, null, 6, null, null, null, null, null, 14, null, null, null, null, null, null],
            [null, null, null, 14, 15, null, null, null, null, null, null, null, 7, null, null, null],
            [null, null, null, null, null, 1, null, null, null, 9, null, null, null, 16, 8, null]
        ],
        'Hard': [ 
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
        ]
    },
    25: {
        'Easy': Array(25).fill(null).map(() => Array(25).fill(null)),
        'Medium': Array(25).fill(null).map(() => Array(25).fill(null)),
        'Hard': Array(25).fill(null).map(() => Array(25).fill(null)),
    }
};

const toAlphaNum = (n: number | string | null): string | null => {
    if (n === null) return null;
    if (typeof n === 'string') return n;
    if (n >= 1 && n <= 9) return n.toString();
    if (n >= 10 && n <= 35) return String.fromCharCode(55 + n); // A=10, B=11..
    return '?';
};

const solveWithAlgorithmX = (initialBoard: Board, size: number): Board | null => {
    const boxSize = Math.sqrt(size);
    if (!Number.isInteger(boxSize)) return null;

    const matrix: { r: number, c: number, n: number, row: number[] }[] = [];
    const constraintsCount = size * size * 4;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            for (let n = 1; n <= size; n++) {
                if (initialBoard[r][c] === null || initialBoard[r][c] === n) {
                    const row = Array(constraintsCount).fill(0);
                    const b = Math.floor(r / boxSize) * boxSize + Math.floor(c / boxSize);
                    
                    row[r * size + c] = 1; // Constraint 1: Cell (r, c) is filled
                    row[size * size + r * size + (n - 1)] = 1; // Constraint 2: Number n is in row r
                    row[size * size * 2 + c * size + (n - 1)] = 1; // Constraint 3: Number n is in column c
                    row[size * size * 3 + b * size + (n - 1)] = 1; // Constraint 4: Number n is in box b
                    matrix.push({ r, c, n, row });
                }
            }
        }
    }
    
    class Node {
        L: Node = this; R: Node = this; U: Node = this; D: Node = this;
        C: ColumnNode;
        r?: number; c?: number; n?: number;
        constructor() {
             this.C = null as any; // This will be set later
        }
    }

    class ColumnNode extends Node {
        S: number = 0; N: string;
        constructor(name = '') {
            super();
            this.N = name;
            this.C = this;
        }
    }
    
    const root = new ColumnNode('root');
    const columns: ColumnNode[] = [];
    for (let i = 0; i < constraintsCount; i++) {
        const c = new ColumnNode(i.toString());
        columns.push(c);
        c.L = root.L; c.R = root; root.L.R = c; root.L = c;
    }

    matrix.forEach(matrixRow => {
        let lastNode: Node | null = null;
        matrixRow.row.forEach((value, index) => {
            if (value === 1) {
                const c = columns[index];
                const newNode = new Node();
                newNode.C = c;
                newNode.r = matrixRow.r; newNode.c = matrixRow.c; newNode.n = matrixRow.n;
                newNode.U = c.U; newNode.D = c; c.U.D = newNode; c.U = newNode; c.S++;
                if (lastNode) {
                    newNode.L = lastNode; newNode.R = lastNode.R; lastNode.R.L = newNode; lastNode.R = newNode;
                } else {
                    lastNode = newNode;
                }
            }
        });
    });

    const solutionNodes: Node[] = [];
    const search = (): boolean => {
        if (root.R === root) return true;
        
        let c = root.R as ColumnNode;
        let s = Infinity;
        for (let j = root.R as ColumnNode; j !== root; j = j.R as ColumnNode) {
            if (j.S < s) { s = j.S; c = j; }
        }

        cover(c);
        for (let r = c.D; r !== c; r = r.D) {
            solutionNodes.push(r);
            for (let j = r.R; j !== r; j = j.R) { if (j.C) cover(j.C); }
            if (search()) return true;
            solutionNodes.pop();
            for (let j = r.L; j !== r; j = j.L) { if (j.C) uncover(j.C); }
        }
        uncover(c);
        return false;
    };
    
    const cover = (c: ColumnNode) => {
        c.R.L = c.L; c.L.R = c.R;
        for (let i = c.D; i !== c; i = i.D) {
            for (let j = i.R; j !== i; j = j.R) {
                j.D.U = j.U; j.U.D = j.D;
                if (j.C) j.C.S--;
            }
        }
    };

    const uncover = (c: ColumnNode) => {
        for (let i = c.U; i !== c; i = i.U) {
            for (let j = i.L; j !== i; j = j.L) {
                if (j.C) j.C.S++;
                j.D.U = j; j.U.D = j;
            }
        }
        c.R.L = c; c.L.R = c;
    };
    
    if (search()) {
        const solvedBoard = initialBoard.map(r => [...r]);
        solutionNodes.forEach(node => {
            if (node.r !== undefined && node.c !== undefined && node.n !== undefined) {
                solvedBoard[node.r][node.c] = node.n;
            }
        });
        return solvedBoard;
    }

    return null; // No solution found
};


const SudokuSolver: React.FC = () => {
    const { toast } = useToast();
    const [size, setSize] = useState<GridSize>(9);
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [board, setBoard] = useState<Board>(puzzles[9].Easy);
    const [initialBoard, setInitialBoard] = useState<Board>(puzzles[9].Easy);
    const [isSolving, setIsSolving] = useState(false);

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

    const handleSolve = () => {
        setIsSolving(true);
        setTimeout(() => {
            const solvedBoard = solveWithAlgorithmX(JSON.parse(JSON.stringify(initialBoard)), size);
            if (solvedBoard) {
                setBoard(solvedBoard);
            } else {
                toast({ title: 'No Solution Found', description: 'This puzzle is unsolvable.', variant: 'destructive' });
            }
            setIsSolving(false);
        }, 50);
    };
    
    const boxSize = Math.sqrt(size);

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-full bg-card p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-4xl mx-auto shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2"><Sparkles/>Sudoku Solver</CardTitle>
                    <CardDescription>Using Algorithm X (Dancing Links) to solve Sudoku puzzles instantly.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    {size === 25 && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Performance Warning</AlertTitle>
                            <AlertDescription>
                                Solving a 25x25 puzzle is computationally intensive. While faster, it might still take a moment.
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
                    </div>
                     <div className="flex gap-4">
                        <Button onClick={handleSolve} className="w-32" disabled={isSolving}>
                            {isSolving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <><Play className="mr-2 h-4 w-4"/>Solve</>}
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
