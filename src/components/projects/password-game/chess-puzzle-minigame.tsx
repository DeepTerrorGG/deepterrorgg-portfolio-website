
'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const puzzles = [
  { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', bestMove: 'Bb5', description: 'White to play. Develop a piece and control the center.', image: '/password-game/chess1.png' },
  { fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2', bestMove: 'Nf3', description: 'White to play. A standard response to the Sicilian Defense.', image: '/password-game/chess2.png' },
  { fen: 'r1b2rk1/pp1p1ppp/1qn2n2/4p3/4P3/2N1B3/PPPQ1PPP/R3KBNR w KQ - 4 8', bestMove: 'f3', description: 'White to play. Solidify the center and prepare to challenge Black\'s control.', image: '/password-game/chess3.png' },
  { fen: '8/k7/8/8/8/8/1R6/K7 w - - 0 1', bestMove: 'Ra2+', description: 'White to play. A simple checkmate pattern to practice.', image: '/password-game/chess4.png'},
  { fen: '4r3/3k2p1/8/8/8/8/4K3/8 w - - 0 1', bestMove: 'Kf3', description: 'White to play. King and rook endgame technique.', image: '/password-game/chess5.png'},
];


const getPuzzleForDay = () => {
    const today = new Date();
    const dayIndex = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return puzzles[dayIndex % puzzles.length];
};

export const getChessPuzzleSolution = () => getPuzzleForDay().bestMove;

let isSolved = false;
export const isChessPuzzleSolved = () => isSolved;

export const ChessPuzzleMinigame: React.FC = () => {
    const { toast } = useToast();
    const puzzle = useMemo(() => getPuzzleForDay(), []);
    const [guess, setGuess] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    const handleGuess = () => {
        // Normalize guess: remove check/checkmate symbols
        const normalizedGuess = guess.trim().replace(/[+#]/g, '');
        if (normalizedGuess.toLowerCase() === puzzle.bestMove.toLowerCase().replace(/[+#]/g, '')) {
            setIsCorrect(true);
            isSolved = true;
            toast({ title: 'Correct!', description: `The best move is indeed ${puzzle.bestMove}.` });
        } else {
            toast({ title: 'Incorrect', description: 'That\'s not the best move. Try again!', variant: 'destructive' });
        }
    };

    return (
        <div className="bg-muted/30 p-4 rounded-md space-y-3 text-center">
            <p className="text-sm italic">{puzzle.description}</p>
            <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-md overflow-hidden border">
                <Image src={puzzle.image} alt="A chess puzzle position" layout="fill" objectFit="contain" />
            </div>
            <div className="flex gap-2 justify-center">
                <Input 
                    placeholder="Your move"
                    value={guess}
                    onChange={e => setGuess(e.target.value)}
                    disabled={isCorrect}
                    className="w-32"
                />
                <Button onClick={handleGuess} disabled={isCorrect}>Submit</Button>
            </div>
            {isCorrect && <p className="text-center text-sm mt-2 text-green-400">The password rule is now satisfied.</p>}
        </div>
    );
}
