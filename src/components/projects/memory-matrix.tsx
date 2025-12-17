'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BrainCircuit, Play, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type GameState = 'idle' | 'watching' | 'repeating' | 'game-over';
const GRID_SIZE = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MemoryMatrix: React.FC = () => {
    const [sequence, setSequence] = useState<number[]>([]);
    const [playerSequence, setPlayerSequence] = useState<number[]>([]);
    const [gameState, setGameState] = useState<GameState>('idle');
    const [activeTile, setActiveTile] = useState<number | null>(null);
    const [level, setLevel] = useState(0);

    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const startGame = () => {
        setSequence([]);
        setPlayerSequence([]);
        setLevel(1);
        addNewStepToSequence(true);
    };
    
    const addNewStepToSequence = useCallback((isFirstStep = false) => {
        const newStep = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
        const newSequence = isFirstStep ? [newStep] : [...sequence, newStep];
        setSequence(newSequence);
        setPlayerSequence([]);
        setGameState('watching');

        playSequence(newSequence);
    }, [sequence]);

    const playSequence = async (seq: number[]) => {
        await sleep(600);
        for (const tileIndex of seq) {
            if(!isMounted.current) return;
            setActiveTile(tileIndex);
            await sleep(400);
            if(!isMounted.current) return;
            setActiveTile(null);
            await sleep(200);
            if(!isMounted.current) return;
        }
        if (isMounted.current) setGameState('repeating');
    };

    const handlePlayerClick = (tileIndex: number) => {
        if (gameState !== 'repeating') return;

        const newPlayerSequence = [...playerSequence, tileIndex];
        setPlayerSequence(newPlayerSequence);

        // Check if the click was correct
        if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
            setGameState('game-over');
            return;
        }

        // Check if the round is complete
        if (newPlayerSequence.length === sequence.length) {
            setLevel(prev => prev + 1);
            setTimeout(() => addNewStepToSequence(), 1000);
        }
    };
    
    const getStatusMessage = () => {
        switch(gameState) {
            case 'idle': return "Press Start to begin.";
            case 'watching': return "Watch carefully...";
            case 'repeating': return "Your turn...";
            case 'game-over': return `Game Over! You reached level ${level}.`;
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-card p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-md mx-auto shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
                        <BrainCircuit /> Memory Matrix
                    </CardTitle>
                    <CardDescription>Memorize the sequence.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="flex justify-between w-full font-mono text-lg">
                        <span>Level: {level}</span>
                        <span>Sequence: {sequence.length}</span>
                    </div>

                    <div 
                        className="grid gap-2" 
                        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`}}
                    >
                        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
                            <motion.button
                                key={index}
                                onClick={() => handlePlayerClick(index)}
                                disabled={gameState !== 'repeating'}
                                className={cn(
                                    "w-20 h-20 sm:w-24 sm:h-24 rounded-lg transition-colors duration-200",
                                    "bg-muted",
                                    gameState === 'repeating' && "cursor-pointer hover:bg-muted/80",
                                    activeTile === index && "!bg-primary"
                                )}
                                whileTap={gameState === 'repeating' ? { scale: 0.95, backgroundColor: '#4f46e5' } : {}}
                            />
                        ))}
                    </div>

                    <p className="text-muted-foreground h-6">{getStatusMessage()}</p>
                    
                    {gameState === 'idle' || gameState === 'game-over' ? (
                        <Button onClick={startGame} size="lg">
                            {gameState === 'idle' ? <Play className="mr-2 h-5 w-5"/> : <RefreshCw className="mr-2 h-5 w-5"/>}
                            {gameState === 'idle' ? 'Start Game' : 'Play Again'}
                        </Button>
                    ) : (
                        <div className="h-14"/> // Placeholder for button height
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MemoryMatrix;
